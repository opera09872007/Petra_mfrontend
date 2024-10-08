<template>
  <div class="vben-basic-table vben-basic-table-form-container">
    <BasicTable
      @register="registerTable"
      @fetch-success="onFetchSuccess"
      :searchInfo="searchInfo"
      :current="current"
      :pagination="{
        current: current,
      }"
      @change="handleTableChange"
    >
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 新增新闻 </a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: 'clarity:note-edit-line',
              tooltip: '编辑新闻',
              onClick: handleEdit.bind(null, record),
            },

            {
              icon: 'ant-design:delete-outlined',
              color: 'error',
              tooltip: '删除新闻',
              popConfirm: {
                title: '是否确认删除',
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <NewsModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, nextTick, ref, reactive } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getnewsList, newsDeleteApi } from '/@/api/website/news';

  import { useModal } from '/@/components/Modal';
  import NewsModal from './NewsModal.vue';

  import { columns } from './news.data';

  export default defineComponent({
    name: 'ResourceManagement',
    components: { BasicTable, NewsModal, TableAction },
    setup() {
      const current = ref(1);
      const searchInfo = reactive<Recordable>({});
      const [registerModal, { openModal }] = useModal();
      const [registerTable, { reload, expandAll, collapseAll }] = useTable({
        title: '新闻列表',
        api: getnewsList,
        columns,
        formConfig: {
          labelWidth: 120,
        },
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
          await newsDeleteApi(record.id);
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
      function handleTableChange(pagination) {
        current.value = pagination.current;
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
        searchInfo,
        current,
        handleTableChange,
      };
    },
  });
</script>
../../../api/website/news
