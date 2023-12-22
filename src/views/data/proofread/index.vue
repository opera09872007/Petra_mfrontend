<template>
  <PageWrapper title="校对" contentBackground contentClass="p-4">
    <div class="p-4 mb-2 bg-white width: 1504px" style="margin: 10px 10px 60px 10px">
      <span>选择需要校对的资源库：</span>
      <TreeSelect
        class="treeselect-main"
        show-search
        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
        placeholder="资源库"
        :allow-clear="false"
        tree-default-expand-all
        :tree-data="repData"
        :fieldNames="{ label: 'title', value: 'id' }"
        treeNodeFilterProp="title"
        :disabled="treestatus"
        :onSelect="treeOnSelect"
      />
      <span>选择资源库对应的分类：</span>
      <TreeSelect
        class="treeselect-main"
        show-search
        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
        placeholder="分类"
        :allow-clear="false"
        tree-default-expand-all
        :tree-data="cateData"
        :fieldNames="{ label: 'name', value: 'id' }"
        treeNodeFilterProp="name"
        :disabled="cateStatus"
        :onSelect="cateOnSelect"
      />

      <a-button
        type="primary"
        style="float: right; margin: 10px 10px 10px 10px"
        @click="handleOk"
        :loading="loading"
        :disabled="cateStatus"
        >确认</a-button
      >
    </div>
    <div class="step-form-form">
      <a-steps :current="current">
        <a-step title="基本信息校对" />
        <a-step title="图像及文字校对" />
        <a-step title="完成" />
      </a-steps>
    </div>
    <div class="mt-5">
      <Step1
        @next="handleStep1Next"
        @prev="handleStep1Prev"
        :InfoData="InfoData"
        v-show="current === 0"
      />
      <Step2
        @prev="handleStepPrev"
        @return="handleStep2return"
        @proof="handleStep2proof"
        v-show="current === 1"
        v-if="initSetp2"
        :iframeURL="iframeURL"
      />
      <Step3
        v-show="current === 2"
        @prev="handleStep3Prev"
        @redo="handleRedo"
        v-if="initSetp3"
        :resultType="resultType"
      />
    </div>
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, ref, unref, reactive, onMounted, toRefs } from 'vue';

  import { getRepositoryTree } from '/@/api/data/repository';
  import {
    detailProofreadApi,
    finishProofreadApi,
    returnProofreadApi,
    refreshProofreadApi,
  } from '/@/api/data/detail';
  import { TreeItem } from '/@/components/Tree/index';
  import { TreeSelect } from 'ant-design-vue';
  import Step1 from './Step1.vue';
  import Step2 from './Step2.vue';
  import Step3 from './Step3.vue';
  import { PageWrapper } from '/@/components/Page';
  import { Steps } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getCateByResIdApi } from '/@/api/data/repository';

  let timer = null;
  export default defineComponent({
    name: 'ProofReadManagement',
    components: {
      Step1,
      Step2,
      Step3,
      PageWrapper,
      TreeSelect,
      [Steps.name]: Steps,
      [Steps.Step.name]: Steps.Step,
    },
    setup() {
      const loading = ref(false);
      const current = ref(0);
      const InfoData = ref<Recordable[]>([]);
      const state = reactive({
        initSetp2: false,
        initSetp3: false,
      });
      const repData = ref<TreeItem[]>([]);
      const cateData = ref<TreeItem[]>([]);
      const treestatus = ref(false);
      const cateStatus = ref(false);
      const iframeURL = ref('');
      const rep_id = ref(-1);
      const cate_id = ref(-1);

      const resultType = ref('');
      const detail_id = ref(-1);

      const { createMessage } = useMessage();
      function handleStep1Next() {
        if (rep_id.value == -1) {
          createMessage.error('请先选择需要校对的资源库');
        } else {
          current.value++;
          state.initSetp2 = true;
        }
      }
      async function handleStep1Prev(step1Values: any) {
        if (rep_id.value == -1) {
          createMessage.error('请先选择需要校对的资源库');
        } else {
          if (step1Values.value == '') {
            createMessage.error('请填写回退的原因');
            return;
          }
          const data = await returnProofreadApi(unref(detail_id), step1Values.value);
          resultType.value = '' + data;
          current.value += 2;
          state.initSetp3 = true;
        }
      }

      function handleStepPrev() {
        current.value--;
      }
      function handleStep3Prev() {
        current.value--;
      }
      async function handleStep2return(step2Values: any) {
        if (step2Values.value == '') {
          createMessage.error('请填写回退的原因');
          return;
        }
        const data = await returnProofreadApi(unref(detail_id), step2Values.value);
        resultType.value = '' + data;
        current.value++;
        state.initSetp3 = true;
      }
      async function handleStep2proof() {
        current.value++;
        state.initSetp3 = true;
        const data = await finishProofreadApi(unref(detail_id));
        resultType.value = '' + data;
      }
      function handleRedo() {
        getproofread(rep_id.value, cate_id.value);
        current.value = 0;
        state.initSetp2 = false;
        state.initSetp3 = false;
      }
      async function fetch() {
        try {
          repData.value = (await getRepositoryTree()) as unknown as TreeItem[];
        } catch (error) {
          console.log(error);
        }
      }
      async function getproofread(rep_id, cate_id) {
        treestatus.value = true;
        cateStatus.value = true;

        const data = await detailProofreadApi(rep_id, cate_id);
        var categories = '';
        for (let i = 0; i < data['items'][0].categories.length; i++) {
          if (i != 0) {
            categories += ',' + data['items'][0].categories[i].name;
          } else {
            categories += data['items'][0].categories[i].name;
          }
        }
        data['items'][0].categories = categories;
        InfoData.value = data['items'][0];
        iframeURL.value =
          'https://192.168.1.90:81/detail?info_id=' +
          data['items'][0].id +
          '&detail_id=' +
          data['detail_id'];
        detail_id.value = data['detail_id'];
      }
      function handleOk() {
        if (rep_id.value == -1) {
          createMessage.error('请先选择需要校对的资源库');
        } else {
          loading.value = true;
          setTimeout(() => {
            loading.value = false;
          }, 1500);
          getproofread(rep_id.value, cate_id.value);

          timer = setInterval(() => {
            refreshProofreadApi(unref(detail_id));
          }, 300000);
        }
      }
      async function treeOnSelect(value) {
        cateData.value = await getCateByResIdApi(unref(value));

        rep_id.value = value;
      }
      async function cateOnSelect(value) {
        cate_id.value = value;
      }
      onMounted(() => {
        fetch();
      });

      return {
        current,
        handleStep1Next,
        handleStep1Prev,
        handleStep2return,
        handleStep2proof,
        handleStep3Prev,
        handleRedo,
        handleStepPrev,

        ...toRefs(state),
        repData,
        treestatus,
        treeOnSelect,
        iframeURL,
        InfoData,
        rep_id,
        cate_id,
        resultType,
        cateData,
        handleOk,
        cateOnSelect,
        cateStatus,
        loading,
      };
    },
    beforeUnmount() {
      clearInterval(timer);
      timer = null;
    },
  });
</script>
<style lang="less" scoped>
  .step-form-content {
    padding: 24px;
    background-color: @component-background;
  }

  .step-form-form {
    width: 750px;
    margin: 0 auto;
  }

  .treeselect-main {
    width: 100%;
  }
</style>
