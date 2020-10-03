import { Client } from 'pg';
import { v4 as uuid } from 'uuid';

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

  static find(id) {
    return CONNECTIONS[id];
  }
}
