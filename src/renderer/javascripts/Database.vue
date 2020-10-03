<template>
  <div class="container">
    <div class="nav">
    </div>
    <div class="main">
      <div class="left"></div>
      <div class="content"></div>
      <div class="right"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nav {
  height: 3rem;
  background: $panel-background;
  border-bottom: $panel-border;
}

.main {
  display: flex;
  flex: 1 0 auto;
}

.left {
  width: 16rem;
  background: $panel-background;
  border-right: $panel-border;
}

.right {
  width: 16rem;
  background: $panel-background;
  border-left: $panel-border;
}

.content {
  flex: 1 0 auto;
}
</style>

<script>
import { provide } from 'vue';

export default {
  props: {
    id: String
  },
  setup(props) {
    provide('connectionId', props.id);

    return {
    };
  }
}
</script>
