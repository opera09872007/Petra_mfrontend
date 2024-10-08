<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './goods.data';

  import { goodsAddApi, goodsEditApi } from '/@/api/website/goods';
  export default defineComponent({
    name: 'GoodsModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      var currentId = ref(-1);
      const rowId = ref('');

      const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
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
          if (data.record.is_trial == true) {
            data.record.is_trial = '1';
          } else {
            data.record.is_trial = '0';
          }
          setFieldsValue({
            ...data.record,
          });
        }
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增商品' : '编辑商品'));

      async function handleSubmit() {
        try {
          const values = await validate();
          if (values.img_upload != undefined) {
            values.img = values.img_upload[0];
          }
          setModalProps({ confirmLoading: true });
          // TODO custom api
          !unref(isUpdate)
            ? await goodsAddApi(values)
            : await goodsEditApi(unref(currentId), values);

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
