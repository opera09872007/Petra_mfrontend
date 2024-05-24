<template>
  <PageWrapper :title="tableData.name" dense contentFullHeight fixedHeight contentClass="flex">
    <BasicDetailTable
      :endPoint="endPoint"
      :regStr="regStr"
      :infoId="Number(infoId)"
      :optionOffset="0"
      :workflowType="workflowType"
      :creatorId="Number(tableData.creator_id)"
      :isProofread="false"
      :titleSuffix="'(当前任务)'"
    />
    <BasicDetailTable
      :endPoint="endPoint"
      :regStr="regStr"
      :infoId="Number(infoId)"
      :optionOffset="-1"
      :workflowType="workflowType"
      :creatorId="Number(tableData.creator_id)"
      :isProofread="false"
      :titleSuffix="'(上一任务)'"
    />
  </PageWrapper>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';

  import { useTabs } from '/@/hooks/web/useTabs';
  import { infoDetailApi, getinfoRepRegStrApi } from '/@/api/data/info';

  import { useUserStore } from '/@/store/modules/user';
  import { BasicDetailTable } from '/@/views/data/list/DataDetailTable';

  export default defineComponent({
    name: 'DataDetail',
    components: {
      PageWrapper,
      BasicDetailTable,
    },
    setup() {
      const route = useRoute();
      const userStore = useUserStore();
      const endPoint = userStore.getUserInfo.end_point;
      const userId = userStore.getUserInfo.userId;

      const regStr = ref('');
      // 此处可以得到用户ID
      const infoId = ref(route.params?.id);
      const { setTitle } = useTabs();
      const tableData = ref([]);
      const workflowType = ref(-1);

      const Infodata = ref<Recordable[]>([]);

      const getData = async () => {
        const res = await infoDetailApi(Number(infoId.value));
        if (res) {
          tableData.value = res;
          workflowType.value = tableData.value.workflow_type_number;
          setTitle('详情：' + tableData.value.name);
        }
      };

      function generateRegex(str: string): string {
        const regexStr = str.replace(/0/g, '\\d');
        const regexStrWithDash = regexStr.replace(/-/g, '-');
        const regex = new RegExp(`^${regexStrWithDash}$`);
        return regex.toString();
      }
      const getRegStr = async () => {
        const res = await getinfoRepRegStrApi(Number(infoId.value));
        if (res) {
          regStr.value = generateRegex(res);
        }
      };

      const contain_text = ref(false);
      getData();
      getRegStr();

      return {
        infoId,
        Infodata,
        tableData,
        endPoint,
        getData,
        regStr,
        userId,
        contain_text,
        workflowType,
      };
    },
    data() {
      return {
        scrollerHeight: window.innerHeight - 300 - 200 + 'px',
        scrollerWidth: this.calWidth(),
      };
    },
    mounted() {
      const that = this;
      window.onresize = function windowResize() {
        that.scrollerHeight = window.innerHeight - 300 - 200 + 'px';
        if (window.innerWidth < 1000) {
          that.scrollerWidth = window.innerWidth / 2 - 70 + 'px';
        } else {
          that.scrollerWidth = window.innerWidth / 2 - 280 + 'px';
        }
      };
    },
    methods: {
      calWidth() {
        if (window.innerWidth < 1000) {
          return window.innerWidth / 2 - 70 + 'px';
        } else {
          return window.innerWidth / 2 - 280 + 'px';
        }
      },
    },
  });
</script>

<style></style>
