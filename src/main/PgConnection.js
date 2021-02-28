import { Client } from 'pg';
import { v4 as uuid } from 'uuid';

import buildWhereFromFilters from './buildWhereFromFilter';

const CONNECTIONS = {};

const INDEXDEF_RGX = /^CREATE (UNIQUE )?INDEX .+ ON .+ USING (.+) \((.+)\)$/;
const PKEY_RGX = /^Y KEY \((.+)\)$/;
const FKEY_RGX = /^N KEY \((.+)\) REFERENCES (.+)\((.+)\)$/;
const UNIQ_RGX = /^\((.+)\)$/;
const CHECK_RGX = /^\(\((.+)\)\)$/;


/**
 * @param {string} s
 * @returns {string}
 */
function dq(s) {
  return s.replace(/^"(.+)"$/, '$1').replace(/""/g, '"');
}

export default class PgConnection {
  constructor(config = {}) {
    this.config = config;
    this.client = new Client(config);
    this.id = uuid();
    this.favouriteId = config.favouriteId;
    CONNECTIONS[this.id] = this;
  }

  get host() {
    return this.client.host;
  }

  get database() {
    return this.client.database;
  }

  async connect() {
    await this.client.connect();
    this.version = await this.getServerVersion();
  }

  async getServerVersion() {
    let result = await this.client.query('SHOW server_version;')
    return result.rows[0].server_version;
  }

  async fetchDatabases() {
    let result = await this.client.query(`
      SELECT datname FROM pg_database
      WHERE datistemplate = false;
    `);

    return result.rows.map(x => x.datname);
  }

  async useDatabase(database) {
    await this.client.end();
    this.client = new Client({ ...this.config, database });
    await this.client.connect();
  }

  async fetchTables(database) {
    await this.connectToDatabase(database);

    let publicTables = await this.fetchPublicTables();
    let otherTables = await this.fetchOtherTables();

    return {
      publicTables: publicTables,
      otherSchemas: otherTables
    };
  }

  async connectToDatabase(database) {
    if (database === this.database) return;

    await this.useDatabase(database);
  }

  async fetchPublicTables() {
    let result = await this.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    return result.rows.map(row => ({
      id: uuid(),
      name: row.table_name,
      type: row.table_type,
      schema: 'public'
    }));
  }

  async fetchOtherTables() {
    let result = await this.query(`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables
      WHERE table_schema != 'public'
      ORDER BY table_schema, table_name
    `);

    let schemas = [];

    result.rows.forEach(row => {
      let schema = schemas.find(s => s.name === row.table_schema);
      if (!schema) {
        schema = { name: row.table_schema, tables: [] };
        schemas.push(schema);
      }

      schema.tables.push({
        id: uuid(),
        name: row.table_name,
        type: row.table_type,
        schema: row.table_schema
      });
    });

    return schemas;
  }

  async fetchData(table, { offset = 0, limit = 1000, filters = null } = {}) {
    let structure = await this.fetchStructure(table);

    let where = buildWhereFromFilters(filters, structure);

    let result = await this.query({
      text: `
        SELECT COUNT(*) as count FROM ${this.fullTable(table)} ${where};
      `
    });

    let count = result.rows[0].count;

    let orderBy = '';

    if (structure.table.type !== 'VIEW') {
      let orderByColumn = 'ctid';
      if (structure.primaryKey) orderByColumn = structure.primaryKey;
      orderBy = `ORDER BY "${orderByColumn}" ASC`
    }

    result = await this.query({
      text: `
        SELECT * FROM ${this.fullTable(table)}
        ${where}
        ${orderBy}
        LIMIT $1
        OFFSET $2;
      `,
      values: [limit, offset],
      rowMode: 'array'
    });

    return {
      fields: result.fields.map(field => field.name),
      rows: result.rows,
      count,
      structure
    };
  }

