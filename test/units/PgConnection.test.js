const { default: PgConnection } = require("../../src/main/PgConnection");

jest.mock('pg');

const ID_STRUCTURE = {
  primaryKey: 'key',
  table: {
    schema: 'public',
    name: 'foo'
  }
};

const NO_ID_STRUCTURE = {
  primaryKey: null,
  table: {
    schema: 'public',
    name: 'foo'
  }
}

describe('PgConnection', () => {
  describe('generateChangeQuery', () => {
    it('generates update queries', () => {
      let changes = {
        table: {
          schema: 'public',
          name: 'foo'
        },
        updates: [{
          row: { key: 1234 },
          changes: { bar: 'baz' }
        }]
      }

      let sql = new PgConnection().generateChangeQuery(changes, ID_STRUCTURE);
      
      expect(sql).toEqual(`UPDATE "public"."foo" SET "bar"='baz' WHERE "key"=1234;`);
    });

    it('generates delete queries', () => {
      let changes = {
        table: {
          schema: 'public',
          name: 'foo'
        },
        deletes: [{ key: 1234 }, { key: 2345 }]
      }

      let sql = new PgConnection().generateChangeQuery(changes, ID_STRUCTURE);

      expect(sql).toEqual(`DELETE FROM "public"."foo" WHERE "key"=1234 OR "key"=2345;`);
    });

    it('generates insert queries', () => {
      let changes = {
        table: {
          schema: 'public',
          name: 'foo'
        },
        inserts: [
          { bar: 'A', baz: 'B' },
          { bar: 'C', baz: 'D' }
        ]
      }

      let sql = new PgConnection().generateChangeQuery(changes, ID_STRUCTURE);

      expect(sql).toEqual(`INSERT INTO "public"."foo"("bar", "baz") VALUES('A', 'B');\n`+
                          `INSERT INTO "public"."foo"("bar", "baz") VALUES('C', 'D');`);
    });

    it('generates insert query with all defaults', () => {
      let changes = {
        table: {
          schema: 'public',
          name: 'foo'
        },
        inserts: [
          {}
        ]
      }

      let sql = new PgConnection().generateChangeQuery(changes, ID_STRUCTURE);

      expect(sql).toEqual(`INSERT INTO "public"."foo" VALUES(DEFAULT);`);
    });

    it('generates combination of queries', () => {
      let changes = {
        table: {
          schema: 'public',
          name: 'foo'
        },
        updates: [{
          row: { key: 1234 },
          changes: { bar: 'baz' }
        }],
        deletes: [{ key: 1234 }, { key: 2345 }],
        inserts: [
          { bar: 'A', baz: 'B' },
          { bar: 'C', baz: 'D' }
        ]
      }

      let sql = new PgConnection().generateChangeQuery(changes, ID_STRUCTURE);

      expect(sql).toEqual(`UPDATE "public"."foo" SET "bar"='baz' WHERE "key"=1234;\n`+
                          `DELETE FROM "public"."foo" WHERE "key"=1234 OR "key"=2345;\n`+
                          `INSERT INTO "public"."foo"("bar", "baz") VALUES('A', 'B');\n` +
                          `INSERT INTO "public"."foo"("bar", "baz") VALUES('C', 'D');`);
    });

    it('handles table with no id', () => {
      let changes = {
        table: {
          schema: 'public',
          name: 'foo'
        },
        updates: [{
          row: { bar: 'A', baz: 'Z' },
          changes: { baz: 'W' }
        }],
        deletes: [
          { bar: 'B', baz: 'Y' },
          { bar: 'C', baz: null }
        ]
      }

      let sql = new PgConnection().generateChangeQuery(changes, NO_ID_STRUCTURE);

      expect(sql).toEqual(
        `UPDATE "public"."foo" SET "baz"='W'`+
        ` WHERE ctid IN (SELECT ctid FROM "public"."foo" WHERE "bar"='A' AND "baz"='Z' LIMIT 1 FOR UPDATE);\n` +
        `DELETE FROM "public"."foo"`+
        ` WHERE ctid IN (SELECT ctid FROM "public"."foo" WHERE "bar"='B' AND "baz"='Y' LIMIT 1 FOR UPDATE)` +
        ` OR ctid IN (SELECT ctid FROM "public"."foo" WHERE "bar"='C' AND "baz" IS NULL LIMIT 1 FOR UPDATE);`);
    });
  });
});
