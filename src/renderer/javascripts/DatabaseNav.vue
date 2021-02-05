<template>
  <div class="nav">
    <div class="nav__back-forward">
      <button class="nav__button">
        <back-icon />
      </button>
      <button class="nav__button">
        <forward-icon />
      </button>
    </div>

    <div class="nav__breadcrumbs">
      <button class="nav__breadcrumb" @click="breadcrumbHost">
        <posticle-icon class="nav__breadcrumb-icon nav__breadcrumb-icon--host" />
        {{ connection ? connection.host : '...' }}
      </button>
      <button class="nav__breadcrumb" @click="breadcrumbDatabase" v-if="connection && connection.database && !showDatabases">
        <database-icon class="nav__breadcrumb-icon nav__breadcrumb-icon--database" />
        {{ connection ? connection.database : '...' }}
      </button>
      <button class="nav__breadcrumb" v-if="connection && table && !showDatabases">
        <table-icon :class="{ 'nav__breadcrumb-icon': true, [`nav__breadcrumb-icon--${tableType}`]: true }" />
        {{ table.name }}
      </button>
    </div>

    <div class="nav__status-bar">
      Connected.
      <div class="nav__pg-version">
        PostgreSQL {{ connection && connection.version }}
      </div>
    </div>

    <div class="nav__refresh-button">
      <button class="nav__button" @click="refresh">
        <refresh-icon />
      </button>
    </div>

    <div class="nav__sidebar-toggles">
      <button :class="{ 'nav__button':true, 'nav__button--active': leftBarOpen }" @click="toggleLeftBar">
        <sidebar-left-icon />
      </button>
      <button :class="{ 'nav__button':true, 'nav__button--active': rightBarOpen }" @click="toggleRightBar">
        <sidebar-right-icon />
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
    display: flex;
  }

  &__button {
    @include button;
    padding: 0 0.25rem;

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

  &__breadcrumb-icon {
    margin-right: 0.5rem;

    &--host {
      color: map-get($gray, default);
    }

    &--database {
      color: map-get($gray, default);
    }

    &--view {
      color: $view-icon-color
    }

    &--table {
      color: $table-icon-color
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
    margin-right: 0.5rem;
  }

  &__sidebar-toggles {
    display: flex;
  }
}
</style>

<script>
import { ref, inject, computed } from 'vue'
import callMain from './callMain';
import TableIcon from '../images/table.svg';
import DatabaseIcon from '../images/database.svg';
import PosticleIcon from '../images/posticle.svg';
import BackIcon from '../images/back.svg';
import ForwardIcon from '../images/forward.svg';
import RefreshIcon from '../images/refresh.svg';
import SidebarLeftIcon from '../images/sidebar-left.svg';
import SidebarRightIcon from '../images/sidebar-right.svg';

export default {
  components: {
    TableIcon,
    DatabaseIcon,
    PosticleIcon,
    BackIcon,
    ForwardIcon,
    RefreshIcon,
    SidebarLeftIcon,
    SidebarRightIcon
  },
  props: {
    table: { type: Object, required: true },
    showDatabases: Boolean,
    leftBarOpen: Boolean,
    rightBarOpen: Boolean
  },
  emits: ['update:leftBarOpen', 'update:rightBarOpen', 'breadcrumb', 'refresh'],
  setup(props, { emit }) {
    const connectionId = inject('connectionId');

    const connection = ref(null);

    const toggleLeftBar = () => {
      emit('update:leftBarOpen', !props.leftBarOpen.value);
    }

    const toggleRightBar = () => {
      emit('update:rightBarOpen', !props.rightBarOpen.value);
    }

    const breadcrumbHost = () => {
      emit('breadcrumb', 'host');
    }

    const breadcrumbDatabase = () => {
      emit('breadcrumb', 'database');
    }

    const refresh = () => {
      emit('refresh');
    }

    const tableType = computed(() => {
      switch (props.table.type) {
        case 'VIEW': return 'view';
        case 'BASE TABLE': return 'table'
      }
    });

    callMain('getConnectionInfo', { connectionId })
      .then(info => {
        connection.value = info;
      });

    return {
      ...props,
      connection,
      toggleLeftBar,
      toggleRightBar,
      breadcrumbHost,
      breadcrumbDatabase,
      refresh,
      tableType
    }
  }
}
</script>
