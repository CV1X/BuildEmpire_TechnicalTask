<script setup>
import { ref } from 'vue';
import { useQuery, useMutation } from '../composables/useGraphql';
import UserTable from '../components/UserTable.vue';
import EditUserModal from '../components/EditUserModal.vue';

const USERS_QUERY = `
  query Users {
    users {
      id
      hrId
      firstName
      lastName
      email
      department
      isActive
    }
  }
`;

const UPDATE_USER = `
  mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      hrId
      firstName
      lastName
      email
      department
      isActive
    }
  }
`;

const { data, loading, error, refetch } = useQuery(USERS_QUERY);
const { mutate: updateUser, error: updateError } = useMutation(UPDATE_USER);

const editingUser = ref(null);

function openEditModal(user) {
  editingUser.value = user;
}

function closeEditModal() {
  editingUser.value = null;
}

async function handleSaveUser({ id, input }) {
  await updateUser({ id, input });
  editingUser.value = null;
  await refetch();
}
</script>

<template>
  <section>
    <h2>Staff users</h2>
    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="error">{{ error.message }}</p>
    <template v-else>
      <p v-if="updateError" class="error">Update failed: {{ updateError.message }}</p>
      <UserTable
        :users="data ? data.users : []"
        @edit-user="openEditModal"
      />
    </template>

    <EditUserModal
      :user="editingUser"
      @save="handleSaveUser"
      @cancel="closeEditModal"
    />
  </section>
</template>
