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
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: 'clarity:info-standard-line',
              tooltip: '书签详情',
              onClick: handleEdit.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <BookmarkModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, nextTick, ref, reactive } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getBookmarkList } from '/@/api/website/bookmark';

  import { useModal } from '/@/components/Modal';
  import BookmarkModal from './BookmarkModal.vue';

  import { columns } from './bookmark.data';

  export default defineComponent({
    name: 'ResourceManagement',
    components: { BasicTable, BookmarkModal, TableAction },
    setup() {
      const current = ref(1);
      const searchInfo = reactive<Recordable>({});
      const [registerModal, { openModal }] = useModal();
      const [registerTable, { reload, expandAll, collapseAll }] = useTable({
        title: '书签列表',
        api: getBookmarkList,
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

      function handleEdit(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
          currentId: record.id,
        });
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
        handleEdit,
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
