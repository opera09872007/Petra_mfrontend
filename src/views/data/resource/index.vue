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
              onClick: handleEdit.bind(null, record),
            },
            {
              icon: 'ant-design:delete-outlined',
              color: 'error',
              popConfirm: {
                title: '是否确认删除',
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <ResourceModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, nextTick } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getRepositoryList, repositoryDeleteApi } from '/@/api/data/repository';

  import { useModal } from '/@/components/Modal';
  import ResourceModal from './ResourceModal.vue';

  import { columns, searchFormSchema } from './resource.data';

  export default defineComponent({
    name: 'ResourceManagement',
    components: { BasicTable, ResourceModal, TableAction },
    setup() {
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
        registerTable,
        registerModal,
        handleCreate,
        handleEdit,
        handleDelete,
        handleSuccess,
        onFetchSuccess,
        collapseAll,
        expandAll,
      };
    },
  });
</script>
