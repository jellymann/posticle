<template>
  <h1>Hello, vue + electon!</h1>
  <div>
    <label>Host</label>
    <input v-model="connection.host" />
  </div>
  <div>
    <label>Port</label>
    <input v-model="connection.port" />
  </div>
  <div>
    <label>Username</label>
    <input v-model="connection.username" />
  </div>
  <div>
    <label>Password</label>
    <input v-model="connection.password" type="password" />
  </div>
  <div>
    <label>Database</label>
    <input v-model="connection.database" />
  </div>
  <div v-if="error" class="error">
    {{ error }}
  </div>
  <button @click="onButtonClick()">Click me!</button>
</template>

<style scoped>
.error {
  color: red;
}
</style>

<script>
import { ref, reactive } from 'Vue';

export default {
  setup(props, { emit }) {
    const error = ref(null);
    let connection = reactive({
      host: 'localhost',
      port: '5432',
      username: 'jelly',
      password: '',
      database: 'jelly',
    });

    window.addEventListener('message', (event) => {
      let message = event.data;

      if (message.fromMain && message.eventName === 'connect-response') {
        let data = message.eventData;

        if (data.error) {
          error.value = data.errorMessage;
        } else {
          emit('connect', {});
        }
      }
    });

    return {
      connection,
      error,
      onButtonClick: () => {
        window.postMessage({
          eventName: "connect",
          eventData: { ...connection }
        });
      }
    }
  }
}
</script>
