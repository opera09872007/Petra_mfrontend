<template>
  <PageWrapper :title="'任务时间线'" contentBackground>
    <template #extra> </template>
    <template #footer>
      <a-tabs default-active-key="detail" v-model:activeKey="currentKey">
        <a-tab-pane key="detail" tab="流程及详情" />
      </a-tabs>
    </template>
    <div class="pt-4 m-4 desc-wrap">
      <template v-if="currentKey == 'detail'">
        <a-card title="任务进度" :bordered="false">
          <a-steps
            direction="vertical"
            :current="nodesData.length"
            progress-dot
            size="small"
            :nodesData="nodesData"
          >
            <a-step v-for="(item, index) in nodesData" :key="index" :title="item.status">
              <template #description>
                <div>{{ item.workflow_type_name }}</div>
                <div v-if="item.workflow_type_name.includes('返回')"
                  ><div v-if="item.memo == ''">标记</div></div
                >
                <div>{{ item.now_node_person_name }}</div>
                <p>{{ item.create_time }}</p>
                <p>{{ item.memo }}</p>
              </template>
            </a-step>
          </a-steps>
        </a-card>
      </template>
    </div>
  </PageWrapper>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { useGo } from '/@/hooks/web/usePage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { Tabs, Card, Steps, Descriptions } from 'ant-design-vue';
  import { getNodesByDetailIdApi } from '/@/api/data/workflowTask';

  export default defineComponent({
    name: 'TaskNodes',
    components: {
      PageWrapper,
      ATabs: Tabs,
      ATabPane: Tabs.TabPane,
      [Card.name]: Card,
      [Steps.name]: Steps,
      [Steps.Step.name]: Steps.Step,
      [Descriptions.name]: Descriptions,
      [Descriptions.Item.name]: Descriptions.Item,
    },
    setup() {
      const detailData = ref([]);
      const nodesData = ref([]);
      const route = useRoute();
      const array: string[] = [];
      const go = useGo();
      const detailId = ref(route.params?.id);
      const currentKey = ref('detail');
      const { setTitle } = useTabs();
      const getData = async () => {
        nodesData.value = await getNodesByDetailIdApi(detailId.value);

        for (let index = 0; index < nodesData.value.length; index++) {
          array[index] = nodesData[index];
        }
        setTitle('任务时间线');
      };
      getData();

      function goBack() {
        go('/data/task');
      }
      return { detailId, currentKey, goBack, getData, detailData, nodesData };
    },
  });
</script>

<style></style>
