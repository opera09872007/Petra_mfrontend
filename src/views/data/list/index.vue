<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <div class="p-2 w-1/4 xl:w-1/5" style="overflow-y: auto">
      <div class="p-4 mb-2 bg-white width: 504px;">
        <TreeSelect
          class="treeselect-main"
          show-search
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="资源库"
          :allow-clear="false"
          tree-default-expand-all
          :tree-data="repData"
          :fieldNames="{ label: 'title', value: 'id' }"
          :loading="treeLoading"
          :onSelect="loadTreeData"
          treeNodeFilterProp="title"
        />
      </div>
      <div class="p-2 bg-white">
        <Spin :spinning="treeLoading">
          <BasicTree
            :fieldNames="{ title: 'name', key: 'id' }"
            ref="asyncExpandTreeRef"
            :treeData="cateTreeData"
            @select="handleSelect"
            toolbar
            search
          />
        </Spin>
      </div>
    </div>

    <BasicTable
      @register="registerTable"
      class="w-3/4 xl:w-4/5"
      :searchInfo="searchInfo"
      :current="current"
      :pagination="{
        current: current,
      }"
      @change="handleTableChange"
      :load-data="onLoadData"
    >
      <template #toolbar>
        <a-button type="primary" @click="handleCreate">新增资源</a-button>
        <a-button type="primary" @click="expandAll">展开全部</a-button>
        <a-button type="primary" @click="collapseAll">折叠全部</a-button>
      </template>
      <template #bodyCell="{ record, column }">
        <TableAction
          v-if="
            column.dataIndex == 'action' &&
            (record.work_flow_type == 0 || record.work_flow_type == 3) &&
            record.is_null == 0
          "
          :actions="[
            {
              icon: 'ant-design:plus-outlined',
              tooltip: '添加子类',
              onClick: handleAdd.bind(null, record),
            },
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
              icon: 'ant-design:retweet-outlined',
              color: 'success',
              tooltip: '重置',
              popConfirm: {
                title: '是否重置当前对象的所有状态',
                confirm: handleReset.bind(null, record),
              },
              ifShow: hasPermission('1005'),
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
            record.work_flow_type != 0 &&
            record.work_flow_type != 3 &&
            record.is_null == 0
          "
          :actions="[
            {
              icon: 'ant-design:plus-outlined',
              tooltip: '添加子类',
              onClick: handleAdd.bind(null, record),
            },
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
              icon: 'ant-design:retweet-outlined',
              color: 'success',
              tooltip: '重置',
              popConfirm: {
                title: '是否重置当前对象的所有状态',
                confirm: handleReset.bind(null, record),
              },
              ifShow: hasPermission('1005'),
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
        <TableAction
          v-if="column.dataIndex == 'action' && record.is_null == 1"
          :actions="[
            {
              icon: 'ant-design:plus-outlined',
              tooltip: '添加子类',
              onClick: handleAdd.bind(null, record),
            },
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
  import { defineComponent, reactive, ref, onMounted, nextTick, unref } from 'vue';

  import { BasicTree, TreeItem, TreeActionType } from '/@/components/Tree/index';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import {
    getInfoList,
    infoDeleteApi,
    finishUploadApi,
    infoResetStatusApi,
  } from '/@/api/data/info';
  import { PageWrapper } from '/@/components/Page';

  import { useModal } from '/@/components/Modal';
  import ListModal from './ListModal.vue';

  import { columns, searchFormSchema } from './list.data';
  import { useGo } from '/@/hooks/web/usePage';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useUserStore } from '/@/store/modules/user';

  import { Spin, TreeSelect } from 'ant-design-vue';

  import { getRepositoryTree, getCateByResIdApi } from '/@/api/data/repository';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();

  export default defineComponent({
    name: 'DataListManagement',
    components: {
      BasicTable,
      PageWrapper,
      ListModal,
      TableAction,
      BasicTree,
      Spin,
      TreeSelect,
    },
    setup() {
      const go = useGo();
      const visible = ref<boolean>(false);
      const current = ref(1);
      const hide = () => {
        visible.value = false;
      };
      const { hasPermission } = usePermission();
      const [registerModal, { openModal }] = useModal();
      const searchInfo = reactive<Recordable>({});
      const Infodata = ref<Recordable[]>([]);
      const userStore = useUserStore();
      if (!hasPermission('1000')) {
        searchInfo.id = userStore.getUserInfo.userId;
      }
      const [registerTable, { reload, updateTableDataRecord, expandAll, collapseAll }] = useTable({
        title: '资源列表',
        api: getInfoList,
        isTreeTable: true,
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
          width: 220,
          title: '操作',
          dataIndex: 'action',
          // slots: { customRender: 'action' },
        },
      });

      function handleCreate() {
        openModal(true, {
          cateId: searchInfo.cateId,
          repId: searchInfo.repId,
          isUpdate: false,
          isAdd: false,
          currentId: '',
        });
      }
      function handleAdd(record: Recordable) {
        openModal(true, {
          cateId: searchInfo.cateId,
          repId: searchInfo.repId,
          record,
          isAdd: true,
          currentId: record.id,
        });
      }
      function handleEdit(record: Recordable) {
        openModal(true, {
          cateId: searchInfo.cateId,
          repId: searchInfo.repId,
          record,
          isUpdate: true,
          isAdd: false,
          currentId: record.id,
        });
      }

      async function handleDelete(record: Recordable) {
        try {
          await infoDeleteApi(record.id);
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
        go('/data/data_detail/' + record.id + '/-1');
      }
      async function handleReset(record: Recordable) {
        const data = await infoResetStatusApi(record.id);
        if (data == 1) {
          createMessage.success('重置所有状态成功');
          reload();
        }
      }
      async function handleDone(record: Recordable) {
        try {
          await finishUploadApi(record.id, 2).then(function () {
            reload();
          });
        } catch (error) {
          console.log(error);
        }
      }

      const repData = ref<TreeItem[]>([]);
      const cateTreeData = ref<TreeItem[]>([]);
      const treeLoading = ref(false);
      const asyncExpandTreeRef = ref<Nullable<TreeActionType>>(null);
      const asyncTreeRef = ref<Nullable<TreeActionType>>(null);

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
      function onLoadData(treeNode) {
        console.log(235);
        console.log(treeNode);

        // return new Promise((resolve: (value?: unknown) => void) => {
        //   if (!treeNode.children) {
        //     resolve();
        //     return;
        //   }
        //   setTimeout(() => {
        //     const asyncTreeAction: TreeActionType | null = unref(asyncTreeRef);
        //     if (asyncTreeAction) {
        //       const nodeChildren = [
        //         { title: `Child Node ${treeNode.eventKey}-0`, key: `${treeNode.eventKey}-0` },
        //         { title: `Child Node ${treeNode.eventKey}-1`, key: `${treeNode.eventKey}-1` },
        //       ];
        //       asyncTreeAction.updateNodeByKey(treeNode.eventKey, { children: nodeChildren });
        //       asyncTreeAction.setExpandedKeys([
        //         treeNode.eventKey,
        //         ...asyncTreeAction.getExpandedKeys(),
        //       ]);
        //     }

        //     resolve();
        //     return;
        //   }, 1000);
        // });
      }
      return {
        hasPermission,
        registerTable,
        registerModal,
        handleCreate,
        handleAdd,
        handleEdit,
        handleDelete,
        handleSuccess,
        handleSelect,
        handleView,
        searchInfo,
        fetch,
        repData,
        loadTreeData,
        cateTreeData,
        asyncTreeRef,
        asyncExpandTreeRef,
        treeLoading,
        Infodata,
        visible,
        hide,
        current,
        handleTableChange,
        handleDone,
        expandAll,
        collapseAll,
        onLoadData,
        handleReset,
      };
    },
  });
</script>

<style>
  .treeselect-main {
    width: 100%;
  }
</style>
