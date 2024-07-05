<template>
  <div class="vben-basic-table vben-basic-table-form-container">
    <BasicTable @register="registerTable" @fetch-success="onFetchSuccess">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 新增资源库 </a-button>
        <a-button type="primary" @click="expandAll">展开全部</a-button>
        <a-button type="primary" @click="collapseAll">折叠全部</a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: 'clarity:note-edit-line',
              tooltip: '编辑资源库',
              onClick: handleEdit.bind(null, record),
            },
            {
              icon: 'ant-design:bars-outlined',
              tooltip: '编辑任务流程',
              onClick: handleEditTask.bind(null, record),
            },
            {
              icon: 'ant-design:delete-outlined',
              color: 'error',
              tooltip: '删除资源库',
              popConfirm: {
                title: '是否确认删除',
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <ResourceDrawer @register="registerDrawer" @success="handleSuccess" />
    <ResourceModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, nextTick } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getRepositoryList, repositoryDeleteApi } from '/@/api/data/repository';

  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import ResourceDrawer from './ResourceDrawer.vue';
  import ResourceModal from './ResourceModal.vue';

  import { columns, searchFormSchema } from './resource.data';

  export default defineComponent({
    name: 'ResourceManagement',
    components: { BasicTable, ResourceModal, TableAction, ResourceDrawer },
    setup() {
      const [registerDrawer, { openDrawer }] = useDrawer({});
      const [registerModal, { openModal }] = useModal();
      const [registerTable, { reload, expandAll, collapseAll }] = useTable({
        title: '资源库列表',
        api: getRepositoryList,
        columns,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema,
        },
        isTreeTable: true,
        pagination: false,
        striped: false,
        useSearchForm: false,
        showTableSetting: true,
        bordered: true,
        showIndexColumn: false,
        canResize: false,
        actionColumn: {
          width: 80,
          title: '操作',
          dataIndex: 'action',
          slots: { customRender: 'action' },
          fixed: undefined,
        },
      });

      function handleCreate() {
        openModal(true, {
          isUpdate: false,
          currentId: '',
        });
      }

      function handleEdit(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
          currentId: record.id,
        });
      }
      function handleEditTask(record: Recordable) {
        openDrawer(true, {
          record,
          currentId: record.id,
        });
      }
      async function handleDelete(record: Recordable) {
        try {
          await repositoryDeleteApi(record.id);
        } catch (error) {
          console.log(error);
        }
        reload();
      }

      function handleSuccess() {
        reload();
      }
      function onFetchSuccess() {
        nextTick(expandAll);
      }
      return {
        registerDrawer,
        registerTable,
        registerModal,
        handleCreate,
        handleEdit,
        handleEditTask,
        handleDelete,
        handleSuccess,
        onFetchSuccess,
        collapseAll,
        expandAll,
      };
    },
  });
</script>
