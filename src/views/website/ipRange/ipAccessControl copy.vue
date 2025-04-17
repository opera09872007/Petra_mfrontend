<template>
  <PageWrapper
    dense
    contentFullHeight
    fixedHeight
    contentClass="flex"
    :title="`IP-` + tableData.network + `的访问控制`"
    @back="goBack"
  >
    <div :class="mode === 'period' ? 'w-full' : 'w-1/4 xl:w-1/5'" style="overflow-y: auto">
      <div class="flex flex-col space-y-4">
        <!-- 将select和新button放在同一行 -->
        <div class="flex items-center space-x-2">
          <a-select v-model:value="mode" style="width: 200px" placeholder="请选择操作模式">
            <a-select-option value="period">根据期数</a-select-option>
            <a-select-option value="category">根据分类</a-select-option>
          </a-select>
          <a-button type="primary" @click="addGroup">
            <PlusOutlined />
            增加组
          </a-button>
        </div>

        <!-- 使用v-for循环渲染多组组件 -->
        <div v-for="(group, index) in groups" :key="index" class="p-3 border rounded-md">
          <div class="mb-2 flex justify-between items-center">
            <span class="font-medium">组 {{ index + 1 }}</span>
            <a-button v-if="index > 0" type="text" danger @click="removeGroup(index)">
              <DeleteOutlined />
            </a-button>
          </div>

          <!-- TreeSelect和期数选择作为一组 -->
          <div class="space-y-3">
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
              @change="(value) => treeDataChange(value, index)"
              :value="group.selectedValue"
              treeNodeFilterProp="title"
              style="width: 100%"
              :multiple="true"
            />

            <a-select
              v-if="mode === 'period'"
              v-model:value="group.selectedPeriod"
              style="width: 100%"
              placeholder="请选择期数"
              :options="periodOptions"
              mode="multiple"
            />
          </div>
        </div>

        <a-button
          type="primary"
          style="margin-top: 16px; width: 300px; max-width: 300px"
          @click="submit"
        >
          提交
        </a-button>
      </div>
    </div>
    <!-- 只在 category 模式下显示右侧区域 -->
    <div v-if="mode === 'category'" class="w-3/4 xl:w-4/5" style="overflow-y: auto">
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
  import { defineComponent, ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { useGo } from '/@/hooks/web/usePage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { TreeSelect, Select } from 'ant-design-vue';
  import { ipRangeDetailApi, getIpAccess, updateIpRangeAccess } from '/@/api/website/ipRange';

  import { CompositionTransfer } from '/@/components/Transfer';
  import { TreeItem } from '/@/components/Tree/index';
  import { getRepositoryTree, getCateByResIdApi } from '/@/api/data/repository';
  import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';

  export default defineComponent({
    name: 'GoodsDetail',
    components: {
      PageWrapper,
      CompositionTransfer,
      TreeSelect,
      ASelect: Select,
      ASelectOption: Select.Option,
      PlusOutlined,
      DeleteOutlined,
    },
    setup() {
      const route = useRoute();
      const go = useGo();

      const IpRangeId = ref<number>(Number(route.params?.id));
      const mode = ref<'period' | 'category'>('category');
      const selectedPeriod = ref<number[]>([]);
      const periodOptions = computed(() =>
        Array.from({ length: 10 }, (_, i) => ({
          label: `第${i + 1}期`,
          value: i + 1,
        })),
      );
      const currentKey = ref('rep');
      const { setTitle } = useTabs();
      interface IpRangeDetail {
        network: string;
      }
      const tableData = ref<IpRangeDetail>({ network: '' });
      const repData = ref<TreeItem[]>([]);
      const cateTreeData = ref<TreeItem[]>([]);
      const treeLoading = ref(false);
      const selectedValue = ref<number[]>([]);
      const disabled = ref<Boolean>(false);
      const rekey = ref(0);
      const transferRef = ref();
      const editKey = [] as string[];
      const timer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      // 组管理
      const groups = ref([
        {
          selectedValue: [],
          selectedPeriod: [],
        },
      ]);

      // 增加组
      function addGroup() {
        groups.value.push({
          selectedValue: [],
          selectedPeriod: [],
        });
      }

      // 移除组
      function removeGroup(index) {
        if (index > 0) {
          groups.value.splice(index, 1);
        }
      }
      async function fetchData() {
        try {
          repData.value = (await getRepositoryTree()) as unknown as TreeItem[];
          const res = await ipRangeDetailApi(IpRangeId.value);
          const datas = await getIpAccess(IpRangeId.value);
          selectedValue.value = datas.rep_ids;
          if (selectedValue.value.length <= 1) {
            cateTreeData.value = (await getCateByResIdApi(
              selectedValue.value[0],
            )) as unknown as TreeItem[];
            treeLoading.value = false;
            rekey.value += 1;
          }
          await timer(500);
          transferRef.value.leftCheckedKey = datas.cate_ids;
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
          groups.value[groupIndex].selectedValue = value;
        } catch (error) {
          console.log(error);
        }
      }

      async function submit() {
        if (mode.value === 'category') {
          await updateIpRangeAccess(
            IpRangeId.value,
            groups.value.flatMap((g) => g.selectedValue),
            transferRef.value.emitKeys,
            0,
          );
        } else if (mode.value === 'period' && selectedPeriod.value.length > 0) {
          await updateIpRangeAccess(
            IpRangeId.value,
            groups.value.flatMap((g) => g.selectedPeriod),
            [],
            '',
          );
        }
      }

      const getData = async () => {
        const res = await ipRangeDetailApi(IpRangeId.value);
        if (res) {
          tableData.value = res;
          setTitle('详情：ip-' + tableData.value.network);
        }
      };
      getData();

      // 页面左侧点击返回链接时的操作
      function goBack() {
        go('/website/goods');
      }

      return {
        mode,
        selectedPeriod,
        periodOptions,
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
        groups,
        addGroup,
        removeGroup,
      };
    },
  });
</script>

<style></style>
