<template>
  <div class="main">
    <div class="welcome">
      <PosticleIcon viewBox="0 2 22 22" />
      <div class="version">Version 0.0.0</div>
      <button @click="newConnection">New Favourite</button>
    </div>
    <div class="connections">
      <ul>
        <li v-for="connection in connections" :key="connection.id">
          <Connection :connection="connection" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  display: flex;
  height: 100%;
}

.welcome {
  width: 14rem;
  background: $panel-background;
  display: flex;
  flex-direction: column;
  padding: 0 1rem 1rem;
  border-right: $panel-border;

  svg {
    display: block;
    width: 100%;
    height: auto;
    color: map-get($gray, default);
  }

  .version {
    text-align: center;
    font-size: 12px;
    color: map-get($gray, default);
  }

  button {
    margin-top: auto;
    @include button;
    justify-content: space-around;
  }
}

.connections {
  flex-grow: 1;
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
import Connection from './Connection.vue';
import PosticleIcon from '../images/posticle.svg';
import { v4 as uuid } from 'uuid';

export default {
  components: { Connection, PosticleIcon },
  setup(props) {
    const error = ref(null);
    let connections = reactive([{
      id: uuid(),
      nickname: 'jelly',
      host: 'localhost',
      port: '5432',
      username: 'jelly',
      password: '',
      database: 'jelly',
    }, {
      id: uuid(),
      nickname: 'mbp',
      host: 'localhost',
      port: '5432',
      username: 'daniel',
      password: '',
      database: 'postgres',
    }]);

    const newConnection = () => {
      connections.push({
        id: uuid(),
        nickname: '',
        host: '',
        port: '',
        username: '',
        password: '',
        database: '',
      });
    };

    return {
      connections,
      newConnection,
    }
  }
}
</script>
