<template>
  <h1>Hello, vue + electon!</h1>
  <input v-model="message" />
  <button @click="onButtonClick()">Click me!</button>
</template>

<script>
export default {
  methods: {
    onButtonClick() {
      console.log("button clicked");
      window.postMessage({ eventName: "hello", eventData: this.message });

      window.addEventListener('message', (event) => {
        let message = event.data;

        if (message.fromMain) {
          console.log("message...from main");
          alert(`response: ${message.eventData}`);
        }
      });
    }
  }
}
</script>
