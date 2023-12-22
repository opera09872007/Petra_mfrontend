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
  import { InfoFormSchema } from '/@/views/data/list/list.data';
  import { infoDetailApi, infoEditApi } from '/@/api/data/info';

  import { getCateByInfoIdApi } from '/@/api/data/repository';

  export default defineComponent({
    name: 'ListModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const rowId = ref('');
      var currentId = ref(-1);

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

        currentId = data?.currentId;

        const infoData = await infoDetailApi(data?.record.info_id);
        for (var i in infoData.categories) {
          infoData.categories[i]['value'] = infoData.categories[i]['id'];
          infoData.categories[i]['label'] = infoData.categories[i]['name'];
        }
        if (infoData.is_active == true) {
          infoData.is_active = '1';
        } else {
          infoData.is_active = '0';
        }
        rowId.value = data?.record.id;
        setFieldsValue({
          ...infoData,
        });

        var treeData;
        treeData = await getCateByInfoIdApi(data?.record.info_id);
        updateSchema([
          {
            field: 'categories',
            componentProps: { treeData },
          },
        ]);
      });

      const getTitle = computed(() => '修改资源(校对)');

      async function handleSubmit() {
        try {
          const values = await validate();
          const data = values;
          setModalProps({ confirmLoading: true });
          for (var i in data.categories) {
            data.categories[i]['id'] = data.categories[i]['value'];
            data.categories[i]['name'] = data.categories[i]['label'];
          }

          await infoEditApi(unref(currentId), data);

          emit('success', { values: { ...values, id: rowId.value } });
          closeModal();
        } catch (error: any) {
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit };
    },
  });
</script>
