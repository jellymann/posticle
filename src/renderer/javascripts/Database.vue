<template>
  <h1>Connection ID: {{connectionId}}</h1>
</template>

<script>
export default {
  props: {
    id: String
  },
  setup(props) {
    return {
      connectionId: props.id
    }
  }
}
</script>
