<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './category.data';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { getCateByResIdApi } from '/@/api/data/repository';
  import { CateAddApi, CateEditApi } from '/@/api/data/category';

  export default defineComponent({
    name: 'CateModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      let repId = ref(-1);
      var currentId = ref(-1);
      const rowId = ref('');

      const { createMessage } = useMessage();

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
        repId = data?.repId;

        if (unref(isUpdate)) {
          rowId.value = data.record.id;
          if (data.record.is_active == true) {
            data.record.is_active = '1';
          } else {
            data.record.is_active = '0';
          }
          setFieldsValue({
            ...data.record,
          });
        }

        var treeData;
        if (unref(repId) === -1 || unref(repId) == undefined || unref(repId) == '') {
          createMessage.error('请先选择资源库');
          closeModal();
        } else {
          treeData = await getCateByResIdApi(unref(repId));
        }
        updateSchema({
          field: 'parent',
          componentProps: { treeData },
        });
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增分类' : '编辑分类'));

      async function handleSubmit() {
        try {
          const values = await validate();
          setModalProps({ confirmLoading: true });
          // TODO custom api
          if (unref(repId) === -1 || unref(repId) == undefined) {
            createMessage.error('请先选择资源库');
          } else {
            values.data_repository = repId;
            !unref(isUpdate)
              ? await CateAddApi(values)
              : await CateEditApi(unref(currentId), values);
            emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
            closeModal();
          }
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
