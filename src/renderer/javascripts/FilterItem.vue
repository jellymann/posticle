<template>
  <div class="filter-item">
    <select class="filter-item__select" v-model="filter.column">
      <option :value="'any'">Any column</option>
      <option disabled>-----</option>
      <option v-for="column in columns" :key="column.name" :value="column">
        {{ column.name }}
      </option>
      <option disabled>-----</option>
      <option :value="'custom'">Custom SQL</option>
    </select>
    <select v-if="operators !== null" class="filter-item__select" v-model="filter.operator">
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
      v-if="!filter.operator || filter.operator.hasParameter"
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
  constructor({ id, name, hasParameter = true, isSelectable = true }) {
    this.id = id;
    this.name = name;
    this.hasParameter = hasParameter;
    this.isSelectable = isSelectable;
  }
}

class OperatorSeparator extends Operator {
  constructor() {
    super({ isSelectable: false, name: '-----' });
  }
}

const EqualsOp = new Operator({ name: '=', id: 'EqualsOp' });
const NotEqualsOp = new Operator({ name: "≠", id: 'NotEqualsOp' });
const IsDistinctFromOp = new Operator({ name: "is distinct from", id: 'IsDistinctFromOp' });
const LessThanOp = new Operator({ name: "<", id: 'LessThanOp' });
const GreaterThanOp = new Operator({ name: ">", id: 'GreaterThanOp' });
const LessThanEqualOp = new Operator({ name: "≤", id: 'LessThanEqualOp' });
const GreaterThanEqualOp = new Operator({ name: "≥", id: 'GreaterThanEqualOp' });

const IsNullOp = new Operator({ name: "is NULL", hasParameter: false, id: 'IsNullOp' });
const IsNotNullOp = new Operator({ name: "is not NULL", hasParameter: false, id: 'IsNotNullOp' });

const ContainsOp = new Operator({ name: "contains", id: 'ContainsOp' });
const NotContainsOp = new Operator({ name: "does not contain", id: 'NotContainsOp' });
const IsExactlyOp = new Operator({ name: "is exactly", id: 'IsExactlyOp' });
const IsEmptyStringOp = new Operator({ name: "is empty string", hasParameter: false, id: 'IsEmptyStringOp' });
const BeginsWithOp = new Operator({ name: "begins with", id: 'BeginsWithOp' });
const EndsWithOp = new Operator({ name: "ends with", id: 'EndsWithOp' });
const LikeOp = new Operator({ name: "like", id: 'LikeOp' });

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
    if (props.filter.column === null) {
      props.filter.column = 'any';
    }

    const operators = computed(() => {
      if (props.filter.column === 'any') return AnyOperators;
      if (props.filter.column === 'custom') return null;
      if (props.filter.column && props.filter.column.isStringish) return StringOperators;
      return NumberOperators;
    });

    return {
      operators
    }
  }
}
</script>
