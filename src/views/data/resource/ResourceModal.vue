<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './resource.data';

  import { getRepositoryTree, repositoryAddApi, repositoryEditApi } from '/@/api/data/repository';
  export default defineComponent({
    name: 'ResourceModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      var currentId = ref(-1);
      const rowId = ref('');

      const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
        labelWidth: 100,
        schemas: formSchema,
        showActionButtonGroup: false,
      });

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        resetFields();
        setModalProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;
        currentId = data?.currentId;

        if (unref(isUpdate)) {
          rowId.value = data.record.id;
          if (data.record.is_active == true) {
            data.record.is_active = '1';
          } else {
            data.record.is_active = '0';
          }
          if (data.record.contain_text == true) {
            data.record.contain_text = '1';
          } else {
            data.record.contain_text = '0';
          }
          if (data.record.is_proofread == true) {
            data.record.is_proofread = '1';
          } else {
            data.record.is_proofread = '0';
          }
          setFieldsValue({
            ...data.record,
          });
        }
        const treeData = await getRepositoryTree();
        updateSchema({
          field: 'parent',
          componentProps: { treeData },
        });
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增部门' : '编辑部门'));

      async function handleSubmit() {
        try {
          const values = await validate();
          setModalProps({ confirmLoading: true });
          // TODO custom api
          !unref(isUpdate)
            ? await repositoryAddApi(values)
            : await repositoryEditApi(unref(currentId), values);

          emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
          closeModal();
        } catch (error) {
          console.log(error);
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit };
    },
  });
</script>
