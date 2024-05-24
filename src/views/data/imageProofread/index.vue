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
        <a-cascader
          v-model:value="cascaderValue"
          :field-names="{ label: 'label', value: 'value', children: 'children' }"
          :options="cascaderOptions"
          placeholder="请选择校对类型及轮次"
        />
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
    <ListModal @register="registerModal" @success="handleSuccess" />
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, unref } from 'vue';

  import { TreeItem, TreeActionType } from '/@/components/Tree/index';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';

  import { getTaskListByPage, finishTaskApi } from '/@/api/data/workflowTask';
  import { PageWrapper } from '/@/components/Page';

  import { useModal } from '/@/components/Modal';
  import ListModal from './ListModal.vue';

  import { columns, searchFormSchema } from './list.data';
  import { useGo } from '/@/hooks/web/usePage';
  import { usePermission } from '/@/hooks/web/usePermission';

  import { Cascader } from 'ant-design-vue';

  import { getTaskTypeTreeList } from '/@/api/data/workTaskType';
  import { getProofreadApi } from '/@/api/data/workflowTask';

  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  export default defineComponent({
    name: 'ImageProofReadManagement',
    components: {
      BasicTable,
      PageWrapper,
      ListModal,
      TableAction,
      [Cascader.name]: Cascader,
    },
    setup() {
      const go = useGo();
      const visible = ref<boolean>(false);
      const current = ref(1);
      const hide = () => {
        visible.value = false;
      };

      const { hasPermission } = usePermission();
      // if (hasPermission('1004')) {
      //   proofread_count.value = '3';
      // }
      // if (hasPermission('1003')) {
      //   proofread_count.value = '2';
      // }
      // if (hasPermission('1002')) {
      //   proofread_count.value = '1';
      // }
      // if (hasPermission('1001')) {
      //   proofread_count.value = '0';
      // }
      const [registerModal, { openModal }] = useModal();
      const searchInfo = reactive<Recordable>({});
      const userStore = useUserStore();
      const cascaderOptions = ref([]);

      const cascaderValue = ref<string[]>([]);
      searchInfo.nowHandlerId = userStore.getUserInfo.userId;
      searchInfo.repId = userStore.getUserInfo.now_work_repository;
      searchInfo.status = '1';

      const Infodata = ref<Recordable[]>([]);
      const [registerTable, { reload, updateTableDataRecord }] = useTable({
        title: '已申请校对任务列表',
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
      async function getTypeTree(repId: number) {
        const result = await getTaskTypeTreeList(repId);
        cascaderOptions.value = unref(result);
      }
      getTypeTree(searchInfo.repId);
      async function handleCreate() {
        if (cascaderValue.value[0] && cascaderValue.value[1]) {
          loading.value = true;
          searchInfo.repId = Number(useUserStore().getUserInfo.now_work_repository);

          try {
            await getProofreadApi(searchInfo.repId, cascaderValue.value[0], cascaderValue.value[1]);
          } catch (error) {
            console.log(error);
          }
          loading.value = false;
          reload();
        } else {
          createMessage.error('请先选择校对的任务及轮次');
        }
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
          await finishTaskApi(record.info_id, 2).then(function () {
            reload();
          });
        } catch (error) {
          console.log(error);
        }
      }

      function handleSuccess({ isUpdate, values }) {
        if (isUpdate) {
          updateTableDataRecord(values.id, values);
        } else {
          reload();
        }
      }

      function handleSelect(cateId = '') {
        current.value = 1;
        searchInfo.cateId = cateId[0];

        setTimeout(() => {
          reload();
        }, 100);
      }

      function handleTableChange(pagination) {
        current.value = pagination.current;
      }

      function handleView(record: Recordable) {
        go('/data/proofread_detail/' + record.info_id);
      }

      const repData = ref<TreeItem[]>([]);
      const cateTreeData = ref<TreeItem[]>([]);
      const treeLoading = ref(false);

      const loading = ref(false);
      const asyncExpandTreeRef = ref<Nullable<TreeActionType>>(null);
      const asyncTreeRef = ref<Nullable<TreeActionType>>(null);

      return {
        hasPermission,
        registerTable,
        registerModal,
        handleCreate,
        handleEdit,
        handleDone,
        handleSuccess,
        handleSelect,
        handleView,
        searchInfo,
        fetch,
        repData,
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
        cascaderOptions,
        cascaderValue,
      };
    },
  });
</script>

<style>
  .treeselect-main {
    width: 100%;
  }
</style>
