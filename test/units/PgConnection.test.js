const { default: PgConnection } = require("../../src/main/PgConnection");

jest.mock('pg');

const ID_SCTRUCTURE = {
  primaryKey: 'key',
  schema: 'public',
  table: 'foo',
};

const NO_ID_STRUCTURE = {
  primaryKey: null,
  schema: 'public',
  table: 'foo',
}

describe('PgConnection', () => {
  describe('generateChangeQuery', () => {
    it('generates update queries', () => {
      let changes = {
        schema: 'public',
        table: 'foo',
        updates: [{
          row: { key: 1234 },
          changes: { bar: 'baz' }
        }]
      }

      let sql = new PgConnection().generateChangeQuery(changes, ID_SCTRUCTURE);
      
      expect(sql).toEqual(`UPDATE "public"."foo" SET "bar"='baz' WHERE "key"=1234;`);
    });

    it('generates delete queries', () => {
      let changes = {
        schema: 'public',
        table: 'foo',
        deletes: [{ row: { key: 1234 } }, { row: { key: 2345 } }]
      }

      let sql = new PgConnection().generateChangeQuery(changes, ID_SCTRUCTURE);

      expect(sql).toEqual(`DELETE FROM "public"."foo" WHERE "key"=1234 OR "key"=2345;`);
    });

    it('generates insert queries', () => {
      let changes = {
        schema: 'public',
        table: 'foo',
        inserts: [
          { bar: 'A', baz: 'B' },
          { bar: 'C', baz: 'D' }
        ]
      }

      let sql = new PgConnection().generateChangeQuery(changes, ID_SCTRUCTURE);

      expect(sql).toEqual(`INSERT INTO "public"."foo"("bar", "baz") VALUES('A', 'B');\n`+
                          `INSERT INTO "public"."foo"("bar", "baz") VALUES('C', 'D');`);
    });

    it('generates insert query with all defaults', () => {
      let changes = {
        schema: 'public',
        table: 'foo',
        inserts: [
          {}
        ]
      }

      let sql = new PgConnection().generateChangeQuery(changes, ID_SCTRUCTURE);

      expect(sql).toEqual(`INSERT INTO "public"."foo" VALUES(DEFAULT);`);
    });

    it('generates combination of queries', () => {
      let changes = {
        schema: 'public',
        table: 'foo',
        updates: [{
          row: { key: 1234 },
          changes: { bar: 'baz' }
        }],
        deletes: [{ row: { key: 1234 } }, { row: { key: 2345 } }],
        inserts: [
          { bar: 'A', baz: 'B' },
          { bar: 'C', baz: 'D' }
        ]
      }

      let sql = new PgConnection().generateChangeQuery(changes, ID_SCTRUCTURE);

      expect(sql).toEqual(`UPDATE "public"."foo" SET "bar"='baz' WHERE "key"=1234;\n`+
                          `DELETE FROM "public"."foo" WHERE "key"=1234 OR "key"=2345;\n`+
                          `INSERT INTO "public"."foo"("bar", "baz") VALUES('A', 'B');\n` +
                          `INSERT INTO "public"."foo"("bar", "baz") VALUES('C', 'D');`);
    });

    it('handles table with no id', () => {
      let changes = {
        schema: 'public',
        table: 'foo',
        updates: [{
          row: { bar: 'A', baz: 'Z' },
          changes: { baz: 'W' }
        }],
        deletes: [
          { row: { bar: 'B', baz: 'Y' } },
          { row: { bar: 'C', baz: 'X' } }
        ]
      }

      let sql = new PgConnection().generateChangeQuery(changes, NO_ID_STRUCTURE);

      expect(sql).toEqual(
        `UPDATE "public"."foo" SET "baz"='W'`+
        ` WHERE ctid IN (SELECT ctid FROM "public"."foo" WHERE "bar"='A' AND "baz"='Z' LIMIT 1 FOR UPDATE);\n` +
        `DELETE FROM "public"."foo"`+
        ` WHERE ctid IN (SELECT ctid FROM "public"."foo" WHERE "bar"='B' AND "baz"='Y' LIMIT 1 FOR UPDATE)` +
        ` OR ctid IN (SELECT ctid FROM "public"."foo" WHERE "bar"='C' AND "baz"='X' LIMIT 1 FOR UPDATE);`);
    });
  });
});
