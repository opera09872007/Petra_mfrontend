<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #toolbar>
        <a-select
          v-model:value="task_type"
          :options="taskOptions"
          :fieldNames="{ label: 'name', value: 'id' }"
          @change="handleSelectChange"
        />
        <a-button type="primary" @click="handleCreate" :loading="loading">申请任务</a-button>
      </template>
      <template #bodyCell="{ record, column }">
        <TableAction
          v-if="
            column.dataIndex == 'action' &&
            [0, 1, 2].includes(Number(record.workflow_type_number) % 5) &&
            ![0, 1, 2].includes(Number(record.workflow_type_number)) &&
            record.info_name
          "
          :actions="[
            {
              icon: 'ant-design:bars-outlined',
              tooltip: '查看资源详情',
              onClick: handleView.bind(null, record),
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
        <TableAction
          v-if="
            column.dataIndex == 'action' &&
            [0, 1, 2].includes(Number(record.workflow_type_number)) &&
            record.info_name &&
            record.worktask_type_id == taskOptions0.value
          "
          :actions="[
            {
              icon: 'clarity:note-edit-line',
              tooltip: '编辑资源',
              onClick: handleEdit.bind(null, record),
            },
            {
              icon: 'ant-design:bars-outlined',
              tooltip: '查看资源详情',
              onClick: handleView.bind(null, record),
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
        <TableAction
          v-if="
            column.dataIndex == 'action' &&
            [0, 1, 2].includes(Number(record.workflow_type_number)) &&
            record.info_name &&
            record.worktask_type_id != taskOptions0.value
          "
          :actions="[
            {
              icon: 'ant-design:bars-outlined',
              tooltip: '查看资源详情',
              onClick: handleView.bind(null, record),
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
        <TableAction
          v-if="column.dataIndex == 'action' && record.info_name == ''"
          :actions="[
            {
              icon: 'clarity:note-edit-line',
              tooltip: '编辑资源',
              onClick: handleEdit.bind(null, record),
            },
            {
              icon: 'ant-design:delete-outlined',
              color: 'error',
              tooltip: '删除此资源',
              popConfirm: {
                title: '是否确认删除',
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <ListModal @register="registerModal" @success="handleSuccess" />
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getTaskListByPage, finishTaskApi } from '/@/api/data/workflowTask';
  import { PageWrapper } from '/@/components/Page';

  import { columns, searchFormSchema } from './list.data';
  import { useGo } from '/@/hooks/web/usePage';
  import { usePermission } from '/@/hooks/web/usePermission';

  import { Select } from 'ant-design-vue';

  import { TaskAddApi, taskDeleteApi } from '/@/api/data/workflowTask';
  import { useUserStore } from '/@/store/modules/user';
  import { getTaskTypeList } from '/@/api/data/workTaskType';
  import { useModal } from '/@/components/Modal';
  import ListModal from './ListModal.vue';
  export default defineComponent({
    name: 'ImageDealManagement',
    components: {
      BasicTable,
      PageWrapper,
      TableAction,
      [Select.name]: Select,
      ListModal,
    },
    setup() {
      const go = useGo();
      const visible = ref<boolean>(false);
      const current = ref(1);
      const pageSize = ref(10);
      const total = ref(1);
      const hide = () => {
        visible.value = false;
      };
      const { hasPermission } = usePermission();
      const task_type = ref('-1');
      const searchInfo = reactive<Recordable>({});
      const userStore = useUserStore();
      const [registerModal, { openModal }] = useModal();
      searchInfo.nowHandlerId = userStore.getUserInfo.userId;
      searchInfo.repId = userStore.getUserInfo.now_work_repository;
      searchInfo.status = '2';
      const Taskdata = ref<Recordable[]>([]);
      const taskOptions = ref<Recordable>();
      const taskOptions0 = ref(-1);
      const getTaskOptionsAndList = async () => {
        taskOptions.value = await getTaskTypeList(
          Number(userStore.getUserInfo.now_work_repository),
        );
        task_type.value = taskOptions.value[0].id;
        taskOptions0.value = taskOptions.value[0].id;
        console.log(taskOptions0.value);

        searchInfo.taskType = task_type.value;
        reload();
      };
      getTaskOptionsAndList();
      const [registerTable, { reload, updateTableDataRecord }] = useTable({
        title: '已申请图像任务列表',
        rowKey: 'id',
        api: getTaskListByPage,
        columns,
        dataSource: Taskdata,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema,
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        handleSearchInfoFn(info) {
          console.log(info);

          return info;
        },
        immediate: false,
        actionColumn: {
          width: 120,
          title: '操作',
          dataIndex: 'action',
          // slots: { customRender: 'action' },
        },
      });

      async function handleCreate() {
        loading.value = true;
        try {
          await TaskAddApi({
            repId: Number(searchInfo.repId),
            taskType: Number(searchInfo.taskType),
          });
        } catch (error) {
          console.log(error);
        }
        loading.value = false;
        reload();
      }

      async function handleDone(record: Recordable) {
        try {
          await finishTaskApi(record.info_id, 6).then(function () {
            reload();
          });
        } catch (error) {
          console.log(error);
        }
      }

      async function handleSelectChange() {
        searchInfo.taskType = task_type.value;
        reload();
      }
      function handleView(record: Recordable) {
        // go('/data/deal_detail/' + record.info_id);
        go('/data/data_detail/' + record.info_id);
      }
      function handleEdit(record: Recordable) {
        if (record.info_id != -1) {
          openModal(true, {
            repId: searchInfo.repId,
            record,
            isUpdate: true,
            currentId: record.info_id,
          });
        } else {
          openModal(true, {
            repId: searchInfo.repId,
            record,
            isUpdate: false,
            currentId: record.info_id,
          });
        }
      }

      async function handleDelete(record: Recordable) {
        try {
          await taskDeleteApi(record.id);
        } catch (error) {
          console.log(error);
        }
        reload();
      }

      function handleSuccess({ isUpdate, values }) {
        if (isUpdate) {
          updateTableDataRecord(values.id, values);
        } else {
          reload();
        }
      }
      const treeLoading = ref(false);
      const loading = ref(false);

      return {
        hasPermission,
        registerTable,

        handleCreate,
        handleDone,
        handleEdit,
        handleView,
        searchInfo,
        treeLoading,
        loading,
        Taskdata,
        visible,
        hide,
        current,
        pageSize,
        total,
        handleSelectChange,
        task_type,
        taskOptions,
        registerModal,
        handleSuccess,
        taskOptions0,
        handleDelete,
      };
    },
  });
</script>

<style>
  .treeselect-main {
    width: 100%;
  }
</style>
