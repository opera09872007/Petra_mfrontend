<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="getTitle"
    width="50%"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './menu.data';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';

  import { getMenuList } from '/@/api/system';
  import { menuAddApi, menuEditApi } from '/@/api/system/menu';
  import { permAddApi, permEditApi } from '/@/api/system/permission';
  export default defineComponent({
    name: 'MenuDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      var currentId = ref(-1);
      const rowId = ref('');

      const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
        labelWidth: 100,
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: { lg: 12, md: 24 },
      });

      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;
        currentId = data?.currentId;

        if (unref(isUpdate)) {
          rowId.value = data.record.id;
          data.record.isUpdate = unref(isUpdate);
          if (data.record.is_active == true) {
            data.record.is_active = '1';
          } else {
            data.record.is_active = '0';
          }
          if (data.record.is_frame == true) {
            data.record.is_frame = '1';
          } else {
            data.record.is_frame = '0';
          }
          if (data.record.ignoreKeepAlive == true) {
            data.record.ignoreKeepAlive = '1';
          } else {
            data.record.ignoreKeepAlive = '0';
          }
          if (data.record.is_show == true) {
            data.record.is_show = '1';
          } else {
            data.record.is_show = '0';
          }
          setFieldsValue({
            ...data.record,
          });
        }
        const treeData = await getMenuList();

        updateSchema({
          field: 'menu',
          componentProps: { treeData },
        });
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增菜单' : '编辑菜单'));

      async function handleSubmit() {
        try {
          const values = await validate();
          if (values.menu == undefined) {
            values.menu = '';
          }
          setDrawerProps({ confirmLoading: true });
          // TODO custom api
          if (values.is_button === '2') {
            values.component = 'LAYOUT';
            !unref(isUpdate)
              ? await permAddApi(values)
              : await permEditApi(unref(currentId), values);
          } else {
            !unref(isUpdate)
              ? await menuAddApi(values)
              : await menuEditApi(unref(currentId), values);
          }

          emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });

          closeDrawer();
        } catch (error) {
          console.log(error);
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }

      return { registerDrawer, registerForm, getTitle, handleSubmit };
    },
  });
</script>
