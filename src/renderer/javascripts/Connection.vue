<template>
  <h1>Hello, vue + electon!</h1>
  <div>
    <label>Host</label>
    <input v-model="host" />
  </div>
  <div>
    <label>Port</label>
    <input v-model="port" />
  </div>
  <div>
    <label>Username</label>
    <input v-model="username" />
  </div>
  <div>
    <label>Password</label>
    <input v-model="password" type="password" />
  </div>
  <div>
    <label>Database</label>
    <input v-model="database" />
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
import { ref } from 'Vue';

export default {
  setup(props, { emit }) {
    const error = ref(null);
    let host = ref('localhost');
    let port = ref('5432');
    let username = ref('jelly');
    let password = ref('');
    let database = ref('jelly');

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
      host,
      port,
      username,
      password,
      database,
      error,
      onButtonClick: () => {
        window.postMessage({
          eventName: "connect",
          eventData: {
            host: host.value,
            port: port.value,
            username: username.value,
            password: password.value,
            database: database.value,
          }
        });
      }
    }
  }
}
</script>