  async fetchStructure(table) {
    let tableResult = await this.query(`
      SELECT table_type
      FROM information_schema.tables
      WHERE table_schema = '${table.schema}'
      AND table_name = '${table.name}'
    `);

    let type = tableResult.rows[0].table_type;

    let result = await this.query({
      text: `
        SELECT c.column_name, c.data_type, c.udt_name, c.column_default, c.is_nullable
        FROM information_schema.columns as c
        WHERE c.table_schema = $1
        AND c.table_name = $2;
      `,
      values: [table.schema, table.name]
    });

    let conResults = await this.query({
      text: `
        SELECT
          c.conname::information_schema.sql_identifier AS name,
              c.contype AS type,
              "substring"(pg_get_constraintdef(c.oid), 7)::information_schema.character_data AS clause
        FROM pg_namespace nc,
          pg_namespace nr,
          pg_constraint c,
          pg_class r
        WHERE nc.oid = c.connamespace
          AND nr.oid = r.relnamespace
          AND c.conrelid = r.oid
          AND nr.nspname = $1
          AND r.relname = $2
          AND (c.contype <> ALL (ARRAY['t'::"char", 'x'::"char"]))
          AND (r.relkind = ANY (ARRAY['r'::"char", 'p'::"char"]))
          AND NOT pg_is_other_temp_schema(nr.oid)
          AND (pg_has_role(r.relowner, 'USAGE'::text)
            OR has_table_privilege(r.oid, 'INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'::text)
            OR has_any_column_privilege(r.oid, 'INSERT, UPDATE, REFERENCES'::text))
      `,
      values: [table.schema, table.name]
    });

    let tableConstraints = conResults.rows.map((con => this.parseConstraint(con)));
    let primaryCon = tableConstraints.find(con => con.type === 'primary');
    let primaryKey = primaryCon ? primaryCon.column : null;

    let columnRgx = new RegExp(`(?:^|\\W)(${result.rows.map(c => c.column_name).join('|')})(?:\\W|$)`)
    tableConstraints.filter(con => con.type === 'check').forEach(con => {
      let match = con.expression.match(columnRgx);
      if (match) con.column = dq(match[1]);
    });

    let indexResult = await this.query({
      text: `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = $1
        AND tablename = $2;
      `,
      values: [table.schema, table.name]
    });

    return {
      table: { ...table, type },
      primaryKey,
      columns: result.rows.map(row => {
        let constraints = tableConstraints.filter(con => con.column === row.column_name);

        if (row.is_nullable === 'NO' && row.column_name !== primaryKey) {
          constraints.push({ type: 'not_null' });
        }

        let dataType = row.data_type;
        if (dataType === 'USER-DEFINED') dataType = row.udt_name;
        let defaultValue = row.column_default;
        let defaultType = 'expression';
        let constRgx = new RegExp(`^'(.*)'::${dataType}$`);
        let seqRgx = new RegExp("^nextval\\('(.+)'::regclass\\)$")
        if (defaultValue) {
          let match;
          // eslint-disable-next-line no-cond-assign
          if (match = defaultValue.match(constRgx)) {
            defaultValue = match[1];
            defaultType = 'constant';
          // eslint-disable-next-line no-cond-assign
          } else if (match = defaultValue.match(seqRgx)) {
            defaultValue = match[1];
            defaultType = 'sequence';
          }
        } else {
          defaultType = null;
        }

        return {
          name: row.column_name,
          type: dataType,
          defaultType,
          defaultValue,
          constraints,
          isStringish:
            dataType == "string" ||
            dataType == "text" ||
            dataType == "character varying"
        };
      }),
      indexes: indexResult.rows.map(row => {
        return {
          name: row.indexname,
          ...this.parseIndexDefinition(row.indexdef, primaryKey)
        };
      })
    };
  }

  parseConstraint({ name, type, clause }) {
    switch (type) {
      case 'p': {
        let [, column] = clause.trim().match(PKEY_RGX);
        return { type: 'primary', name, column };
      }
      case 'f': {
        let [, column, foreignTable, foreignColumn] = clause.trim().match(FKEY_RGX);
        return { type: 'foreign', name, column: dq(column), foreignTable: dq(foreignTable), foreignColumn: dq(foreignColumn) };
      }
      case 'u': {
        let [, column] = clause.trim().match(UNIQ_RGX);
        return { type: 'unique', name, column };
      }
      case 'c': {
        let [, expression] = clause.trim().match(CHECK_RGX);
        return { type: 'check', name, expression };
      }
    }
  }

  /**
   * 
   * @param {String} indexdef 
   */
  parseIndexDefinition(indexdef, primaryKey) {
    let match = indexdef.match(INDEXDEF_RGX);
    if (!match) throw new Error(`'${indexdef}' is a funky index definition!`);

    let [, unique, method, columns] = match;

    columns = columns.split(',').map(x => dq(x.trim()));

    let type = 'index';
    if (unique) {
      if (columns.length === 1 && columns[0] === primaryKey) {
        type = 'primary';
      } else {
        type = 'unique';
      }
    }

    return {
      type,
      method,
      columns,
    };
  }

  async performChanges(changes) {
    let sql = await this.generateChangeQueryForChanges(changes);

    await this.query(sql);
    return true;
  }

  async generateChangeQueryForChanges(changes) {
    let structure = await this.fetchStructure(changes.table);

    return this.generateChangeQuery(changes, structure);
  }

  generateChangeQuery(changes, structure) {
    return [
      this.generateUpdateQuery(changes.updates, structure),
      this.generateDeleteQuery(changes.deletes, structure),
      this.generateInsertQuery(changes.inserts, structure),
    ].filter(x => x).join("\n");
  }

