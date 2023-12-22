import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '部门名称',
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
    label: '部门名称',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'name',
    label: '部门名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'parent',
    label: '上级部门',
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
  },
  {
    field: 'priority',
    label: '排序',
    component: 'InputNumber',
    required: true,
    defaultValue: 1,
  },
  {
    label: '备注',
    field: 'memo',
    component: 'InputTextArea',
  },
];
