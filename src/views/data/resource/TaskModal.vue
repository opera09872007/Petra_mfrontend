<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="新增任务流程" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { taskSchema } from './resource.data';

  import { TaskTypeAddApi } from '/@/api/data/workTaskType';
  export default defineComponent({
    name: 'TaskModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      var currentId = ref(-1);
      const rowId = ref('');

      const [registerForm, { resetFields, validate }] = useForm({
        labelWidth: 100,
        schemas: taskSchema,
        showActionButtonGroup: false,
      });

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        resetFields();
        setModalProps({ confirmLoading: false });
        console.log(data);

        currentId = data?.currentId;
      });

      async function handleSubmit() {
        try {
          const values = await validate();
          values.repId = currentId;
          setModalProps({ confirmLoading: true });
          await TaskTypeAddApi(values);

          emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
          closeModal();
        } catch (error) {
          console.log(error);
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, handleSubmit };
    },
  });
</script>
