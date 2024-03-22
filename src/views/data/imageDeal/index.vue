<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable
      @register="registerTable"
      :searchInfo="searchInfo"
      :current="current"
      :pagination="{
        current: current,
      }"
      @change="handleTableChange"
    >
      <template #toolbar>
        <a-button type="primary" @click="handleCreate" :loading="loading">申请任务</a-button>
      </template>
      <template #bodyCell="{ record, column }">
        <TableAction
          v-if="column.dataIndex == 'action'"
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
      </template>
    </BasicTable>
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, onMounted, nextTick, unref } from 'vue';

  import { TreeItem, TreeActionType } from '/@/components/Tree/index';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getTaskListByPage, finishTaskApi } from '/@/api/data/workflowTask';
  import { PageWrapper } from '/@/components/Page';

  import { columns, searchFormSchema } from './list.data';
  import { useGo } from '/@/hooks/web/usePage';
  import { usePermission } from '/@/hooks/web/usePermission';

  import { getRepositoryTree, getCateByResIdApi } from '/@/api/data/repository';
  import { getImageDealTaskApi } from '/@/api/data/detail';
  import { useUserStore } from '/@/store/modules/user';

  export default defineComponent({
    name: 'ImageDealManagement',
    components: {
      BasicTable,
      PageWrapper,

      TableAction,
    },
    setup() {
      const go = useGo();
      const visible = ref<boolean>(false);
      const current = ref(1);
      const hide = () => {
        visible.value = false;
      };
      const { hasPermission } = usePermission();

      const searchInfo = reactive<Recordable>({});
      const userStore = useUserStore();

      searchInfo.nowHandlerId = userStore.getUserInfo.userId;
      searchInfo.repId = userStore.getUserInfo.now_work_repository;
      searchInfo.status = '5';
      const Infodata = ref<Recordable[]>([]);
      const [registerTable, { reload }] = useTable({
        title: '已申请图像任务列表',
        api: getTaskListByPage,
        rowKey: 'id',
        columns,
        dataSource: Infodata,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema,
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        handleSearchInfoFn(info) {
          return info;
        },
        actionColumn: {
          width: 120,
          title: '操作',
          dataIndex: 'action',
          // slots: { customRender: 'action' },
        },
      });

      async function handleCreate() {
        loading.value = true;
        searchInfo.repId = Number(useUserStore().getUserInfo.now_work_repository);
        try {
          await getImageDealTaskApi(searchInfo.repId);
        } catch (error) {
          console.log(error);
        }
        loading.value = false;
        reload();
      }

      function handleEdit(record: Recordable) {
        openModal(true, {
          cateId: searchInfo.cateId,
          repId: searchInfo.repId,
          record,
          isUpdate: true,
          currentId: record.id,
        });
      }

      async function handleDone(record: Recordable) {
        try {
          await finishTaskApi(record.id, 6).then(function () {
            reload();
          });
        } catch (error) {
          console.log(error);
        }
      }

      function handleTableChange(pagination) {
        current.value = pagination.current;
      }

      function handleView(record: Recordable) {
        go('/data/deal_detail/' + record.info_id);
      }

      const repData = ref<TreeItem[]>([]);
      const cateTreeData = ref<TreeItem[]>([]);
      const treeLoading = ref(false);
      const asyncExpandTreeRef = ref<Nullable<TreeActionType>>(null);
      const asyncTreeRef = ref<Nullable<TreeActionType>>(null);
      const loading = ref(false);

      async function fetch() {
        try {
          repData.value = (await getRepositoryTree()) as unknown as TreeItem[];
        } catch (error) {
          console.log(error);
        }
      }
      onMounted(() => {
        fetch();
      });
      const timer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      async function loadTreeData(value) {
        try {
          searchInfo.cateId = -1;
          treeLoading.value = true;
          cateTreeData.value = (await getCateByResIdApi(value)) as unknown as TreeItem[];
          await timer(500);
          treeLoading.value = false;
          nextTick(() => {
            unref(asyncExpandTreeRef)?.expandAll(true);
          });

          searchInfo.repId = value;
          reload();
        } catch (error) {
          console.log(error);
        }
      }
      return {
        hasPermission,
        registerTable,

        handleCreate,
        handleEdit,
        handleDone,

        handleView,
        searchInfo,
        fetch,
        repData,
        loadTreeData,
        cateTreeData,
        asyncTreeRef,
        asyncExpandTreeRef,
        treeLoading,
        loading,
        Infodata,
        visible,
        hide,
        current,
        handleTableChange,
      };
    },
  });
</script>

<style>
  .treeselect-main {
    width: 100%;
  }
</style>
