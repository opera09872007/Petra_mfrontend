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

  import { infoDetailApi } from '/@/api/data/info';

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

      // 此处可以得到用户ID
      const status = ref(route.params?.status);
      const infoId = ref(route.params?.id);
      const currentKey = ref('detail');
      const { setTitle } = useTabs();
      const tableData = ref([]);

      const searchInfo = reactive<Recordable>({});
      searchInfo.infoId = infoId.value;
      if (status.value == '3') {
        searchInfo.type = 0;
      } else {
        searchInfo.type = 1;
      }

      const Infodata = ref<Recordable[]>([]);
      const getData = async () => {
        const res = await infoDetailApi(infoId.value);
        if (res) {
          tableData.value = res;
          setTitle('详情：' + tableData.value.name);
        }
      };

      getData();

      const [registerTable, {}] = useTable({
        title: '资源详细',
        api: getDetailList,
        rowKey: 'id',
        columns: detailColumns,
        dataSource: Infodata,
        useSearchForm: false,
        isTreeTable: false,
        showTableSetting: true,
        bordered: true,
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
        infoId,
        Infodata,
        currentKey,
        goBack,
        tableData,
        getData,
        registerTable,

        handleShow,
        searchInfo,
      };
    },
  });
</script>

<style></style>