  generateUpdateQuery(updates, structure) {
    if (!updates || updates.length === 0) return null;

    return updates.map(update => {
      let changes = Object.entries(update.changes).map(([col, value]) => `"${col}"='${value}'`).join(', ');
      let where = this.identifyConditions(update.row, structure);
      return `UPDATE ${this.fullTable(structure.table)} SET ${changes} WHERE ${where};`;
    }).join("\n")
  }

  generateDeleteQuery(deletes, structure) {
    if (!deletes || deletes.length === 0) return null;

    let where = deletes.map(row => this.identifyConditions(row, structure))
      .join(' OR ');

    return `DELETE FROM ${this.fullTable(structure.table)} WHERE ${where};`;
  }

  generateInsertQuery(inserts, structure) {
    if (!inserts || inserts.length === 0) return null;

    return inserts.map(insert => {
      let values = ' VALUES(DEFAULT)';
      let columns = Object.keys(insert);
      if (columns.length > 0) {
        values = `(${columns.map(c => `"${c}"`).join(', ')}) VALUES(${columns.map(c => `'${insert[c]}'`).join(', ')})`;
      }
      return `INSERT INTO ${this.fullTable(structure.table)}${values};`;
    }).join("\n");
  }

  identifyConditions(row, structure) {
    if (structure.primaryKey) return `"${structure.primaryKey}"=${row[structure.primaryKey]}`;
    let rowConditions = Object.entries(row).map(([col, value]) => this.columnEqualsValue(col, value)).join(' AND ');
    return `ctid IN (SELECT ctid FROM ${this.fullTable(structure.table)} WHERE ${rowConditions} LIMIT 1 FOR UPDATE)`;
  }

  columnEqualsValue(col, value) {
    if (!value) {
      return `"${col}" IS NULL`;
    } else {
      return `"${col}"='${value}'`;
    }
  }

  async performTableChanges(changes) {
    let sql = await this.generateTableChangeQueryForChanges(changes);

    await this.query(sql);
    return true;
  }

  async generateTableChangeQueryForChanges(changes) {
    let structure = await this.fetchStructure(changes.table);

    return this.generateTableChangeQuery(changes, structure);
  }

  generateTableChangeQuery(changes, structure) {
    let queries = [];

    if (changes.tableChanges.name) {
      queries.push(`ALTER TABLE ${this.fullTable(structure.table)} RENAME TO "${changes.tableChanges.name}";`);
      structure.table.name = changes.tableChanges.name;
    }
    if (changes.tableChanges.schema) {
      queries.push(`ALTER TABLE ${this.fullTable(structure.table)} SET SCHEMA "${changes.tableChanges.schema}";`);
      structure.table.schema = changes.tableChanges.schema;
    }
    // TODO: change tablespace?

    changes.columnChanges.forEach(change => {
      switch (change.type) {
        case 'rename':
          queries.push(`ALTER TABLE ${this.fullTable(structure.table)} RENAME COLUMN "${change.column}" TO "${change.newName}";`);
          break;
        case 'changeType':
          queries.push(`ALTER TABLE ${this.fullTable(structure.table)} ALTER COLUMN "${change.column}" TYPE ${change.newType};`);
          break;
        case 'changeDefault': {
          queries.push(`ALTER TABLE ${this.fullTable(structure.table)} ALTER COLUMN "${change.column}" SET DEFAULT ${this.formatDefaultValue(change.newDefault, change.newDefaultType)};`);
          break;
        }
        case 'removeDefault':
          queries.push(`ALTER TABLE ${this.fullTable(structure.table)} ALTER COLUMN "${change.column}" DROP DEFAULT;`);
          break;
        case 'remove':
          queries.push(`ALTER TABLE ${this.fullTable(structure.table)} DROP COLUMN "${change.column}";`);
          break;
        case 'add': {
          let q = `ALTER TABLE ${this.fullTable(structure.table)} ADD COLUMN "${change.column}" ${change.dataType}`;
          if (change.defaultValue) {
            q += ` DEFAULT ${this.formatDefaultValue(change.defaultValue, change.defaultType)}`;
          }
          queries.push(q + ';');
          break;
        }
      }
    });

    // TODO: indexes

    return queries.join("\n");
  }

  formatDefaultValue(value, type) {
    switch (type) {
      case 'constant':
        return `'${value}'`;
      case 'sequence':
        return `nextval('${value}'::regclass)`;
      default:
        return value;
    }
  }

  fullTable({ name, schema }) {
    return `"${schema}"."${name}"`;
  }

  query(...args) {
    console.log("--- RUNNING QUERY ---");
    console.log(args);
    return this.client.query(...args);
  }

  /**
   * @param {string} id The id of the connection
   * @returns {PgConnection?} The connection matching the id, null if not found
   */
  static find(id) {
    return CONNECTIONS[id];
  }
}
