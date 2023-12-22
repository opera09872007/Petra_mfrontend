import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag, Tooltip } from 'ant-design-vue';
import { Tinymce } from '/@/components/Tinymce/index';

export const columns: BasicColumn[] = [
  {
    title: '名称',
    dataIndex: 'info_name',
  },
  {
    title: '创建人',
    dataIndex: 'publisher_name',
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
  },
  {
    title: '排序',
    dataIndex: 'priority',
  },
  {
    title: '任务类型',
    dataIndex: 'type',
    customRender: ({ record }) => {
      const status = record.type;
      let color = 'green';
      let text = '按钮';
      const title = '';
      switch (status) {
        case '0':
          color = '#1890ff';
          text = '普通任务';
          break;
        case '1':
          color = '#1890ff';
          text = '校对任务';
          break;
        case '2':
          color = '#13c2c2';
          text = '图像处理任务';
          break;
        case '3':
          color = '#1890ff';
          text = '图像上传校对任务';
          break;
        default:
          color = '#faad14';
          text = '暂无';
          break;
      }
      // return h(Tag, { color: color }, () => text);
      return h(
        Tooltip,
        { color: color, title: title },
        { default: () => h(Tag, { color: color }, { default: () => text }) },
      );
    },
  },
];
export const detailColumns: BasicColumn[] = [
  {
    title: '文件路径',
    dataIndex: 'img_path',
  },
  {
    title: '状态',
    dataIndex: 'work_flow_type',
    customRender: ({ record }) => {
      const status = record.work_flow_type;
      let color = 'green';
      let text = '按钮';
      const title = '';
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
      // return h(Tag, { color: color }, () => text);
      return h(
        Tooltip,
        { color: color, title: title },
        { default: () => h(Tag, { color: color }, { default: () => text }) },
      );
    },
  },
];
// const isNull = (type: string) => {
//   if (type == '' || type == undefined) {
//     return false;
//   } else {
//     return true;
//   }
// };
export const detailFormSchema: FormSchema[] = [
  {
    field: 'img_path',
    component: 'Input',
    label: '名称',
    colProps: { span: 24 },
    componentProps: { disabled: true },
  },
  {
    field: 'id',
    component: 'Input',
    label: 'detail_id',
    show: false,
  },
  {
    field: 'info',
    component: 'Input',
    label: 'info_id',
    show: false,
  },
  {
    label: '备注',
    field: 'memo',
    component: 'InputTextArea',
    colProps: { span: 24 },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'info_name',
    label: '名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'creator',
    label: '创建人',
    component: 'Input',
    colProps: { span: 8 },
  },
];
export const InfoFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'categories',
    label: '所属分类',
    component: 'TreeSelect',
    colProps: {
      span: 16,
    },
    componentProps: {
      multiple: true,
      labelInValue: true,
      treeDefaultExpandAll: true,
      fieldNames: {
        label: 'name',
        key: 'id',
        value: 'id',
      },
      getPopupContainer: () => document.body,
    },
    required: true,
  },
  {
    field: 'num',
    label: '总数量',
    component: 'InputNumber',
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
    field: 'content',
    component: 'Input',
    label: '内容',
    defaultValue: '',
    colProps: { span: 24 },
    render: ({ model, field }) => {
      return h(Tinymce, {
        value: model[field],
        showImageUpload: false,
        toolbar: toolbar,
        plugins: plugins,
        onChange: (value: string) => {
          model[field] = value;
        },
      });
    },
  },
];
