import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '创建者',
    dataIndex: 'creator_name',
    align: 'left',
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    align: 'left',
  },
  {
    title: '更新者',
    dataIndex: 'updater_name',
    align: 'left',
  },
  {
    title: '更新时间',
    dataIndex: 'update_time',
    align: 'left',
  },
  {
    title: '排序',
    dataIndex: 'priority',
    align: 'left',
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'content',
    label: '内容',
    colProps: { span: 24 },
    component: 'InputTextArea',
    dynamicDisabled: true,
    componentProps: {
      rows: 4,
    },
  },
  {
    field: 'creator_name',
    label: '提交的用户名称',
    component: 'Input',
    dynamicDisabled: true,
  },
];
