class BinaryOperator {
  constructor({ operator }) {
    this.operator = operator;
  }

  toSql(column, value) {
    return `"${column.name}" ${this.operator} '${value}'`;
  }
}

class UnaryOperator {
  constructor({ operator }) {
    this.operator = operator;
  }

  toSql(column) {
    return `"${column.name}" ${this.operator}`;
  }
}

class LikeOperator {
  constructor({ inverted = false, percentBefore = true, percentAfter = true } = {}) {
    this.inverted = inverted;
    this.percentBefore = percentBefore;
    this.percentAfter = percentAfter;
  }

  toSql(column, value) {
    let op = this.inverted ? 'NOT ILIKE' : 'ILIKE';
    let p1 = this.percentBefore ? '%' : '';
    let p2 = this.percentAfter ? '%' : '';
    let typeCase = column.isStringish ? '' : '::TEXT';
    return `"${column.name}"${typeCase} ${op} '${p1}${value}${p2}'`;
  }
}

const OPERATORS = {
  EqualsOp: new BinaryOperator({ operator: '=' }),
  NotEqualsOp: new BinaryOperator({ operator: "<>" }),
  IsDistinctFromOp: new BinaryOperator({ operator: "IS DISTINCT FROM" }),
  LessThanOp: new BinaryOperator({ operator: "<" }),
  GreaterThanOp: new BinaryOperator({ operator: ">" }),
  LessThanEqualOp: new BinaryOperator({ operator: "<=" }),
  GreaterThanEqualOp: new BinaryOperator({ operator: ">=" }),

  IsNullOp: new UnaryOperator({ operator: "IS NULL" }),
  IsNotNullOp: new UnaryOperator({ operator: "IS NOT NULL" }),

  ContainsOp: new LikeOperator(),
  NotContainsOp: new LikeOperator({ inverted: true }),
  IsExactlyOp: new BinaryOperator({ operator: "=" }),
  IsEmptyStringOp: new UnaryOperator({ operator: "= ''" }),
  BeginsWithOp: new LikeOperator({ percentBefore: false }),
  EndsWithOp: new LikeOperator({ prcentAfter: false }),
  LikeOp: new LikeOperator({ percentBefore: false, prcentAfter: false }),
};

function filterItemToSql(filter, structure) {
  switch (filter.column) {
    case 'any': return toSqlAllColumns(filter, structure);
    case 'custom': return filter.text;
    default: return filterOperatorToSql(filter, structure)
  }
}

function filterOperatorToSql(filter, structure) {
  let column = structure.columns.find(({ name }) => name === filter.column.name);
  return operatorToSql(filter, column);
}

function operatorToSql(filter, column) {
  return OPERATORS[filter.operator].toSql(column, filter.text);
}

function toSqlAllColumns(filter, structure) {
  return structure.columns
    .map(column => `(${operatorToSql(filter, column)})`)
    .join(' OR ');
}

export default function buildWhereFromFilters(filters, structure) {
  if (!filters || filters.length === 0) return '';

  let conditions = filters
    .map(filter => `(${filterItemToSql(filter, structure)})`)
    .join(' AND ');

  return `WHERE ${conditions}`;
}
