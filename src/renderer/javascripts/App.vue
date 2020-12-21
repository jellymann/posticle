<template>
  <component :is="currentRoute.component" v-bind="currentRoute.params" />
</template>

<script>
import { ref } from 'vue';

import Database from './Database.vue';
import Connections from './Connections.vue'

import { findMatchingRoute } from './urlTemplate';

const ROUTES = {
  '': 'Connections',
  'database/:id': 'Database'
};

const DEFAULT_ROUTE = 'Connections';

const stripHash = s => s.indexOf('#') === 0 ? s.substring(1) : s;

export default {
  components: { Database, Connections },
  setup() {
    const currentRoute = ref({});

    const parseUrl = () => {
      let url = stripHash(window.location.hash);
      const [component, params] = findMatchingRoute(url, ROUTES);
      currentRoute.value = { component, params };
    }

    window.addEventListener('hashchange', function() {
      parseUrl();
    }, false);

    parseUrl();

    return {
      currentRoute
    }
  }
}
</script>
