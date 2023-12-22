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
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { InfoFormSchema } from './list.data';

  import { useMessage } from '/@/hooks/web/useMessage';
  import { infoDetailApi, infoAddApi, infoEditApi } from '/@/api/data/info';

  import { getCateByResIdApi } from '/@/api/data/repository';

  export default defineComponent({
    name: 'ListModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      const isAdd = ref(true);

      let repId = ref(-1);
      const rowId = ref('');
      var currentId = ref(-1);

      const { createMessage } = useMessage();

      const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
        labelWidth: 100,
        schemas: InfoFormSchema,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 23,
        },
      });

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        resetFields();
        setModalProps({ confirmLoading: false });

        isUpdate.value = !!data?.isUpdate;
        isAdd.value = !!data?.isAdd;
        currentId = data?.currentId;
        repId = data?.repId;
        cateId = data?.cateId;
        if (unref(isAdd)) {
          const infoData = await infoDetailApi(data.record.id);

          for (var i in infoData.categories) {
            infoData.categories[i]['value'] = infoData.categories[i]['id'];
            infoData.categories[i]['label'] = infoData.categories[i]['name'];
          }
          var list = {
            categories: infoData.categories,
            parent_name: infoData.name,
            parent: infoData.id,
          };

          setFieldsValue({
            ...list,
          });
        }
        if (unref(isUpdate)) {
          const infoData = await infoDetailApi(data.record.id);
          var list = [];
          for (var i in infoData.categories) {
            infoData.categories[i]['value'] = infoData.categories[i]['id'];
            infoData.categories[i]['label'] = infoData.categories[i]['name'];
          }
          if (infoData.is_active == true) {
            infoData.is_active = '1';
          } else {
            infoData.is_active = '0';
          }
          if (infoData.is_null == true) {
            infoData.is_null = '1';
          } else {
            infoData.is_null = '0';
          }
          rowId.value = data.record.id;
          setFieldsValue({
            ...infoData,
          });
        }

        var treeData;
        if (unref(repId) === -1 || unref(repId) == undefined || unref(repId) == -1) {
          createMessage.error('请先选择资源库');
          closeModal();
        } else {
          treeData = await getCateByResIdApi(unref(repId));
        }
        updateSchema([
          {
            field: 'categories',
            componentProps: { treeData },
          },
        ]);
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增资源' : '编辑资源'));

      async function handleSubmit() {
        try {
          const values = await validate();

          const data = values;
          setModalProps({ confirmLoading: true });
          for (var i in data.categories) {
            data.categories[i]['id'] = data.categories[i]['value'];
            data.categories[i]['name'] = data.categories[i]['label'];
          }
          if (unref(repId) === -1 || unref(repId) == undefined) {
            createMessage.error('请先选择资源库');
          } else {
            data.data_repository = repId;

            if (unref(isAdd)) {
              await infoAddApi(data);
            } else {
              !unref(isUpdate) ? await infoAddApi(data) : await infoEditApi(unref(currentId), data);
            }
            emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
            closeModal();
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
