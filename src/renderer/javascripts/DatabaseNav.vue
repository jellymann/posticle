<template>
  <div class="nav">
    <div class="nav__back-forward">
      <button class='nav__button'>
        &lt;
      </button>
      <button class='nav__button'>
        &gt;
      </button>
    </div>

    <div class="nav__breadcrumbs">
      <button class="nav__breadcrumb">
        Connection
      </button>
      <button class="nav__breadcrumb">
        Database
      </button>
      <button class="nav__breadcrumb">
        Table
      </button>
    </div>

    <div class="nav__status-bar">
      Connected.
      <div class="nav__pg-version">
        PostgreSQL X.Y.Z
      </div>
    </div>

    <button class="nav__refresh-button">
      R
    </button>

    <div class="nav__sidebar-tggles">
      <button :class="{ 'nav__button':true, 'nav__button--active': leftBarOpen }" @click="toggleLeftBar">
        X
      </button>
      <button :class="{ 'nav__button':true, 'nav__button--active': rightBarOpen }" @click="toggleRightBar">
        Y
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nav {
  height: 3rem;
  flex-shrink: 0;
  background: $panel-background;
  border-bottom: $panel-border;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;

  &__back-forward {
    margin-right: 0.5rem;
  }

  &__button {
    @include button;
    height: 2rem;

    &:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    &:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;
    }
  }

  &__breadcrumbs {
    display: flex;
    margin-right: 0.5rem;
  }

  &__breadcrumb {
    @include button;
    position: relative;
    height: 2rem;

    &:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    &:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;

      &:before {
        content: '';
        position: absolute;
        width: 0; 
        height: 0; 
        border-top: 1rem solid transparent;
        border-bottom: 1rem solid transparent;
        border-left: 0.5rem solid $button-border-color;
        left: 100%;
        z-index: 1;
        top: -1px;
      }

      &:after {
        content: '';
        position: absolute;
        width: 0; 
        height: 0; 
        border-top: 1rem solid transparent;
        border-bottom: 1rem solid transparent;
        border-left: 0.5rem solid $button-background;
        left: calc(100% - 1px);
        z-index: 1;
        top: -1px;
      }

      &:hover {
        &:after {
          border-left-color: $button-background-hover;
        }
      }
    }
  }

  &__status-bar {
    height: 2rem;
    flex-grow: 1;
    margin-right: 0.5rem;
    border-radius: $border-radius;
    background: $button-background;
    border: $button-border;
    padding: 0.5rem 1rem;
    font-size: 13.3333px;
    display: flex;
    align-items: center;
  }

  &__pg-version {
    margin-left: auto;
    color: map-get($gray, default);
  }

  &__refresh-button {
    @include button;
    height: 2rem;
    margin-right: 0.5rem;
  }
}
</style>

<script>
import { ref } from 'vue'
export default {
  props: {
    leftBarOpen: Boolean,
    rightBarOpen: Boolean
  },
  setup(props, { emit }) {
    const leftBarOpen = ref(props.leftBarOpen);
    const rightBarOpen = ref(props.rightBarOpen);

    const toggleLeftBar = () => {
      leftBarOpen.value = !leftBarOpen.value;
      emit('update:leftBarOpen', leftBarOpen.value);
    }

    const toggleRightBar = () => {
      rightBarOpen.value = !rightBarOpen.value;
      emit('update:rightBarOpen', rightBarOpen.value);
    }

    return {
      ...props,
      leftBarOpen,
      rightBarOpen,
      toggleLeftBar,
      toggleRightBar
    }
  }
}
</script>
