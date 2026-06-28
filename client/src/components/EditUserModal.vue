<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['save', 'cancel']);

const form = ref({});

watch(
  () => props.user,
  (user) => {
    if (user) {
      form.value = {
        firstName:  user.firstName,
        lastName:   user.lastName,
        email:      user.email,
        department: user.department,
        isActive:   user.isActive,
      };
    }
  },
  { immediate: true },
);

function save() {
  emit('save', { id: props.user.id, input: { ...form.value } });
}
</script>

<template>
  <div v-if="user" class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="modal">
      <h3>Edit user — {{ user.hrId }}</h3>

      <div class="modal__field">
        <label>First name</label>
        <input v-model="form.firstName" data-testid="modal-firstName" />
      </div>
      <div class="modal__field">
        <label>Last name</label>
        <input v-model="form.lastName" data-testid="modal-lastName" />
      </div>
      <div class="modal__field">
        <label>Email</label>
        <input v-model="form.email" type="email" data-testid="modal-email" />
      </div>
      <div class="modal__field">
        <label>Department</label>
        <input v-model="form.department" data-testid="modal-department" />
      </div>
      <div class="modal__field modal__field--checkbox">
        <label>
          <input type="checkbox" v-model="form.isActive" data-testid="modal-isActive" />
          Active
        </label>
      </div>

      <div class="modal__actions">
        <button class="btn btn--primary" data-testid="modal-save" @click="save">Save</button>
        <button data-testid="modal-cancel" @click="$emit('cancel')">Cancel</button>
      </div>
    </div>
  </div>
</template>
