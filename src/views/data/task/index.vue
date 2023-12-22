<template>
  <div>
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: 'ant-design:bars-outlined',
              tooltip: '查看资源详情',
              onClick: handleView.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent, reactive } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getTaskListByPage } from '/@/api/data/workflowTask';

  import { columns, searchFormSchema } from './task.data';
  import { useGo } from '/@/hooks/web/usePage';
  import { useModal } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';

  export default defineComponent({
    name: 'DataTaskManagement',
    components: { BasicTable, TableAction },
    setup() {
      const go = useGo();
      const userStore = useUserStore();
      const searchInfo = reactive<Recordable>({});
      searchInfo.rep_id = userStore.getUserInfo.now_work_repository;
      const [registerModal, {}] = useModal();
      const [registerTable, { reload }] = useTable({
        title: '任务列表',
        api: getTaskListByPage,
        columns,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema,
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        actionColumn: {
          width: 180,
          title: '操作',
          dataIndex: 'action',
          slots: { customRender: 'action' },
          fixed: undefined,
        },
      });

      function handleSuccess() {
        reload();
      }

      async function handleView(record: Recordable) {
        go('/data/task_detail/' + record.info_id + '/' + record.type);
      }
      return {
        registerTable,
        handleSuccess,
        handleView,
        registerModal,
        searchInfo,
      };
    },
  });
</script>
