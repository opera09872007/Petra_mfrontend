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
          v-if="record.is_done == true"
          :actions="[
            {
              icon: 'clarity:info-standard-line',
              tooltip: '问题详情',
              onClick: handleEdit.bind(null, record),
            },
          ]"
        />
        <TableAction
          v-else
          :actions="[
            {
              icon: 'clarity:info-standard-line',
              tooltip: '问题详情',
              onClick: handleEdit.bind(null, record),
            },
            {
              icon: 'ant-design:check-outlined',
              tooltip: '完成',
              popConfirm: {
                title: '是否确认完成',
                confirm: handleDone.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <FeedbackModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, nextTick, ref, reactive } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getFeedBackList, completefeedBackApi } from '/@/api/website/feedback';

  import { useModal } from '/@/components/Modal';
  import FeedbackModal from './FeedbackModal.vue';

  import { columns } from './feedback.data';

  export default defineComponent({
    name: 'ResourceManagement',
    components: { BasicTable, FeedbackModal, TableAction },
    setup() {
      const current = ref(1);
      const searchInfo = reactive<Recordable>({});
      const [registerModal, { openModal }] = useModal();
      const [registerTable, { reload, expandAll, collapseAll }] = useTable({
        title: '回报问题列表',
        api: getFeedBackList,
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
      async function handleDone(record: Recordable) {
        const res = await completefeedBackApi(record.id);
        if (res) {
          reload();
        }
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
        handleDone,
      };
    },
  });
</script>
