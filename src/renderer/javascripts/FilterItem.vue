<template>
  <div class="filter-item">
    <select class="filter-item__select" v-model="selectedColumn">
      <option :value="'any'">Any column</option>
      <option disabled>-----</option>
      <option v-for="column in columns" :key="column.name" :value="column">
        {{ column.name }}
      </option>
      <option disabled>-----</option>
      <option :value="'custom'">Custom SQL</option>
    </select>
    <select v-if="operators !== null" class="filter-item__select" v-model="selectedOperator">
      <option
        v-for="operator in operators"
        :key="operator.name"
        :disabled="!operator.isSelectable"
        :value="operator"
      >
        {{ operator.name }}
      </option>
    </select>
    <input
      v-if="!selectedOperator || selectedOperator.hasParameter"
      class="filter-item__input"
      v-model="filter.text"
    />
  </div>
</template>

<style lang="scss" scoped>
.filter-item {
  flex-grow: 1;
  display: flex;

  &__select {
    @include button;
    margin-right: 0.5rem;
    width: 10rem;
  }

  &__input {
    flex-grow: 1;
    margin-right: 0.5rem;
  }
}
</style>

<script>
import { ref, computed } from 'vue';

class Operator {
  constructor({ name, hasParameter = true, isSelectable = true } = {}) {
    this.name = name;
    this.hasParameter = hasParameter;
    this.isSelectable = isSelectable;
  }
}

class BinaryOperator extends Operator {
  constructor({ operator, ...options }) {
    super(options);
    this.operator = operator;
  }

  toSql(column, value) {
    return `"${column.name}" ${this.operator} '${value}'`;
  }
}

class UnaryOperator extends Operator {
  constructor({ operator, ...options }) {
    super({ hasParameter: false, ...options });
    this.operator = operator;
  }

  toSql(column, value) {
    return `"${column.name} ${this.operator}`;
  }
}

class LikeOperator extends Operator {
  constructor({ inverted = false, percentBefore = true, percentAfter = true, ...options }) {
    super(options);
    this.inverted = inverted;
    this.percentBefore = percentBefore;
    this.percentAfter = percentAfter;
  }

  toSql(column, value) {
    op = this.inverted ? 'NOT ILIKE' : 'ILIKE';
    p1 = this.percentBefore ? '%' : '';
    p2 = this.percentAfter ? '%' : '';
    typeCase = column.isStringish ? '' : '::TEXT';
    return `"${column.name}"${typeCase} ${op} '${p1}${value}${p2}'`;
  }
}

class OperatorSeparator extends Operator {
  constructor() {
    super({ isSelectable: false, name: '-----' });
  }
}

const EqualsOp = new BinaryOperator({ name: '=', operator: '=' });
const NotEqualsOp = new BinaryOperator({ name: "≠", operator: "<>" });
const IsDistinctFromOp = new BinaryOperator({ name: "is distinct from", operator: "IS DISTINCT FROM" });
const LessThanOp = new BinaryOperator({ name: "<", operator: "<" });
const GreaterThanOp = new BinaryOperator({ name: ">", operator: ">" });
const LessThanEqualOp = new BinaryOperator({ name: "≤", operator: "<=" });
const GreaterThanEqualOp = new BinaryOperator({ name: "≥", operator: ">=" });

const IsNullOp = new UnaryOperator({ name: "is NULL", operator: "IS NULL" });
const IsNotNullOp = new UnaryOperator({ name: "is not NULL", operator: "IS NOT NULL" });

const ContainsOp = new LikeOperator({ name: "contains" });
const NotContainsOp = new LikeOperator({ name: "does not contain", inverted: true });
const IsExactlyOp = new BinaryOperator({ name: "is exactly", operator: "=" });
const IsEmptyStringOp = new UnaryOperator({ name: "is empty string", operator: "= ''" });
const BeginsWithOp = new LikeOperator({ name: "begins with", PercentBefore: false });
const EndsWithOp = new LikeOperator({ name: "ends with", PercentAfter: false });
const LikeOp = new LikeOperator({ name: "like", PercentBefore: false, PercentAfter: false });

const OpSeparator = new OperatorSeparator();

const AnyOperators = [
  ContainsOp, IsExactlyOp, BeginsWithOp, EndsWithOp, LikeOp,
  OpSeparator,
  IsNullOp, IsNotNullOp
];

const NumberOperators = [
  EqualsOp, NotEqualsOp, IsDistinctFromOp, LessThanOp, GreaterThanOp, LessThanEqualOp, GreaterThanEqualOp,
  OpSeparator,
  IsNullOp, IsNotNullOp
];

const StringOperators = [
  ContainsOp, NotContainsOp, IsExactlyOp, IsDistinctFromOp, IsEmptyStringOp, BeginsWithOp, EndsWithOp, LikeOp,
  OpSeparator,
  LessThanOp, GreaterThanOp, LessThanEqualOp, GreaterThanEqualOp,
  OpSeparator,
  IsNullOp, IsNotNullOp
];

export default {
  props: {
    filter: Object,
    columns: Array
  },
  setup(props) {
    const selectedColumn = ref('any');
    const operators = computed(() => {
      if (selectedColumn.value === 'any') return AnyOperators;
      if (selectedColumn.value === 'custom') return null;
      if (selectedColumn.value.isStringish) return StringOperators;
      return NumberOperators;
    });
    const selectedOperator = ref(ContainsOp);

    return {
      selectedColumn,
      operators,
      selectedOperator
    }
  }
}
</script>
