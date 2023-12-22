import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '用户名称',
    dataIndex: 'creator__name',
  },
  {
    title: '完成数量',
    dataIndex: 'count',
  },
  {
    title: '错误数量',
    dataIndex: 'err_nums',
  },
  {
    title: '错误占比',
    dataIndex: 'percent',

    // customRender: ({ text }) => {
    //   return h(Progress, { percent: Number(text) });
    // },

    customRender: ({ text }) => {
      if (text == undefined) {
        return '0%';
      }
      return text + '%';
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '用户名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'fieldTime',
    component: 'RangePicker',
    label: '时间字段',
    colProps: {
      span: 8,
    },
    componentProps: { showTime: true },
  },
  {
    field: 'type',
    label: '类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '图像录入', value: '0' },
        { label: '图像处理', value: '1' },
        { label: '校对', value: '2' },
      ],
    },
    colProps: { span: 8 },
  },
];
