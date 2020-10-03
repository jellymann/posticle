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
  <button @click="onButtonClick()">Click me!</button>
</template>

<script>
window.addEventListener('message', (event) => {
  let message = event.data;

  if (message.fromMain && message.eventName === 'connect-response') {
    alert(`response: ${JSON.stringify(message.eventData)}`);
  }
});

export default {
  methods: {
    onButtonClick() {
      window.postMessage({
        eventName: "connect",
        eventData: {
          host: this.host,
          port: this.port,
          username: this.username,
          password: this.password,
          database: this.database,
        }
      });
    }
  }
}
</script>
