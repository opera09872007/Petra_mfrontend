import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag, Tooltip } from 'ant-design-vue';
import { Tinymce } from '/@/components/Tinymce/index';

const validatorCategories = async (rule, value) => {
  if (!value) return;
  if (value.length > 1) {
    return Promise.reject('分类数量不能大于1个!');
  } else {
    return Promise.resolve();
  }
};
export const columns: BasicColumn[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 222,
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 120,
  },
  {
    title: '分类',
    dataIndex: 'categories',
    width: 120,
    customRender: ({ record }) => {
      let names = '';
      let num = 1;
      const len = record.categories.length;

      for (const cate of record.categories) {
        names += cate.name;
        if (num < len) {
          names += '，';
        }
        num++;
      }
      return names;
    },
  },
  {
    title: '总数量',
    dataIndex: 'num',
    width: 120,
  },
  {
    title: '当前数量',
    dataIndex: 'now_num',
    width: 120,
  },
  {
    title: '完成数量',
    dataIndex: 'finish_num',
    width: 120,
  },
  {
    title: '校对轮次',
    dataIndex: 'proofread_num',
    width: 120,
    customRender: ({ record }) => {
      if (record.is_null) {
        return '';
      }
      const status = record.proofread_num;
      let color = 'green';
      let text = '按钮';
      switch (status) {
        case '-1':
          color = '#13c2c2';
          text = '图像上传校对';
          break;
        case '0':
          color = '#1890ff';
          text = '一校';
          break;
        case '1':
          color = '#1890ff';
          text = '二校';
          break;
        case '2':
          color = '#1890ff';
          text = '最终校对';
          break;
        case '3':
          color = '#13c2c2';
          text = '最终校对完成';
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
    title: '状态',
    dataIndex: 'work_flow_type',
    width: 120,
    customRender: ({ record }) => {
      if (record.is_null) {
        return '';
      }
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
    title: '当前处理人',
    dataIndex: 'handler_name',
    width: 120,
  },
  {
    title: '创建人',
    dataIndex: 'creator_name',
    width: 200,
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    width: 120,
  },
  {
    title: '更新人',
    dataIndex: 'updater_name',
    width: 200,
  },
  {
    title: '更新时间',
    dataIndex: 'update_time',
    width: 120,
  },
  {
    title: '排序',
    dataIndex: 'priority',
    width: 120,
  },
];
export const detailColumns: BasicColumn[] = [
  {
    title: '文件路径',
    dataIndex: 'img_path',
    width: 120,
  },
  {
    title: '创建人',
    dataIndex: 'creator_name',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    width: 120,
  },
  {
    title: '更新人',
    dataIndex: 'updater_name',
    width: 120,
  },
  {
    title: '更新时间',
    dataIndex: 'update_time',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'node_error_memo',
    width: 120,
    customRender: ({ record }) => {
      let color = '';
      let text = '';
      let title = '';
      if (record.node_error_memo) {
        color = '#F08080';
        text = '退回';
        title = record.node_error_memo;
      }
      return h(
        Tooltip,
        { color: color, title: title },
        { default: () => h(Tag, { color: color }, { default: () => text }) },
      );
    },
  },
];
const isNull = (type: string) => {
  if (type == '' || type == undefined) {
    return false;
  } else {
    return true;
  }
};
export const detailFormSchema: FormSchema[] = [
  {
    field: 'img_path',
    component: 'ApiTreeSelect',
    label: '已存在的文件',
    ifShow: ({ values }) => isNull(values.img_path),

    componentProps: { disabled: true },
  },
  {
    field: 'img_id',
    component: 'Input',
    label: 'id',
    ifShow: false,
  },
  {
    field: 'text_direction',
    label: '文本方向(ltr,rtl,tb)',
    component: 'Input',
    labelWidth: 120,
  },
  {
    field: 'priority',
    label: '排序',
    component: 'InputNumber',
    defaultValue: 1,
    required: true,
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
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'dynasty',
    label: '朝代',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'creator',
    label: '创建人',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'updater',
    label: '更新人',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'handler_name',
    label: '当前处理人',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'work_flow_type',
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
  {
    field: 'proofread_num',
    label: '校对轮次',
    component: 'Select',
    componentProps: {
      options: [
        { label: '图像上传校对', value: '-1' },
        { label: '一校', value: '0' },
        { label: '二校', value: '1' },
        { label: '最终校对', value: '2' },
        { label: '最终校对完成', value: '3' },
      ],
    },
    colProps: { span: 8 },
  },
];
export const InfoFormSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    required: true,
    dynamicDisabled: ({ values }) => {
      if (values.id) return true;
      else return false;
    },
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
    rules: [
      {
        required: true,
        validator: validatorCategories,
      },
    ],
    required: true,
    dynamicDisabled: ({ values }) => {
      if (values.categories) return true;
      else return false;
    },
  },
  {
    field: 'parent_name',
    label: '所属父级',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    field: 'parent',
    label: '所属父级id',
    component: 'Input',
    show: false,
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
    field: 'is_null',
    label: '是否为空',
    component: 'RadioButtonGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '空', value: '1' },
        { label: '包含内容', value: '0' },
      ],
    },
    dynamicDisabled: ({ values }) => {
      if (values.id) return true;
      else return false;
    },
  },
  {
    field: 'dynasty',
    label: '朝代',
    component: 'Input',
  },
  {
    field: 'mode',
    label: '版本',
    component: 'Input',
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
        showImageUpload: true,
        toolbar: toolbar,
        plugins: plugins,
        onChange: (value: string) => {
          model[field] = value;
        },
      });
    },
  },
];

export const method = ['plans ourms lofm'];
export const plugins = [
  'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime  lists  nonbreaking noneditable pagebreak   preview print save searchreplace tabfocus  template  textpattern visualblocks visualchars wordcount image anchor link',
];

export const toolbar = [
  'undo redo searchreplace subscript superscript fullscreen image anchor link removeformat fontselect ',
  '',
];
