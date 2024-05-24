<template>
  <PageWrapper
    :title="tableData.name"
    dense
    contentFullHeight
    fixedHeight
    contentClass="flex"
    @back="goBack"
  >
    <div class="p-2 w-4/4 xl:w-4/4">
      <div class="p-4 mb-2 bg-white" style="height: 100%">
        <BasicTable
          @register="registerTable"
          :searchInfo="searchInfo"
          style="height: 100%"
          ref="tableRef"
        >
          <template #bodyCell="{ record, column }">
            <TableAction
              v-if="column.dataIndex == 'action'"
              :actions="[
                {
                  icon: 'ant-design:info-circle-outlined',
                  tooltip: '查看任务时间线',
                  onClick: handleShow.bind(null, record),
                },
              ]"
            />
          </template>
        </BasicTable> </div
    ></div>
  </PageWrapper>
</template>

<script lang="ts">
  import { defineComponent, ref, reactive } from 'vue';
  import { useRoute } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { detailColumns } from './task.data';
  import { useGo } from '/@/hooks/web/usePage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { getDetailList } from '/@/api/data/detail';

  import { getTaskImgTypeApi } from '/@/api/data/workflowTask';

  export default defineComponent({
    name: 'TaskDetail',
    components: {
      PageWrapper,
      BasicTable,
      TableAction,
    },
    setup() {
      const route = useRoute();
      const go = useGo();
      const taskId = ref(route.params?.id);
      // 此处可以得到用户ID
      console.log(route.params);

      const currentKey = ref('detail');
      const {} = useTabs();
      const tableData = ref([]);

      const searchInfo = reactive<Recordable>({});
      searchInfo.taskId = taskId.value;

      const Infodata = ref<Recordable[]>([]);
      const getImgType = async () => {
        let result = await getTaskImgTypeApi(Number(taskId.value));
        searchInfo.type = Number(result.img_type);
        reload();
      };
      getImgType();
      const [registerTable, { reload }] = useTable({
        title: '资源详细',
        rowKey: 'id',
        api: getDetailList,
        columns: detailColumns,
        dataSource: Infodata,
        useSearchForm: false,
        isTreeTable: false,
        showTableSetting: true,
        bordered: true,
        immediate: false,
        handleSearchInfoFn(info) {
          return info;
        },
        actionColumn: {
          title: '操作',
          dataIndex: 'action',
          width: '10%',
          // slots: { customRender: 'action' },
        },
      });
      // 页面左侧点击返回链接时的操作
      function goBack() {
        go('/data/task');
      }

      function handleShow(record: Recordable) {
        go('/data/task_nodes/' + record.id);
      }

      return {
        taskId,
        Infodata,
        currentKey,
        goBack,
        tableData,
        registerTable,

        handleShow,
        searchInfo,
      };
    },
  });
</script>

<style></style>
