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

    return {
      columns: result.rows.map(row => {
        let constraints = [];

        if (row.is_nullable) constraints.push('NOT NULL');

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
