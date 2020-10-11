import { Client } from 'pg';
import { v4 as uuid } from 'uuid';

import buildWhereFromFilters from './buildWhereFromFilter';

const CONNECTIONS = {};

export default class PgConnection {
  constructor(config) {
    this.client = new Client(config);
    this.id = uuid();
    CONNECTIONS[this.id] = this;
  }

  async connect() {
    await this.client.connect();
  }

  async fetchTables() {
    let result = await this.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    return result.rows.map(row => ({
      name: row.table_name,
      type: row.table_type
    }));
  }

  async fetchData(table, { offset = 0, limit = 1000, filters = null } = {}) {
    let structure = await this.fetchStructure(table);

    let where = buildWhereFromFilters(filters, structure);

    let result = await this.query({
      text: `
        SELECT COUNT(*) as count FROM ${table} ${where};
      `
    });

    let count = result.rows[0].count;

    result = await this.query({
      text: `
        SELECT * FROM ${table}
        ${where}
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
    let result = await this.query({
      text: `
        SELECT c.column_name, c.data_type, c.column_default, c.is_nullable
        FROM information_schema.columns as c
        WHERE c.table_schema = $1
        AND c.table_name = $2;
      `,
      values: ['public', table]
    });

    let pkeysResult = await this.query({
      text: `
        SELECT kcu.column_name AS key_column
        FROM information_schema.table_constraints tco
        JOIN information_schema.key_column_usage kcu 
            ON kcu.constraint_name = tco.constraint_name
            AND kcu.constraint_schema = tco.constraint_schema
            AND kcu.constraint_name = tco.constraint_name
            AND kcu.table_schema = $1
            AND kcu.table_name = $2
        WHERE tco.constraint_type = 'PRIMARY KEY'
        LIMIT 1;
      `,
      values: ['public', table]
    });

    let primaryKey = null;
    if (pkeysResult.rows.length === 1) {
      primaryKey = pkeysResult.rows[0].key_column;
    }

    return {
      schema: 'public',
      table,
      primaryKey,
      columns: result.rows.map(row => {
        let constraints = [];

        if (row.column_name === primaryKey) constraints.push('PRIMARY KEY');
        if (row.is_nullable === 'NO') constraints.push('NOT NULL');

        return {
          name: row.column_name,
          type: row.data_type,
          defaultValue: row.column_default,
          constraints,
          isStringish:
            row.data_type == "string" ||
            row.data_type == "text" ||
            row.data_type == "character varying"
        };
      })
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
      return `UPDATE "${structure.schema}"."${structure.table}" SET ${changes} WHERE ${where};`;
    }).join("\n")
  }

  generateDeleteQuery(deletes, structure) {
    if (!deletes || deletes.length === 0) return null;

    let where = deletes.map(({ row }) => this.identifyConditions(row, structure))
      .join(' OR ');

    return `DELETE FROM "${structure.schema}"."${structure.table}" WHERE ${where};`;
  }

  generateInsertQuery(inserts, structure) {
    if (!inserts || inserts.length === 0) return null;

    return inserts.map(insert => {
      let values = ' VALUES(DEFAULT)';
      let columns = Object.keys(insert);
      if (columns.length > 0) {
        values = `(${columns.map(c => `"${c}"`).join(', ')}) VALUES(${columns.map(c => `'${insert[c]}'`).join(', ')})`;
      }
      return `INSERT INTO "${structure.schema}"."${structure.table}"${values};`;
    }).join("\n");
  }

  identifyConditions(row, structure) {
    if (structure.primaryKey) return `"${structure.primaryKey}"=${row[structure.primaryKey]}`;
    let rowConditions = Object.entries(row).map(([col, value]) => `"${col}"='${value}'`).join(' AND ');
    return `ctid IN (SELECT ctid FROM "${structure.schema}"."${structure.table}" WHERE ${rowConditions} LIMIT 1 FOR UPDATE)`;
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
