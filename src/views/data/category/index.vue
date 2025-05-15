<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <ResTree class="w-1/4 xl:w-1/5" @select="handleSelect" />
    <div
      class="vben-basic-table vben-basic-table-form-container w-3/4 xl:w-4/5"
      style="overflow: auto"
    >
      <VxeGrid ref="gridRef" v-bind="gridOptions">
        <template #buttons>
          <span style="font-size: 16px; font-weight: 500">新增分类</span>
        </template>
        <template #tools>
          <a-space>
            <a-button type="primary" @click="handleCreate">新增分类</a-button>
            <a-button type="primary" @click="expandAll">展开全部</a-button>
            <a-button type="primary" @click="collapseAll">折叠全部</a-button>
          </a-space>
        </template>
        <template #operate="{ row }">
          <a-space>
            <a-button type="link" class="p-0 m-0" @click="handleEdit(row)">
              <icon icon="clarity:note-edit-line" />
            </a-button>
            <Popconfirm title="是否确认删除" @confirm="handleDelete(row)">
              <a-button type="link" class="p-0 m-0 ml-2" danger>
                <icon icon="ant-design:delete-outlined" />
              </a-button>
            </Popconfirm>
          </a-space>
        </template>
      </VxeGrid>
    </div>
    <CategoryModal @register="registerModal" @success="handleSuccess" />
  </PageWrapper>
</template>
<script lang="ts">
  import 'vxe-table/lib/style.css';
  import { defineComponent, reactive, ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
  import { getCateList } from '/@/api/data/category';
  import { useModal } from '/@/components/Modal';
  import CategoryModal from './CategoryModal.vue';
  import { CateDeleteApi } from '/@/api/data/category';
  import { PageWrapper } from '/@/components/Page';
  import { useGo } from '/@/hooks/web/usePage';
  import { Icon } from '/@/components/Icon';
  import ResTree from './ResTree.vue';
  import { VxeGrid } from 'vxe-table';
  import { VxeUI, VxeLoading } from 'vxe-pc-ui';
  import type { VxeGridInstance, VxeGridProps } from 'vxe-table';
  import { Space, Button, Popconfirm } from 'ant-design-vue';

  VxeUI.component(VxeLoading);
  export default defineComponent({
    name: 'CategoryManagement',
    components: {
      PageWrapper,
      CategoryModal,
      ResTree,
      VxeGrid,
      ASpace: Space,
      AButton: Button,
      Icon,
      Popconfirm,
    },
    setup() {
      const go = useGo();
      const searchInfo = reactive<Recordable>({});
      const [registerModal, { openModal }] = useModal();
      const gridRef = ref<VxeGridInstance>();

      function reload() {
        loadData();
      }

      function expandAll() {
        nextTick(() => {
          gridRef.value?.setAllTreeExpand(true);
        });
      }

      function collapseAll() {
        nextTick(() => {
          gridRef.value?.setAllTreeExpand(false);
        });
      }

      function handleCreate() {
        openModal(true, {
          repId: searchInfo.repId,
          isUpdate: false,
          currentId: '',
        });
      }

      function handleEdit(record: Recordable) {
        openModal(true, {
          record,
          repId: searchInfo.repId,
          isUpdate: true,
          currentId: record.id,
        });
      }

      async function handleDelete(record: Recordable) {
        try {
          await CateDeleteApi(record.id);
        } catch (error) {
          console.log(error);
        }
        reload();
      }

      function handleSuccess() {
        reload();
      }
      function handleSelect(repId = '') {
        searchInfo.repId = repId;
        reload();
      }
      function handleView(record: Recordable) {
        go('/system/account_detail/' + record.id);
      }

      interface CategoryItem {
        id: string | number;
        name: string;
        priority: number;
        create_time: string;
        memo?: string;
        children?: CategoryItem[];
      }

      const tableData = ref<CategoryItem[]>([]);
      const loading = ref(false);
      const tableHeight = ref(900); // 默认高度

      async function loadData() {
        loading.value = true;
        try {
          const result = await getCateList({ repId: searchInfo.repId });
          if (result) {
            tableData.value = result;
          }
        } catch (error) {
          console.error(error);
        } finally {
          loading.value = false;
        }
      }
      // 计算表格高度的函数
      function calcTableHeight() {
        nextTick(() => {
          tableHeight.value = window.innerHeight - 80;
        });
      }

      const gridOptions = computed<VxeGridProps>(() => ({
        border: false,
        stripe: true,
        height: tableHeight.value,
        loading: loading.value,
        data: tableData.value,
        columns: [
          { field: 'id', title: 'id', align: 'left', width: 280 },
          { field: 'name', title: '分类名称', align: 'left', width: 280, treeNode: true },
          { field: 'priority', title: '排序', align: 'left', width: 80 },
          { field: 'create_time', title: '创建时间', align: 'left', width: 180 },
          { field: 'memo', title: '备注', align: 'left', width: 120 },
          {
            title: '操作',
            width: 120,
            align: 'left',
            slots: {
              default: 'operate',
            },
          },
        ],
        toolbarConfig: {
          slots: {
            tools: 'tools',
            buttons: 'buttons',
          },
        },
        rowConfig: { isHover: true },
        treeConfig: { parentField: 'parent', rowField: 'id', transform: true },
        scrollX: { gt: 60, enabled: true },
        scrollY: { gt: 60, enabled: true },
      }));

      // 初始加载数据
      onMounted(() => {
        calcTableHeight();
        window.addEventListener('resize', calcTableHeight);
      });
      // 组件卸载时移除事件监听
      onUnmounted(() => {
        window.removeEventListener('resize', calcTableHeight);
      });
      return {
        registerModal,
        handleCreate,
        handleEdit,
        handleDelete,
        handleSuccess,
        handleSelect,
        searchInfo,
        collapseAll,
        expandAll,
        handleView,
        gridOptions,
        loading,
        tableData,
        gridRef,
        tableHeight,
      };
    },
  });
</script>
<style scoped>
  .vben-basic-table-form-container {
    padding: 16px !important;
  }
</style>
