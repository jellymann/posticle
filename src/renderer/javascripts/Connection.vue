<template>
  <div class="connection">
    <div v-if="isEditing" class="form">
      <div class="form__row">
        <div class="form__field">
          <label class="form__label">Nickname</label>
          <input class="form__input" v-model="connection.nickname" />
        </div>
      </div>
      <div class="form__row">
        <div class="form__field">
          <label class="form__label">Host</label>
          <input class="form__input" v-model="connection.host" placeholder="localhost" />
        </div>
        <div class="form__field form__field--short">
          <label class="form__label">Port</label>
          <input class="form__input" v-model="connection.port" placeholder="5432" />
        </div>
      </div>
      <div class="form__row">
        <div class="form__field">
          <label class="form__label">Username</label>
          <input class="form__input" v-model="connection.username" :placeholder="username" />
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
          <input class="form__input" v-model="connection.database" :placeholder="connection.username || username" />
        </div>
      </div>
      <div class="form__actions">
        <DropdownMenu
          class="left"
          label="Options"
          :options="['Duplicate', 'Delete']"
          @select="optionSelected"
        />
        <button class="form__action" @click="$emit('done')">
          Done
        </button>
        <button class="form__action" @click="connect">
          Connect
        </button>
      </div>
    </div>
    <div v-if="!isEditing" class="summary">
      <div class="summary__row">
        <div class="summary__nickname">
          {{ connection.nickname || connection.host || 'localhost' }}
        </div>
        <button class="summary__action" @click="$emit('edit')">
          Edit
        </button>
        <button class="summary__action" @click="connect">
          Connect
        </button>
      </div>
      <div class="summary__row">
        <div v-if="connecting" class="summary__connecting">
          Connecting...
        </div>
        <div v-if="error" class="summary__error">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.connection {
  padding: 1rem;
  background: $panel-background;
  border: $panel-border;
  border-radius: $border-radius-large;
  max-width: 32rem;
}

.form {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  
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

  &__action {
    & + & {
      margin-left: 1rem;
    }
  }

  &__action {
    @include button;
  }
}

.left {
  margin-right: auto;
}

.summary {
  &__row {
    display: flex;
    width: 100%;
    align-items: center;
  }

  &__nickname {
    margin-right: auto
  }

  &__action {
    @include button;

    & + & {
      margin-left: 0.5rem;
    }
  }

  &__error, &__connecting {
    margin-left: auto;
  }
  
  &__error {
    color: red;
  }
}
</style>

<script>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import callMain, { CallMainError } from './callMain';
import DropdownMenu from './DropdownMenu.vue';

export default {
  components: { DropdownMenu },
  props: {
    connection: { type: Object, required: true },
    isEditing: Boolean,
    username: { type: String, default: '' },
  },
  emits: ['edit', 'done', 'duplicate', 'delete'],
  setup(props, { emit }) {
    const error = ref(null);
    const connecting = ref(false);
    const router = useRouter();

    const connect = async () => {
      error.value = null;
      connecting.value = true;
      if (props.isEditing) emit('done');
      try {
        let data = await callMain('connect', props.connection);
        router.push({ name: 'Tables', params: { connectionId: data.id, database: defaultDatabase() } });
      } catch (e) {
        if (e instanceof CallMainError) error.value = e.message;
        else throw e;
      } finally {
        connecting.value = false;
      }
    };

    watch(() => props.isEditing, () => {
      error.value = null;
    });

    const optionSelected = option => {
      switch (option) {
        case 'Duplicate': emit('duplicate'); break;
        case 'Delete': emit('delete'); break;
      }
    }

    const defaultDatabase = () => {
      return props.connection.database || props.connection.user || props.username;
    };

    return {
      error,
      connecting,
      connect,
      optionSelected,
    }
  }
}
</script>
