import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { getAllRoleList } from '/@/api/system';
import { Space } from 'ant-design-vue';
import { h } from 'vue';
import { BasicUpload } from '/@/components/Upload';
import { uploadApi } from '/@/api/sys/upload';

const validatorName = async (rule, value) => {
  if (!value) return;
  if (!/^[a-z]+$/.test(value)) {
    return Promise.reject('格式不正确(只能输入英文小写字母)!');
  } else {
    return Promise.resolve();
  }
};
export const columns: BasicColumn[] = [
  {
    title: '资源库名称',
    dataIndex: 'title',
    align: 'left',
  },
  {
    title: '标识符',
    dataIndex: 'name',
    align: 'left',
  },
  {
    title: '地址',
    dataIndex: 'path',
    align: 'left',
  },
  {
    title: '角色访问权限',
    dataIndex: 'roles',
    align: 'left',
    customRender: ({ record }) => {
      let names = '';
      let num = 1;
      const len = record.roles.length;

      for (const role of record.roles) {
        names += role.label;
        if (num < len) {
          names += '，';
        }
        num++;
      }
      return names;
    },
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
    label: '资源库名称',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'title',
    label: '资源库名称',
    component: 'Input',
    required: true,
    dynamicDisabled: ({ values }) => {
      if (values.id) return true;
      else return false;
    },
  },
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    ifShow: false,
  },
  {
    field: 'name',
    label: '标识符',
    component: 'Input',
    required: true,

    dynamicDisabled: ({ values }) => {
      if (values.id) return true;
      else return false;
    },
    rules: [
      { trigger: 'blur', required: true },
      {
        validator: validatorName,
      },
    ],
  },
  {
    field: 'path',
    label: '地址',
    component: 'Input',
    dynamicDisabled: ({ values }) => {
      if (values.id) return true;
      else return false;
    },
  },
  {
    field: 'parent',
    label: '上级资源库',
    component: 'TreeSelect',

    colProps: { span: 16 },
    componentProps: {
      fieldNames: {
        label: 'title',
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
    label: '角色访问权限',
    field: 'roles',
    component: 'ApiSelect',
    colProps: {
      span: 16,
    },
    componentProps: {
      api: getAllRoleList,
      resultField: 'list',
      labelField: 'name',
      valueField: 'id',
      labelInValue: true,
      mode: 'multiple',
      immediate: false,
    },
    required: true,
  },
  {
    field: 'contain_text',
    label: '是否包含文字',
    component: 'RadioButtonGroup',
    defaultValue: '0',
    colProps: {
      span: 16,
    },
    componentProps: {
      options: [
        { label: '包含', value: '1' },
        { label: '未包含', value: '0' },
      ],
    },
  },
  {
    field: 'is_proofread',
    label: '是否校对',
    component: 'RadioButtonGroup',
    defaultValue: '1',
    colProps: {
      span: 16,
    },
    componentProps: {
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
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
    field: 'img',
    label: '图片',
    component: 'Input',
    colProps: { span: 16 },
    render: ({ model, field }) => {
      return h(Space, { align: 'center', size: [2, 10], wrap: true }, () => [
        h(BasicUpload, {
          api: uploadApi,
          maxNumber: 1,
          emptyHidePreview: true,
          onChange: (value) => {
            model[field] = value[0];
          },
        }),

        h('img', {
          alt: `图片`,
          src: model[field],
        }),
      ]);
    },
  },
  {
    label: '备注',
    field: 'memo',
    component: 'InputTextArea',

    colProps: { span: 18 },
  },
];

export const taskSchema: FormSchema[] = [
  {
    field: 'name',
    label: '任务名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'proofreadNum',
    label: '校对次数',
    component: 'InputNumber',
    required: true,
    defaultValue: 1,
  },
  {
    field: 'imgType',
    label: '图片标识',
    component: 'InputNumber',
    required: true,
    defaultValue: 0,
  },
  {
    field: 'imgPathType',
    label: '图片路径标识',
    component: 'Input',
    required: true,
  },
  {
    field: 'priority',
    label: '任务排序',
    component: 'InputNumber',
    required: true,
    defaultValue: 1,
  },
];

export const taskcolumns: BasicColumn[] = [
  {
    title: 'id',
    dataIndex: 'id',
    align: 'left',
    ifShow: false,
  },
  {
    title: '任务名称',
    dataIndex: 'name',
    editRow: true,
    align: 'left',
    width: 50,
  },
  {
    title: '校对次数',
    dataIndex: 'proofread_num',
    editRow: true,
    width: 50,
  },
  {
    title: '图片标识',
    dataIndex: 'img_type',
    editRow: false,
    width: 50,
  },
  {
    title: '图片路径标识',
    dataIndex: 'img_path_type',
    editRow: false,
    width: 50,
  },
  {
    title: '排序',
    dataIndex: 'priority',
    width: 50,
    editRow: false,
  },
];
