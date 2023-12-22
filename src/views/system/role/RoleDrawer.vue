<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="getTitle"
    width="500px"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm">
      <template #menu="{ model, field }">
        <BasicTree
          v-model:value="model[field]"
          v-if="treeData.length"
          :treeData="treeData"
          :defaultExpandAll="true"
          :fieldNames="{ title: 'title', key: 'id' }"
          checkable
          toolbar
          title="角色菜单"
        />
      </template>
      <template #permission="{ model, field }">
        <BasicTree
          v-model:value="model[field]"
          v-if="permissionData.length"
          :treeData="permissionData"
          :defaultExpandAll="true"
          :fieldNames="{ title: 'title', key: 'id' }"
          checkable
          toolbar
          title="角色权限"
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './role.data';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTree, TreeItem } from '/@/components/Tree';
  import { useUserStore } from '/@/store/modules/user';

  import { roleAddApi, roleEditApi } from '/@/api/system/role';
  import { getMenuList, getPermissionList } from '/@/api/system';

  export default defineComponent({
    name: 'RoleDrawer',
    components: { BasicDrawer, BasicForm, BasicTree },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      const treeData = ref<TreeItem[]>([]);
      const permissionData = ref<TreeItem[]>([]);
      const userStore = useUserStore();
      var currentId = ref(-1);
      const rowId = ref('');

      const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
        labelWidth: 90,
        schemas: formSchema,
        showActionButtonGroup: false,
      });

      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({ confirmLoading: false });
        // 需要在setFieldsValue之前先填充treeData，否则Tree组件可能会报key not exist警告
        if (unref(treeData).length === 0) {
          treeData.value = (await getMenuList(userStore.getUserInfo.userId)) as any as TreeItem[];
        }
        if (unref(permissionData).length === 0) {
          permissionData.value = (await getPermissionList(
            userStore.getUserInfo.userId,
          )) as any as TreeItem[];
        }
        isUpdate.value = !!data?.isUpdate;
        currentId = data?.currentId;

        if (unref(isUpdate)) {
          rowId.value = data.record.id;
          if (data.record.is_active == true) {
            data.record.is_actives = '1';
          } else {
            data.record.is_actives = '0';
          }
          setFieldsValue({
            ...data.record,
          });
        }
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增角色' : '编辑角色'));

      async function handleSubmit() {
        try {
          const values = await validate();
          setDrawerProps({ confirmLoading: true });
          // TODO custom api
          emit('success');

          !unref(isUpdate) ? await roleAddApi(values) : await roleEditApi(unref(currentId), values);

          emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
          closeDrawer();
        } catch (error: any) {
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }

      return {
        registerDrawer,
        registerForm,
        getTitle,
        handleSubmit,
        treeData,
        permissionData,
      };
    },
  });
</script>
