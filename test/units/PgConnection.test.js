const { default: PgConnection } = require("../../src/main/PgConnection");

jest.mock('pg');

const ID_STRUCTURE = () => ({
  primaryKey: 'key',
  table: {
    schema: 'public',
    name: 'foo'
  }
});

const NO_ID_STRUCTURE = () => ({
  primaryKey: null,
  table: {
    schema: 'public',
    name: 'foo'
  }
});

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

      let sql = new PgConnection().generateChangeQuery(changes, ID_STRUCTURE());
      
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

      let sql = new PgConnection().generateChangeQuery(changes, ID_STRUCTURE());

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

      let sql = new PgConnection().generateChangeQuery(changes, ID_STRUCTURE());

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

      let sql = new PgConnection().generateChangeQuery(changes, ID_STRUCTURE());

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

      let sql = new PgConnection().generateChangeQuery(changes, ID_STRUCTURE());

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

      let sql = new PgConnection().generateChangeQuery(changes, NO_ID_STRUCTURE());

      expect(sql).toEqual(
        `UPDATE "public"."foo" SET "baz"='W'`+
        ` WHERE ctid IN (SELECT ctid FROM "public"."foo" WHERE "bar"='A' AND "baz"='Z' LIMIT 1 FOR UPDATE);\n` +
        `DELETE FROM "public"."foo"`+
        ` WHERE ctid IN (SELECT ctid FROM "public"."foo" WHERE "bar"='B' AND "baz"='Y' LIMIT 1 FOR UPDATE)` +
        ` OR ctid IN (SELECT ctid FROM "public"."foo" WHERE "bar"='C' AND "baz" IS NULL LIMIT 1 FOR UPDATE);`);
    });
  });

  describe('generateTableChangeQuery', () => {
    it('generates alter queries', () => {
      let changes = {
        table: {
          schema: 'public',
          name: 'foo',
        },
        tableChanges: {
          schema: 'private',
          name: 'bar',
        },
        columnChanges: [
          { type: 'rename', column: 'baz', newName: 'qux' },
          { type: 'changeType', column: 'qux', newType: 'integer' },
          { type: 'changeDefault', column: 'qux', newDefault: '7', newDefaultType: 'expression' },
          { type: 'changeDefault', column: 'norf', newDefault: 'asdf', newDefaultType: 'constant' },
          { type: 'changeDefault', column: 'plop', newDefault: 'qwer', newDefaultType: 'sequence' },
          { type: 'removeDefault', column: 'wat' },
        ],
        constraintChanges: [
          { type: 'remove', constraintType: 'primary', constraint: 'baz_pkey', column: 'baz' },
          { type: 'remove', constraintType: 'not_null', constraint: '', column: 'baz' },
          { type: 'rename', constraint: 'qux_check', newName: 'qux_validation' },
        ]
      };

      let sql = new PgConnection().generateTableChangeQuery(changes, ID_STRUCTURE());

      expect(sql).toEqual(
        `ALTER TABLE "public"."foo" RENAME TO "bar";\n` +
        `ALTER TABLE "public"."bar" SET SCHEMA "private";\n` +
        `ALTER TABLE "private"."bar" RENAME COLUMN "baz" TO "qux";\n` +
        `ALTER TABLE "private"."bar" ALTER COLUMN "qux" TYPE integer;\n` +
        `ALTER TABLE "private"."bar" ALTER COLUMN "qux" SET DEFAULT 7;\n` +
        `ALTER TABLE "private"."bar" ALTER COLUMN "norf" SET DEFAULT 'asdf';\n` +
        `ALTER TABLE "private"."bar" ALTER COLUMN "plop" SET DEFAULT nextval('qwer'::regclass);\n` +
        `ALTER TABLE "private"."bar" ALTER COLUMN "wat" DROP DEFAULT;\n` +
        `ALTER TABLE "private"."bar" DROP CONSTRAINT "baz_pkey";\n` +
        `ALTER TABLE "private"."bar" ALTER COLUMN "baz" DROP NOT NULL;\n` +
        `ALTER TABLE "private"."bar" RENAME CONSTRAINT "qux_check" TO "qux_validation";`
      );
      // TODO: more constraints
    });

    it('generates queries to remove columns', () => {
      let changes = {
        table: {
          schema: 'public',
          name: 'foo',
        },
        tableChanges: {},
        columnChanges: [
          { type: 'remove', column: 'baz' },
        ],
        constraintChanges: [],
      };

      let sql = new PgConnection().generateTableChangeQuery(changes, ID_STRUCTURE());
      expect(sql).toEqual(
        `ALTER TABLE "public"."foo" DROP COLUMN "baz";`
      );
    });

    it('generates queries to add columns', () => {
      let changes = {
        table: {
          schema: 'public',
          name: 'foo',
        },
        tableChanges: {},
        columnChanges: [
          { type: 'add', column: 'qux', dataType: 'text' },
          { type: 'add', column: 'norf', dataType: 'integer', defaultValue: '7', defaultType: 'expression' },
          { type: 'add', column: 'wat', dataType: 'text', defaultValue: 'asdf', defaultType: 'constant' },
          { type: 'add', column: 'plop', dataType: 'character varying', defaultValue: 'qwer', defaultType: 'sequence' },
        ],
        constraintChanges: [
          { type: 'add', constraintType: 'not_null', constraint: '', column: 'qux' },
          { type: 'add', constraintType: 'primary', constraint: 'foo_pkey', column: 'qux' },
          { type: 'add', constraintType: 'unique', constraint: 'foo_qux_key', column: 'qux' },
          { type: 'add', constraintType: 'foreign', constraint: 'foo_norf_fkey', column: 'norf', toSchema: 'public', toTable: 'bar', toColumn: 'id' },
          { type: 'add', constraintType: 'check', constraint: 'foo_wat_check', column: 'wat', expression: "wat != 'plop'" },
        ]
      };

      let sql = new PgConnection().generateTableChangeQuery(changes, ID_STRUCTURE());
      expect(sql).toEqual(
        `ALTER TABLE "public"."foo" ADD COLUMN "qux" text;\n` +
        `ALTER TABLE "public"."foo" ADD COLUMN "norf" integer DEFAULT 7;\n` +
        `ALTER TABLE "public"."foo" ADD COLUMN "wat" text DEFAULT 'asdf';\n` +
        `ALTER TABLE "public"."foo" ADD COLUMN "plop" character varying DEFAULT nextval('qwer'::regclass);\n` +
        `ALTER TABLE "public"."foo" ALTER COLUMN "qux" SET NOT NULL;\n` +
        `ALTER TABLE "public"."foo" ADD PRIMARY KEY ("qux");\n` +
        `ALTER TABLE "public"."foo" ADD UNIQUE ("qux");\n` +
        `ALTER TABLE "public"."foo" ADD CONSTRAINT "foo_norf_fkey" FOREIGN KEY ("norf") REFERENCES "public"."bar"("id");\n` +
        `ALTER TABLE "public"."foo" ADD CHECK (wat != 'plop');`
      );
    });
  });
});
