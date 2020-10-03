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
import { ref, reactive, onBeforeUnmount } from 'Vue';
import { sendMessage, addMessageListener, removeMessageListener } from './safeIpc';

export default {
  setup(props) {
    const error = ref(null);
    let connection = reactive({
      host: 'localhost',
      port: '5432',
      username: 'jelly',
      password: '',
      database: 'jelly',
    });

    const onConnectResponse = event => {
      let data = event.detail;
      if (data.error) {
        error.value = data.errorMessage;
      } else {
        window.location.hash = `database/${data.id}`;
      }
    };

    addMessageListener('connect-response', onConnectResponse);

    onBeforeUnmount(() => {
      removeMessageListener('connect-response', onConnectResponse);
    });

    return {
      connection,
      error,
      onButtonClick: () => {
        sendMessage('connect', { ...connection });
      }
    }
  }
}
</script>
