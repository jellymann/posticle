<template>
  <database v-if="connected" />
  <connection v-else @connect="onConnect"/>
</template>

<script>
import { ref } from 'vue';

import Database from './Database.vue';
import Connection from './Connection.vue'

export default {
  components: { Database, Connection },
  setup() {
    const connected = ref(false);

    const onConnect = (data) =>{
      connected.value = true;
    };

    return {
      connected, onConnect
    };
  }
}
</script>
