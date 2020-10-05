<template>
  <div class="center">
    <div class="form">
      <div class="form__row">
        <div class="form__field">
          <label class="form__label">Host</label>
          <input class="form__input" v-model="connection.host" />
        </div>
        <div class="form__field form__field--short">
          <label class="form__label">Port</label>
          <input class="form__input" v-model="connection.port" />
        </div>
      </div>
      <div class="form__row">
        <div class="form__field">
          <label class="form__label">Username</label>
          <input class="form__input" v-model="connection.username" />
        </div>
      </div>
      <div class="form__row">
        <div class="form__field">
          <label class="form__label">Password</label>
          <input class="form__input" v-model="connection.password" type="password" />
        </div>
      </div>
      <div class="form__row">
        <div class="form__field">
          <label class="form__label">Database</label>
          <input class="form__input" v-model="connection.database" />
        </div>
      </div>
      <div class="form__actions">
        <div v-if="error" class="form__error">
          {{ error }}
        </div>
        <button class="form__action" @click="onButtonClick()">Click me!</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.center {
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
}

.form {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  max-width: 32rem;
  flex: 1 0 auto;

  &__row {
    display: flex;
    margin-bottom: 0.5rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;

    &--short {
      max-width: 4.25rem;
    }

    & + & {
      margin-left: 1rem;
    }
  }

  &__label {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  &__input {
    padding: 0.5rem 1rem;
    border-radius: $border-radius;
    border: $input-border;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 1rem;
  }
  
  &__error {
    color: red;
    margin-right: 1rem;
  }

  &__action {
    @include button;
  }
}
</style>

<script>
import { ref, reactive, onBeforeUnmount } from 'vue';
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
          error.value = e.message;
        }
      }
    }
  }
}
</script>
