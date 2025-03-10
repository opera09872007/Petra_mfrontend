<template>
  <div class="vben-basic-table vben-basic-table-form-container">
    <BasicTable
      @register="registerTable"
      @fetch-success="onFetchSuccess"
      :searchInfo="searchInfo"
      :current="current"
      :pagination="{
        current: current,
      }"
      @change="handleTableChange"
    >
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 新增商品 </a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: 'clarity:info-standard-line',
              tooltip: '查看商品详细',
              onClick: handleView.bind(null, record),
            },
            {
              icon: 'clarity:note-edit-line',
              tooltip: '编辑商品',
              onClick: handleEdit.bind(null, record),
            },

            {
              icon: 'ant-design:delete-outlined',
              color: 'error',
              tooltip: '删除商品',
              popConfirm: {
                title: '是否确认删除',
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <GoodsModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, nextTick, ref, reactive } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getgoodsList, goodsDeleteApi } from '/@/api/website/goods';

  import { useModal } from '/@/components/Modal';
  import GoodsModal from './GoodsModal.vue';

  import { columns } from './goods.data';
  import { useGo } from '/@/hooks/web/usePage';

  export default defineComponent({
    name: 'ResourceManagement',
    components: { BasicTable, GoodsModal, TableAction },
    setup() {
      const go = useGo();
      const current = ref(1);
      const searchInfo = reactive<Recordable>({});
      const [registerModal, { openModal }] = useModal();
      const [registerTable, { reload, expandAll, collapseAll }] = useTable({
        title: '商品列表',
        api: getgoodsList,
        columns,
        formConfig: {
          labelWidth: 120,
        },
        striped: false,
        useSearchForm: false,
        showTableSetting: true,
        bordered: true,
        showIndexColumn: false,
        canResize: false,
        actionColumn: {
          width: 120,
          title: '操作',
          dataIndex: 'action',
          slots: { customRender: 'action' },
        },
      });

      function handleCreate() {
        openModal(true, {
          isUpdate: false,
          currentId: '',
        });
      }

      function handleEdit(record: Recordable) {
        openModal(true, {
          record,
          isUpdate: true,
          currentId: record.id,
        });
      }

      async function handleDelete(record: Recordable) {
        try {
          await goodsDeleteApi(record.id);
        } catch (error) {
          console.log(error);
        }
        reload();
      }

      function handleSuccess() {
        reload();
      }
      function onFetchSuccess() {
        nextTick(expandAll);
      }
      function handleTableChange(pagination) {
        current.value = pagination.current;
      }
      function handleView(record: Recordable) {
        go('/website/goods_detail/' + record.id);
      }
      return {
        registerTable,
        registerModal,
        handleCreate,
        handleEdit,
        handleDelete,
        handleSuccess,
        onFetchSuccess,
        collapseAll,
        expandAll,
        searchInfo,
        current,
        handleTableChange,
        handleView,
      };
    },
  });
</script>
