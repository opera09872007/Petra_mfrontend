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
    dataIndex: 'status',
    customRender: ({ record }) => {
      const status = record.status;
      let color = 'green';
      let text = '按钮';
      switch (status) {
        case '0':
          color = '#13c2c2';
          text = '新建';
          break;
        case '1':
          color = '#1890ff';
          text = '校对中';
          break;
        case '2':
          color = '#13c2c2';
          text = '校对完成';
          break;
        case '3':
          color = '#F08080';
          text = '退回';
          break;
        case '4':
          color = '#FBAC5E';
          text = '修改完成';
          break;
        case '5':
          color = '#1890ff';
          text = '图像处理中';
          break;
        case '6':
          color = '#1890ff';
          text = '图像处理完成';
          break;
        case '8':
          color = '#13c2c2';
          text = '图像上传完成';
          break;
        case '9':
          color = '#1890ff';
          text = '上传校对中';
          break;
        case '10':
          color = '#13c2c2';
          text = '上传校对完成';
          break;
        default:
          color = '#faad14';
          text = '暂无';
          break;
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
      const status = record.work_flow_type;
      let color = 'green';
      let text = '按钮';
      switch (status) {
        case '0':
          color = '#13c2c2';
          text = '新建';
          break;
        case '1':
          color = '#1890ff';
          text = '校对中';
          break;
        case '2':
          color = '#13c2c2';
          text = '校对完成';
          break;
        case '3':
          color = '#F08080';
          text = '退回';
          break;
        case '4':
          color = '#FBAC5E';
          text = '修改完成';
          break;
        case '5':
          color = '#1890ff';
          text = '图像处理中';
          break;
        case '6':
          color = '#1890ff';
          text = '图像处理完成';
          break;
        case '8':
          color = '#13c2c2';
          text = '图像上传完成';
          break;
        case '9':
          color = '#1890ff';
          text = '上传校对中';
          break;
        case '10':
          color = '#13c2c2';
          text = '上传校对完成';
          break;
        default:
          color = '#faad14';
          text = '暂无';
          break;
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
