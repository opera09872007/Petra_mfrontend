import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: '任务名称',
    dataIndex: 'name',
  },
  {
    title: '所属资料库',
    dataIndex: 'rep_name',
  },
  {
    title: '名称',
    dataIndex: 'info_name',
  },
  {
    title: '当前处理人',
    dataIndex: 'now_handler_name',
  },
  {
    title: '状态',
    dataIndex: 'workflow_type_name',
    customRender: ({ record }) => {
      if (record.is_null) {
        return '';
      }
      let text = record.workflow_type_name;
      let color = '#13c2c2';
      if (text.includes('新建')) {
        color = '#13c2c2';
      } else if (text.includes('中')) {
        color = '#1890ff';
      } else if (text.includes('返回')) {
        color = '#F08080';
      } else if (text.includes('完成')) {
        color = '#1890ff';
      } else if (text.includes('删除')) {
        color = '#813772';
      } else {
        color = '#faad14';
        text = '暂无';
      }
      return h(Tag, { color: color }, () => text);
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '任务名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'now_handler_name',
    label: '当前处理人',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '新建', value: '0' },
        { label: '校对中', value: '1' },
        { label: '校对完成', value: '2' },
        { label: '校对错误', value: '3' },
        { label: '修改完成', value: '4' },
        { label: '图像处理中', value: '5' },
        { label: '图像处理完成', value: '6' },
      ],
    },
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'name',
    label: '任务名称',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    field: 'info_name',
    label: '名称',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    field: 'now_handler_name',
    label: '当前处理人',
    component: 'Input',
    dynamicDisabled: true,
  },
];

export const detailColumns: BasicColumn[] = [
  {
    title: '文件路径',
    dataIndex: 'img_path',
    width: '35%',
  },
  {
    title: '创建人',
    dataIndex: 'creator_name',
    width: '10%',
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    width: '10%',
  },
  {
    title: '更新人',
    dataIndex: 'updater_name',
    width: '10%',
  },
  {
    title: '更新时间',
    dataIndex: 'update_time',
    width: '10%',
  },
  {
    title: '状态',
    dataIndex: 'work_flow_type',
    width: '10%',
    customRender: ({ record }) => {
      if (record.is_null) {
        return '';
      }
      let text = record.workflow_type_name;
      let color = '#13c2c2';
      if (text.includes('新建')) {
        color = '#13c2c2';
      } else if (text.includes('中')) {
        color = '#1890ff';
      } else if (text.includes('返回')) {
        color = '#F08080';
      } else if (text.includes('完成')) {
        color = '#1890ff';
      } else if (text.includes('删除')) {
        color = '#813772';
      } else {
        color = '#faad14';
        text = '暂无';
      }
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '排序',
    dataIndex: 'priority',
    width: 120,
  },
];
