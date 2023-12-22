<template>
  <div class="vben-basic-table vben-basic-table-form-container">
    <BasicTable @register="registerTable" @fetch-success="onFetchSuccess">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 新增部门 </a-button>
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
    <DeptModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, nextTick } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getDeptList } from '/@/api/system/dept';

  import { useModal } from '/@/components/Modal';
  import DeptModal from './DeptModal.vue';

  import { columns, searchFormSchema } from './dept.data';
  import { DeptDeleteApi } from '/@/api/system/dept';

  export default defineComponent({
    name: 'DeptManagement',
    components: { BasicTable, DeptModal, TableAction },
    setup() {
      const [registerModal, { openModal }] = useModal();
      const [registerTable, { reload, expandAll }] = useTable({
        title: '部门列表',
        api: getDeptList,
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
          await DeptDeleteApi(record.id);
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
      };
    },
  });
</script>
