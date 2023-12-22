<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { accountFormSchema } from './data';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ChangePassword } from '/@/api/sys/user';
  import { useUserStore } from '/@/store/modules/user';

  export default defineComponent({
    name: 'PasswordModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, {}) {
      const { createMessage } = useMessage();
      const [registerForm, { resetFields, validate }] = useForm({
        labelWidth: 100,
        schemas: accountFormSchema,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 23,
        },
      });

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async () => {
        resetFields();
        setModalProps({ confirmLoading: false });
      });

      const getTitle = computed(() => '修改密码');
      const userStore = useUserStore();
      async function handleSubmit() {
        try {
          const values = await validate();
          if (values.new_password1 != values.new_password2) {
            createMessage.error(`新密码两次输入不一致`);
          } else {
            const data = await ChangePassword(values);
            if (data == 1) {
              closeModal();
              userStore.logout(true);
            }
          }
        } catch (error: any) {
          console.log(error);
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit };
    },
  });
</script>
