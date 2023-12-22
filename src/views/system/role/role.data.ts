import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Switch } from 'ant-design-vue';
import { setRoleStatus } from '/@/api/system/role';
import { useMessage } from '/@/hooks/web/useMessage';

export const columns: BasicColumn[] = [
  {
    title: '角色名称',
    dataIndex: 'name',
  },
  {
    title: '排序',
    dataIndex: 'priority',
    width: 50,
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
  },
  {
    title: '状态',
    dataIndex: 'is_active',
    width: 120,
    customRender: ({ record }) => {
      if (!Reflect.has(record, 'pendingStatus')) {
        record.pendingStatus = false;
      }
      return h(Switch, {
        checked: record.is_active === true,
        checkedChildren: '已启用',
        unCheckedChildren: '已禁用',
        loading: record.pendingStatus,
        onChange(checked: boolean) {
          record.pendingStatus = true;
          const newStatus = checked ? true : false;
          const { createMessage } = useMessage();
          setRoleStatus(record.id, newStatus)
            .then(() => {
              record.is_active = newStatus;
              createMessage.success(`已成功修改角色状态`);
            })
            .catch(() => {
              createMessage.error('修改角色状态失败');
            })
            .finally(() => {
              record.pendingStatus = false;
            });
        },
      });
    },
  },
  {
    title: '备注',
    dataIndex: 'memo',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '角色名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'is_active',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: '1' },
        { label: '停用', value: '0' },
      ],
    },
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'name',
    label: '角色名称',
    required: true,
    component: 'Input',
  },
  {
    field: 'is_actives',
    label: '状态',
    component: 'RadioButtonGroup',
    defaultValue: '1',
    componentProps: {
      options: [
        { label: '启用', value: '1' },
        { label: '停用', value: '0' },
      ],
    },
  },
  {
    label: '排序',
    field: 'priority',
    component: 'InputNumber',
    defaultValue: 1,
    colProps: {
      span: 16,
    },
  },
  {
    label: '备注',
    field: 'memo',
    component: 'InputTextArea',
    colProps: {
      span: 16,
    },
  },
  {
    label: '',
    field: 'menus',
    slot: 'menu',
    component: 'Input',
    colProps: {
      span: 24,
    },
  },
  {
    label: '',
    field: 'permissions',
    slot: 'permission',
    component: 'Input',
    colProps: {
      span: 24,
    },
  },
];
