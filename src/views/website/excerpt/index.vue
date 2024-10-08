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
              tooltip: '摘录详情',
              onClick: handleEdit.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <ExcerptModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, nextTick, ref, reactive } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getExcerptList } from '/@/api/website/excerpt';

  import { useModal } from '/@/components/Modal';
  import ExcerptModal from './ExcerptModal.vue';

  import { columns } from './excerpt.data';

  export default defineComponent({
    name: 'ResourceManagement',
    components: { BasicTable, ExcerptModal, TableAction },
    setup() {
      const current = ref(1);
      const searchInfo = reactive<Recordable>({});
      const [registerModal, { openModal }] = useModal();
      const [registerTable, { reload, expandAll, collapseAll }] = useTable({
        title: '摘录列表',
        api: getExcerptList,
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
