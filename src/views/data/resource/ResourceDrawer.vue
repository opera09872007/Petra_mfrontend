<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="编辑任务流程"
    width="500px"
  >
    <BasicTable @register="registerTable" @edit-change="onEditChange">
      <template #action="{ record, column }">
        <TableAction :actions="createActions(record, column)" />
      </template>
      <template #toolbar>
        <a-button type="primary" @click="handleCreate">新增任务流程</a-button>
      </template>
    </BasicTable>
  </BasicDrawer>

  <TaskModal @register="registerModal" @success="handleSuccess" />
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { taskcolumns } from './resource.data';
  import { BasicTable, useTable, TableAction, EditRecordRow } from '/@/components/Table';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getTaskTypeList, TaskTypeEditApi, TaskTypeDeleteApi } from '/@/api/data/workTaskType';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import TaskModal from './TaskModal.vue';
  export default defineComponent({
    name: 'ResourceDrawer',
    components: { BasicDrawer, BasicTable, TableAction, TaskModal },
    emits: ['success', 'register'],
    setup(_, {}) {
      const taskData = ref<Recordable[]>([]);
      const { createMessage: msg } = useMessage();
      var currentId = ref(-1);
      const [registerModal, { openModal }] = useModal();
      const currentEditKeyRef = ref('');
      const [registerTable, {}] = useTable({
        title: '说明',
        titleHelpMessage: ['通过修改排序可以控制该库的任务顺序'],
        dataSource: taskData,
        columns: taskcolumns,
        showIndexColumn: false,
        showTableSetting: false,
        isTreeTable: false,
        pagination: false,
        actionColumn: {
          width: 50,
          title: '操作',
          dataIndex: 'action',
          slots: { customRender: 'action' },
        },
      });
      function handleEdit(record: EditRecordRow) {
        currentEditKeyRef.value = record.key;
        record.onEdit?.(true);
      }
      async function handleDelete(record: EditRecordRow) {
        console.log(record);
        try {
          await TaskTypeDeleteApi(record.id);
          handleSuccess();
        } catch (error) {
          msg.error({ content: '保存失败', key: 'saving' });
        }
        currentEditKeyRef.value = '';
        record.onEdit?.(false, false);
      }
      function handleCancel(record: EditRecordRow) {
        currentEditKeyRef.value = '';
        record.onEdit?.(false, false);
      }

      async function handleSave(record: EditRecordRow) {
        // 校验
        msg.loading({ content: '正在保存...', duration: 0, key: 'saving' });
        const valid = await record.onValid?.();
        if (valid) {
          try {
            await TaskTypeEditApi(record.id, record.editValueRefs);
            const pass = await record.onEdit?.(false, true);
            if (pass) {
              currentEditKeyRef.value = '';
            }
            msg.success({ content: '数据已保存', key: 'saving' });
            handleSuccess();
          } catch (error) {
            msg.error({ content: '保存失败', key: 'saving' });
          }
        } else {
          msg.error({ content: '请填写正确的数据', key: 'saving' });
        }
      }

      function createActions(record: EditRecordRow): ActionItem[] {
        if (!record.editable) {
          return [
            {
              label: '编辑',
              disabled: currentEditKeyRef.value ? currentEditKeyRef.value !== record.key : false,
              onClick: handleEdit.bind(null, record),
            },
            {
              label: '删除',
              popConfirm: {
                title: '是否删除',
                confirm: handleDelete.bind(null, record),
              },
            },
          ];
        }
        return [
          {
            label: '保存',
            onClick: handleSave.bind(null, record),
          },
          {
            label: '取消',
            popConfirm: {
              title: '是否取消编辑',
              confirm: handleCancel.bind(null, record),
            },
          },
        ];
      }

      function onEditChange({ column, value, record }) {
        // 本例
        if (column.dataIndex === 'id') {
          record.editValueRefs.name4.value = `${value}`;
        }
        console.log(column, value, record);
      }

      function handleCreate() {
        openModal(true, {
          currentId: currentId,
        });
      }
      async function handleSuccess() {
        try {
          taskData.value = await getTaskTypeList(unref(currentId));
        } catch (error) {
          closeDrawer();
        }
      }

      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        try {
          currentId = data.currentId;
          setDrawerProps({ confirmLoading: false, showOkBtn: false, showCancelBtn: false });
          console.log(data.currentId);

          handleSuccess();
        } catch (error) {
          closeDrawer();
        }
      });

      return {
        registerDrawer,
        registerTable,
        handleEdit,
        handleDelete,
        handleCreate,
        handleSuccess,
        registerModal,
        createActions,
        onEditChange,
        taskData,
      };
    },
  });
</script>
