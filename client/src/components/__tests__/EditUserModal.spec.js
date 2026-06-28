import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EditUserModal from '../EditUserModal.vue';

describe('EditUserModal', () => {
  const user = {
    id: 1,
    hrId: 'E1001',
    firstName: 'Alice',
    lastName: 'Adams',
    email: 'alice@example.com',
    department: 'Engineering',
    isActive: true,
  };

  it('renders nothing when user is null', () => {
    const wrapper = mount(EditUserModal, { props: { user: null } });

    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);
  });

  it('renders the modal with user data pre-filled', () => {
    const wrapper = mount(EditUserModal, { props: { user } });

    expect(wrapper.find('[data-testid="modal-firstName"]').element.value).toBe('Alice');
    expect(wrapper.find('[data-testid="modal-lastName"]').element.value).toBe('Adams');
    expect(wrapper.find('[data-testid="modal-email"]').element.value).toBe('alice@example.com');
  });

  it('emits save with updated values when save is clicked', async () => {
    const wrapper = mount(EditUserModal, { props: { user } });

    await wrapper.find('[data-testid="modal-lastName"]').setValue('Smith');
    await wrapper.find('[data-testid="modal-save"]').trigger('click');

    expect(wrapper.emitted('save')).toBeTruthy();
    const payload = wrapper.emitted('save')[0][0];
    expect(payload.id).toBe(1);
    expect(payload.input.lastName).toBe('Smith');
    expect(payload.input.firstName).toBe('Alice');
  });

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(EditUserModal, { props: { user } });

    await wrapper.find('[data-testid="modal-cancel"]').trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });
});
