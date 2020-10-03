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
import callMain from './callMain';

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

    return {
      connection,
      error,
      onButtonClick: async () => {
        try {
          let data = await callMain('connect', { ...connection });
          window.location.hash = `database/${data.id}`;
        } catch (e) {
          error.value = data.errorMessage;
        }
      }
    }
  }
}
</script>
