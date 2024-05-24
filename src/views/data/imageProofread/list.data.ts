import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
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
export const detailColumns: BasicColumn[] = [
  {
    title: '文件路径',
    dataIndex: 'img_path',
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
