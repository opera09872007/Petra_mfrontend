import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '分类名称',
    dataIndex: 'name',
    align: 'left',
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
    title: '备注',
    dataIndex: 'memo',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '分类名称',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    ifShow: false,
  },
  {
    field: 'name',
    label: '分类名称',
    component: 'Input',
    required: true,
    dynamicDisabled: ({ values }) => {
      if (values.id) return true;
      else return false;
    },
  },
  {
    field: 'parent',
    label: '上级分类',
    component: 'TreeSelect',

    colProps: { span: 16 },
    componentProps: {
      fieldNames: {
        label: 'name',
        key: 'id',
        value: 'id',
      },
      getPopupContainer: () => document.body,
    },
    dynamicDisabled: ({ values }) => {
      if (values.id) return true;
      else return false;
    },
  },
  {
    field: 'priority',
    label: '排序',
    component: 'InputNumber',
    required: true,
    defaultValue: 1,
  },
  {
    field: 'is_active',
    label: '状态',
    component: 'RadioButtonGroup',
    defaultValue: '1',
    componentProps: {
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  },
  {
    label: '备注',
    field: 'memo',
    component: 'InputTextArea',
  },
];
