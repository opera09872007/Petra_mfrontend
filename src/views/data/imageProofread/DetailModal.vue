<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    @ok="handleSubmit"
    :maskClosable="false"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { detailFormSchema } from './list.data';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { returnProofreadApi } from '/@/api/data/detail';

  export default defineComponent({
    name: 'DetailModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();

      const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
        labelWidth: 100,
        schemas: detailFormSchema,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        resetFields();
        setModalProps({ confirmLoading: false });

        setFieldsValue({
          ...data.record,
        });
      });

      const getTitle = computed(() => '错误退回');

      async function handleSubmit() {
        const values = await validate();

        const data = values;

        if (data.memo == '' || data.memo == undefined) {
          createMessage.error('请填写回退的原因');
          return;
        }
        try {
          const res = await returnProofreadApi(unref(data.id), data.memo);

          if (res == 1) {
            closeModal();
            emit('success');
          } else {
            createMessage.error('返回失败，请重试或联系管理员');
          }
        } catch (e) {
          createMessage.error('返回失败，请重试或联系管理员');
        }
      }
      return {
        registerModal,
        registerForm,
        getTitle,
        handleSubmit,
      };
    },
  });
</script>
