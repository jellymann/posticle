import buildWhereFromFilter from '../../src/main/buildWhereFromFilter';

describe('buildWhereFromFilter', () => {
  const STRUCTURE = {
    columns: [
      { name: 'id' },
      { name: 'name', isStringish: true }
    ]
  };

  it('handles no filter(s)', () => {
    expect(buildWhereFromFilter(null, STRUCTURE)).toBe('');
    expect(buildWhereFromFilter([], STRUCTURE)).toBe('');
  });

  it('handles binary operator', () => {
    let filter = {
      column: { name: 'id' },
      operator: 'GreaterThanOp',
      text: '7'
    }
    expect(buildWhereFromFilter([filter], STRUCTURE))
      .toBe(`WHERE ("id" > '7')`);
  });

  it('handles unary operator', () => {
    let filter = {
      column: { name: 'name' },
      operator: 'IsNotNullOp',
      text: ''
    }
    expect(buildWhereFromFilter([filter], STRUCTURE))
      .toBe('WHERE ("name" IS NOT NULL)');
  });

  it('handles like operator', () => {
    let filter = {
      column: { name: 'name' },
      operator: 'ContainsOp',
      text: 'foo'
    }
    expect(buildWhereFromFilter([filter], STRUCTURE))
      .toBe(`WHERE ("name" ILIKE '%foo%')`);
  });

  it('handles multiple operators', () => {
    let filters = [
      {
        column: { name: 'name' },
        operator: 'BeginsWithOp',
        text: 'foo'
      },
      {
        column: { name: 'id' },
        operator: 'LessThanOp',
        text: '999'
      }
    ];
    expect(buildWhereFromFilter(filters, STRUCTURE))
      .toBe(`WHERE ("name" ILIKE 'foo%') AND ("id" < '999')`);
  });

  it('handles any column option', () => {
    let filter = {
      column: 'any',
      operator: 'ContainsOp',
      text: 'foo'
    }
    expect(buildWhereFromFilter([filter], STRUCTURE))
      .toBe(`WHERE (("id"::TEXT ILIKE '%foo%') OR ("name" ILIKE '%foo%'))`);
  });

  it('handles any column option', () => {
    let filter = {
      column: 'custom',
      operator: null,
      text: '1 = 1'
    }
    expect(buildWhereFromFilter([filter], STRUCTURE))
      .toBe(`WHERE (1 = 1)`);
  });
});
