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
        <DropdownMenu
          class="left"
          label="Options"
          :options="['Duplicate', 'Delete']"
          @select="optionSelected"
        />
        <button class="form__action" @click="$emit('done')">Done</button>
        <button class="form__action" @click="connect">Connect</button>
      </div>
    </div>
    <div v-if="!isEditing">
      <div>{{connection.nickname || connection.host || 'localhost'}}</div>
      <button @click="$emit('edit')">Edit</button>
      <button @click="connect">Connect</button>
      <div v-if="error" class="form__error">
        {{ error }}
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

  &__action {
    & + & {
      margin-left: 1rem;
    }
  }
  
  &__error {
    color: red;
    margin-right: 1rem;
  }

  &__action {
    @include button;
  }
}

.left {
  margin-right: auto;
}
</style>

<script>
import { ref, reactive, onBeforeUnmount } from 'vue';
import callMain from './callMain';
import DropdownMenu from './DropdownMenu.vue';

export default {
  components: { DropdownMenu },
  props: {
    connection: Object,
    isEditing: Boolean,
  },
  emits: ['edit', 'done', 'duplicate', 'delete'],
  setup(props, { emit }) {
    const error = ref(null);
    let connection = reactive(props.connection);

    const connect = async () => {
      if (props.isEditing) emit('done');
      try {
        let data = await callMain('connect', { ...connection });
        window.location.hash = `database/${data.id}`;
      } catch (e) {
        error.value = e.message;
      }
    };

    const optionSelected = option => {
      switch (option) {
        case 'Duplicate': emit('duplicate'); break;
        case 'Delete': emit('delete'); break;
      }
    }

    return {
      connection,
      error,
      connect,
      optionSelected,
    }
  }
}
</script>
