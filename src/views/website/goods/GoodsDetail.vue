<template>
  <PageWrapper
    dense
    contentFullHeight
    fixedHeight
    contentClass="flex"
    :title="`商品` + tableData.title + `的资料(按照资源库或分类上架)`"
    @back="goBack"
  >
    <div class="w-1/4 xl:w-1/5" style="overflow-y: auto">
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
        @change="treeDataChange"
        :value="selectedValue"
        treeNodeFilterProp="title"
        style="width: 100%"
        :multiple="true"
      />

      <a-button type="primary" style="float: right" @click="submit"> 提交 </a-button>
    </div>
    <div class="w-3/4 xl:w-4/5" style="overflow-y: auto">
      <CompositionTransfer
        ref="transferRef"
        :tree-data="cateTreeData"
        :edit-key="editKey"
        :disabled="disabled"
        :key="rekey"
      />
    </div>
  </PageWrapper>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { useGo } from '/@/hooks/web/usePage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { TreeSelect } from 'ant-design-vue';
  import { goodsDetailApi, addGoodsDetail, getGoodsDetail } from '/@/api/website/goods';
  import { CompositionTransfer } from '/@/components/Transfer';
  import { TreeItem } from '/@/components/Tree/index';
  import { getRepositoryTree, getCateByResIdApi } from '/@/api/data/repository';

  export default defineComponent({
    name: 'GoodsDetail',
    components: {
      PageWrapper,
      CompositionTransfer,
      TreeSelect,
    },
    setup() {
      const route = useRoute();
      const go = useGo();

      // 此处可以得到用户ID
      const goodsId = ref(route.params?.id);
      const currentKey = ref('rep');
      const { setTitle } = useTabs();
      const tableData = ref([]);
      const repData = ref<TreeItem[]>([]);
      const cateTreeData = ref<TreeItem[]>([]);
      const treeLoading = ref(false);
      const selectedValue = ref([]);
      const disabled = ref<Boolean>(false);
      const rekey = ref(0);
      const transferRef = ref();
      const editKey = [] as string[];
      const timer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      async function fetchData() {
        try {
          repData.value = (await getRepositoryTree()) as unknown as TreeItem[];
          const res = await getGoodsDetail(goodsId.value);
          selectedValue.value = res.rep_ids;
          if (selectedValue.value.length <= 1) {
            cateTreeData.value = (await getCateByResIdApi(
              selectedValue.value[0],
            )) as unknown as TreeItem[];
            treeLoading.value = false;
            rekey.value += 1;
          }
          await timer(500);
          transferRef.value.leftCheckedKey = res.cate_ids;
          console.log(res.value);
        } catch (error) {
          console.log(error);
        }
      }
      fetchData();
      async function treeDataChange(value) {
        try {
          var valueLength = value.length;
          if (valueLength >= 2) {
            disabled.value = true;
            cateTreeData.value = [];
          } else {
            disabled.value = false;
            treeLoading.value = true;
            cateTreeData.value = (await getCateByResIdApi(
              value[valueLength - 1],
            )) as unknown as TreeItem[];
            treeLoading.value = false;
            rekey.value += 1;
          }
          selectedValue.value = value;
        } catch (error) {
          console.log(error);
        }
      }

      async function submit() {
        await addGoodsDetail(goodsId.value, selectedValue.value, transferRef.value.emitKeys);
      }

      const getData = async () => {
        const res = await goodsDetailApi(goodsId.value);
        if (res) {
          tableData.value = res;
          setTitle('详情：商品' + tableData.value.title);
        }
      };
      getData();

      // 页面左侧点击返回链接时的操作
      function goBack() {
        go('/website/goods');
      }

      return {
        goodsId,
        currentKey,
        goBack,
        tableData,
        getData,
        repData,
        treeLoading,
        cateTreeData,
        selectedValue,
        treeDataChange,
        disabled,
        editKey,
        submit,
        rekey,
        transferRef,
      };
    },
    data() {},
  });
</script>

<style></style>
