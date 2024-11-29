<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <ResTree class="w-1/4 xl:w-1/5" @select="handleSelect" />
    <div
      class="vben-basic-table vben-basic-table-form-container w-3/4 xl:w-4/5"
      style="overflow: auto"
    >
      <BasicTable
        @register="registerTable"
        @fetch-success="onFetchSuccess"
        :searchInfo="searchInfo"
      >
        <template #toolbar>
          <a-button type="primary" @click="handleCreate"> 新增分类 </a-button>
          <a-button type="primary" @click="expandAll">展开全部</a-button>
          <a-button type="primary" @click="collapseAll">折叠全部</a-button>
        </template>
        <template #action="{ record }">
          <TableAction
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑分类资料',
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
    </div>
    <CategoryModal @register="registerModal" @success="handleSuccess" />
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, nextTick, reactive } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getCateList } from '/@/api/data/category';

  import { useModal } from '/@/components/Modal';
  import CategoryModal from './CategoryModal.vue';

  import { columns, searchFormSchema } from './category.data';
  import { CateDeleteApi } from '/@/api/data/category';
  import { PageWrapper } from '/@/components/Page';
  import { useGo } from '/@/hooks/web/usePage';
  import ResTree from './ResTree.vue';

  export default defineComponent({
    name: 'CategoryManagement',
    components: { BasicTable, PageWrapper, CategoryModal, ResTree, TableAction },
    setup() {
      const go = useGo();
      const searchInfo = reactive<Recordable>({});
      const [registerModal, { openModal }] = useModal();
      const [registerTable, { reload, expandAll, collapseAll }] = useTable({
        title: '分类列表',
        api: getCateList,
        columns,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema,
        },
        handleSearchInfoFn(info) {
          return info;
        },
        isTreeTable: true,
        pagination: false,
        striped: false,
        useSearchForm: false,
        showTableSetting: true,
        bordered: true,
        showIndexColumn: false,
        indentSize: 5,
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
          repId: searchInfo.repId,
          isUpdate: false,
          currentId: '',
        });
      }

      function handleEdit(record: Recordable) {
        openModal(true, {
          record,
          repId: searchInfo.repId,
          isUpdate: true,
          currentId: record.id,
        });
      }

      async function handleDelete(record: Recordable) {
        try {
          await CateDeleteApi(record.id);
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
      function handleSelect(repId = '') {
        searchInfo.repId = repId;
        reload();
      }
      function handleView(record: Recordable) {
        go('/system/account_detail/' + record.id);
      }

      return {
        registerTable,
        registerModal,
        handleCreate,
        handleEdit,
        handleDelete,
        handleSuccess,
        onFetchSuccess,
        handleSelect,
        searchInfo,
        collapseAll,
        expandAll,
        handleView,
      };
    },
  });
</script>
