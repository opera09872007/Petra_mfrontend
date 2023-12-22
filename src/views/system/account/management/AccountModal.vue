<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { accountFormSchema } from './account.data';
  import { accountAddApi, accountEditApi } from '/@/api/account';

  export default defineComponent({
    name: 'AccountModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      const rowId = ref('');
      var currentId = ref(-1);

      const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
        labelWidth: 100,
        schemas: accountFormSchema,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 23,
        },
      });

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        resetFields();
        setModalProps({ confirmLoading: false });

        isUpdate.value = !!data?.isUpdate;
        currentId = data?.currentId;

        if (unref(isUpdate)) {
          rowId.value = data.record.id;
          // data.record.role_name = [];
          // for (var i in data.record.roles) {
          //   data.record.role_name.push({
          //     value: data.record.roles[i]['id'],
          //     label: data.record.roles[i]['name'],
          //   });
          // }
          // data.record.roles = data.record.role_name;
          // data.record.role_name = [];

          setFieldsValue({
            ...data.record,
          });
        }

        // const treeData = await getDeptList();

        // updateSchema([
        //   {
        //     field: 'organization_name',
        //     componentProps: { treeData },
        //   },
        // ]);
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增账号' : '编辑账号'));

      async function handleSubmit() {
        try {
          const values = await validate();

          // TODO custom api
          !unref(isUpdate)
            ? await accountAddApi(values)
            : await accountEditApi(unref(currentId), values);

          emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
          closeModal();
        } catch (error: any) {
          console.log(error);

          // updateSchema([
          //   {
          //     field: 'username',
          //     dynamicRules: ({ values }) => {
          //       return [
          //         {
          //           required: true,
          //           validator: (_, value) => {
          //             return new Promise((resolve, reject) => {
          //               isAccountExist(value, unref(currentName))
          //                 .then(() => resolve())
          //                 .catch((err) => {
          //                   reject(err.message || '验证失败');
          //                 });
          //             });
          //           },
          //         },
          //       ];
          //     },
          //   },
          // ]);
          // throw new Error(error);
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit };
    },
  });
</script>
