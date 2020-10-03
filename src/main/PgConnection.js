import { Client } from 'pg';

export default class PgConnection {
  constructor(config) {
    this.client = new Client(config);
  }

  async connect() {
    await this.client.connect();
  }
}
