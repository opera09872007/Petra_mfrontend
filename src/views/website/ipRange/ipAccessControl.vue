<template>
  <PageWrapper
    dense
    contentFullHeight
    fixedHeight
    contentClass="flex"
    :title="`IP-` + tableData.network + `的访问控制`"
    @back="goBack"
  >
    <div class="flex flex-col w-full" style="overflow-y: auto">
      <!-- 操作模式选择和增加组按钮 -->
      <div class="flex items-center space-x-2 mb-4">
        <a-select
          v-model:value="mode"
          style="width: 200px"
          placeholder="请选择操作模式"
          @change="handleModeChange"
        >
          <a-select-option value="period">根据期数</a-select-option>
          <a-select-option value="category">根据分类</a-select-option>
        </a-select>
        <a-button type="primary" @click="addGroup">
          <PlusOutlined />
          增加组
        </a-button>
      </div>

      <!-- 组容器 -->
      <div class="flex flex-wrap gap-4">
        <!-- 使用v-for循环渲染当前模式的组 -->
        <div
          v-for="(group, index) in currentGroups"
          :key="index"
          class="border rounded-md p-4 mb-4"
          :class="mode === 'category' ? 'w-full' : 'w-96'"
        >
          <div class="mb-3 flex justify-between items-center">
            <span class="font-medium text-lg">组 {{ index + 1 }}</span>
            <a-button v-if="index > 0" type="text" danger @click="removeGroup(index)">
              <DeleteOutlined />
            </a-button>
          </div>

          <div class="space-y-4">
            <!-- 开始时间和结束时间 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="mb-2 font-medium">开始时间</div>
                <a-date-picker
                  v-model:value="group.startTime"
                  style="width: 100%"
                  :show-time="{ format: 'HH:mm' }"
                  format="YYYY-MM-DD HH:mm"
                  placeholder="选择开始时间"
                />
              </div>
              <div>
                <div class="mb-2 font-medium">结束时间</div>
                <a-date-picker
                  v-model:value="group.endTime"
                  style="width: 100%"
                  :show-time="{ format: 'HH:mm' }"
                  format="YYYY-MM-DD HH:mm"
                  placeholder="选择结束时间"
                />
              </div>
            </div>
            <!-- 资源库选择 -->
            <div>
              <div class="mb-2 font-medium">资源库选择</div>
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
              />
            </div>

            <!-- period模式下的期数选择 -->
            <div v-if="mode === 'period'">
              <div class="mb-2 font-medium">期数选择</div>
              <a-select
                v-model:value="group.selectedPeriod"
                style="width: 100%"
                placeholder="请选择期数"
                :options="periodOptions"
                mode="multiple"
              />
            </div>

            <!-- category模式下的分类选择 -->
            <div v-if="mode === 'category'" class="mt-4">
              <div class="mb-2 font-medium">分类选择</div>
              <CompositionTransfer
                :ref="
                  (el) => {
                    if (el) groupTransfers[index] = el;
                  }
                "
                :tree-data="group.cateTreeData || []"
                :edit-key="group.editCateIds"
                :disabled="group.disabled"
                :key="`transfer-${index}-${group.rekey}`"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="mt-4">
        <a-button type="primary" style="width: 300px; max-width: 300px" @click="submit">
          提交
        </a-button>
      </div>
    </div>
  </PageWrapper>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, reactive, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { useGo } from '/@/hooks/web/usePage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { TreeSelect, Select, DatePicker } from 'ant-design-vue';
  import { ipRangeDetailApi, getIpAccess, updateIpRangeAccess } from '/@/api/website/ipRange';

  import { CompositionTransfer } from '/@/components/Transfer';
  import { TreeItem } from '/@/components/Tree/index';
  import { getRepositoryTree, getCateByResIdApi } from '/@/api/data/repository';
  import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';
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
      ADatePicker: DatePicker,
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
      const treeLoading = ref(false);
      const selectedValue = ref<number[]>([]);
      const editKey = [] as string[];
      const timer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      // 为不同模式维护独立的组数组
      const categoryGroups = ref([
        {
          selectedValue: null,
          selectedPeriod: [],
          cateTreeData: [],
          disabled: false,
          rekey: 0,
          startTime: null,
          endTime: null,
          editCateIds: [],
        },
      ]);

      const periodGroups = ref([
        {
          selectedValue: null,
          selectedPeriod: [],
          cateTreeData: [],
          disabled: false,
          rekey: 0,
          startTime: null,
          endTime: null,
        },
      ]);

      // 计算当前应该显示的组
      const currentGroups = computed(() => {
        return mode.value === 'category' ? categoryGroups.value : periodGroups.value;
      });

      // 引用每个模式的组件引用
      const categoryTransfers = reactive({});
      const periodTransfers = reactive({});

      // 计算当前应该使用的组件引用
      const groupTransfers = computed(() => {
        return mode.value === 'category' ? categoryTransfers : periodTransfers;
      });

      // 模式切换处理函数
      function handleModeChange(newMode) {
        console.log(`模式切换为: ${newMode}`);
      }

      // 增加组 - 根据当前模式添加到对应数组
      function addGroup() {
        const newCategoryGroups = {
          selectedValue: null,
          selectedPeriod: [],
          cateTreeData: [],
          disabled: false,
          rekey: 0,
          startTime: null,
          endTime: null,
          editCateIds: [],
        };

        const newPeriodGroups = {
          selectedValue: null,
          selectedPeriod: [],
          cateTreeData: [],
          disabled: false,
          rekey: 0,
          startTime: null,
          endTime: null,
        };

        if (mode.value === 'category') {
          categoryGroups.value.push(newCategoryGroups);
        } else {
          periodGroups.value.push(newPeriodGroups);
        }
      }

      // 移除组 - 从当前模式的数组中移除
      function removeGroup(index) {
        if (index > 0) {
          if (mode.value === 'category') {
            categoryGroups.value.splice(index, 1);
            delete categoryTransfers[index];
          } else {
            periodGroups.value.splice(index, 1);
            delete periodTransfers[index];
          }
        }
      }

      async function fetchData() {
        try {
          // 获取资源库树
          repData.value = (await getRepositoryTree()) as unknown as TreeItem[];
          // 获取IP范围详情
          const res = await ipRangeDetailApi(IpRangeId.value);
          tableData.value = res;
          setTitle('详情：ip-' + tableData.value.network);

          // 获取IP访问控制数据
          const accessData = await getIpAccess(IpRangeId.value);
          console.log('获取到的访问控制数据:', accessData);

          // 如果有数据并且是数组
          if (Array.isArray(accessData) && accessData.length > 0) {
            // 清空现有组
            categoryGroups.value = [];
            periodGroups.value = [];

            // 临时存储不同类型的数据
            const cateItems = [];
            const phaseItems = [];

            // 对数据进行分类
            accessData.forEach((item) => {
              if (item.group_type === 'cate') {
                cateItems.push(item);
              } else if (item.group_type === 'phase') {
                phaseItems.push(item);
              }
            });

            // 处理分类模式的数据
            for (let i = 0; i < cateItems.length; i++) {
              const item = cateItems[i];
              const startTime = item.start_time ? dayjs(item.start_time) : null;
              const endTime = item.end_time ? dayjs(item.end_time) : null;

              const newGroup = {
                selectedValue: item.rep_id,
                selectedPeriod: [],
                cateTreeData: [],
                disabled: false,
                rekey: 0,
                startTime: startTime,
                endTime: endTime,
                editCateIds: item.cate_ids || [],
              };

              categoryGroups.value.push(newGroup);

              if (item.cate_ids && item.cate_ids.length > 0) {
                newGroup.cateTreeData = (await getCateByResIdApi(
                  item.rep_id,
                )) as unknown as TreeItem[];
                newGroup.rekey += 1;

                await timer(300);

                setTimeout(() => {
                  if (categoryTransfers[i]) {
                    categoryTransfers[i].leftCheckedKey = item.cate_ids;
                  }
                }, 500);
                currentGroups.value.forEach((group, index) => {
                  if (group.cateTreeData && group.cateTreeData.length > 0) {
                    // 通过rekey的变化强制重新渲染组件
                    group.rekey += 1;

                    // 延迟一下，确保DOM已更新
                    setTimeout(() => {
                      if (groupTransfers.value[index]) {
                        // 确保拿到最新的引用
                        const transfer = groupTransfers.value[index];
                        // 重新应用编辑状态
                        if (transfer && group.editCateIds && group.editCateIds.length > 0) {
                          transfer.leftCheckedKey = [...group.editCateIds];
                        }
                      }
                    }, 500);
                  }
                });
              }
            }

            // 处理期数模式的数据
            for (let i = 0; i < phaseItems.length; i++) {
              const item = phaseItems[i];
              const startTime = item.start_time ? dayjs(item.start_time) : null;
              const endTime = item.end_time ? dayjs(item.end_time) : null;

              periodGroups.value.push({
                selectedValue: item.rep_id,
                selectedPeriod: item.phase_nums || [],
                cateTreeData: [],
                disabled: false,
                rekey: 0,
                startTime: startTime,
                endTime: endTime,
              });
            }

            // 设置默认模式 - 根据哪种类型的数据更多来决定
            if (phaseItems.length > cateItems.length) {
              mode.value = 'period';
            } else {
              mode.value = 'category';
            }

            // 如果任一模式没有组，添加默认组
            if (categoryGroups.value.length === 0) {
              categoryGroups.value.push({
                selectedValue: null,
                selectedPeriod: [],
                cateTreeData: [],
                disabled: false,
                rekey: 0,
                startTime: null,
                endTime: null,
                editCateIds: [],
              });
            }

            if (periodGroups.value.length === 0) {
              periodGroups.value.push({
                selectedValue: null,
                selectedPeriod: [],
                cateTreeData: [],
                disabled: false,
                rekey: 0,
                startTime: null,
                endTime: null,
              });
            }
          } else {
            // 如果没有数据，为两种模式各创建一个默认组
            categoryGroups.value = [
              {
                selectedValue: null,
                selectedPeriod: [],
                cateTreeData: [],
                disabled: false,
                rekey: 0,
                startTime: null,
                endTime: null,
                editCateIds: [],
              },
            ];

            periodGroups.value = [
              {
                selectedValue: null,
                selectedPeriod: [],
                cateTreeData: [],
                disabled: false,
                rekey: 0,
                startTime: null,
                endTime: null,
              },
            ];
          }
        } catch (error) {
          console.log('获取数据出错:', error);
          message.error('获取数据出错: ' + (error.message || '未知错误'));
        }
      }
      onMounted(() => {
        fetchData();
      });

      // 修改 treeDataChange 函数，使用当前模式的组
      async function treeDataChange(value, groupIndex) {
        try {
          const group = currentGroups.value[groupIndex];
          // 如果选择的资源库ID没变，就不重新加载数据
          if (group.selectedValue === value) {
            return;
          }

          group.selectedValue = value;

          if (mode.value === 'category') {
            group.disabled = true;
            treeLoading.value = true;
            // 清空现有数据，避免展示旧数据
            group.cateTreeData = [];
            group.editCateIds = [];

            group.cateTreeData = (await getCateByResIdApi(value)) as unknown as TreeItem[];
            treeLoading.value = false;
            group.disabled = false;
            group.rekey += 1;
          }
        } catch (error) {
          console.log(error);
          // 添加错误处理 - 确保出错时也重置禁用状态
          if (mode.value === 'category' && groupIndex < currentGroups.value.length) {
            currentGroups.value[groupIndex].disabled = false;
          }
        }
      }

      // 修改 submit 函数，使用当前模式的组
      async function submit() {
        try {
          const groupsData = [];
          let isValid = true;
          let errorMessage = '';

          // 使用当前模式的组进行验证和数据整理
          currentGroups.value.forEach((group, index) => {
            // 检查资源库选择
            if (!group.selectedValue) {
              isValid = false;
              errorMessage = `组 ${index + 1} 的资源库选择不能为空`;
              return;
            }

            // 检查时间范围
            if (!group.startTime) {
              isValid = false;
              errorMessage = `组 ${index + 1} 的开始时间不能为空`;
              return;
            }

            if (!group.endTime) {
              isValid = false;
              errorMessage = `组 ${index + 1} 的结束时间不能为空`;
              return;
            }

            // 检查模式相关字段
            if (mode.value === 'category') {
              const cateIds = groupTransfers.value[index]
                ? groupTransfers.value[index].emitKeys
                : [];
              if (!cateIds || cateIds.length === 0) {
                isValid = false;
                errorMessage = `组 ${index + 1} 的分类选择不能为空`;
                return;
              }
            } else if (mode.value === 'period') {
              if (!group.selectedPeriod || group.selectedPeriod.length === 0) {
                isValid = false;
                errorMessage = `组 ${index + 1} 的期数选择不能为空`;
                return;
              }
            }

            // 获取当前组的时间信息
            const timeRange = {
              start: group.startTime.format('YYYY-MM-DD HH:mm:ss'),
              end: group.endTime.format('YYYY-MM-DD HH:mm:ss'),
            };

            // 创建当前组的数据对象
            const groupData = {
              timeRange,
              repIds: group.selectedValue,
              group_type: mode.value === 'category' ? 'cate' : 'phase', // 添加group_type字段
            };

            // 根据不同模式添加特定数据
            if (mode.value === 'category') {
              // 使用组件的emitKeys作为分类ID
              const transfer = categoryTransfers[index];
              groupData.cateIds = transfer ? transfer.emitKeys : [];

              // 同时更新组的editCateIds，以便下次渲染
              if (transfer) {
                group.editCateIds = transfer.emitKeys;
              }
            } else if (mode.value === 'period') {
              // 添加当前组的期数ID
              groupData.periodIds = group.selectedPeriod || [];
            }

            // 将当前组数据添加到分组数据数组
            groupsData.push(groupData);
          });

          // 如果验证失败，显示错误消息并终止提交
          if (!isValid) {
            // 使用ant-design-vue的消息组件显示错误
            message.error(errorMessage);
            return;
          }

          // 一次性提交所有组的数据
          await updateIpRangeAccess({
            IpRangeId: IpRangeId.value,
            mode: mode.value,
            groups: groupsData,
          });

          // 提交成功后显示成功消息
          message.success('所有分组数据提交成功');
        } catch (error) {
          console.error('提交失败', error);
          message.error('提交失败: ' + (error.message || '未知错误'));
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
        selectedValue,
        treeDataChange,
        editKey,
        submit,
        currentGroups, // 返回计算属性而不是原始数组
        addGroup,
        removeGroup,
        groupTransfers,
        handleModeChange,
      };
    },
  });
</script>

<style>
  .ant-transfer-list {
    min-height: 300px;
  }
</style>
