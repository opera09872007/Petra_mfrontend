import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag, Tooltip } from 'ant-design-vue';
import { Tinymce } from '/@/components/Tinymce/index';
import { getTypeChild } from '/@/api/data/workTaskType';
import { useUserStore } from '/@/store/modules/user';
const userStore = useUserStore();
const repId = userStore.getUserInfo.now_work_repository;
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
    width: 100,
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 260,
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
  // {
  //   title: '总数量',
  //   dataIndex: 'num',
  //   width: 120,
  // },
  {
    title: '当前数量',
    dataIndex: 'now_num',
    width: 120,
  },
  // {
  //   title: '完成数量',
  //   dataIndex: 'finish_num',
  //   width: 120,
  // },
  {
    title: '状态',
    dataIndex: 'workflow_type_name',
    width: 180,
    customRender: ({ record }) => {
      if (record.is_null) {
        return '';
      }
      let text = record.task_name + '(' + record.workflow_type_name + ')';
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
    title: '当前处理人',
    dataIndex: 'dealer_name',
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
    title: '状态',
    dataIndex: 'workflow_type_name',
    width: 120,
    customRender: ({ record }) => {
      if (record.is_null) {
        return '';
      }
      let title = '';
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
      if (record.node_error_memo) {
        color = '#F08080';
        text = text;
        title = record.node_error_memo;
      }
      if (text.includes('返回') && !record.node_error_memo) {
        text = '';
      }
      return h(
        Tooltip,
        { color: color, title: title },
        { default: () => h(Tag, { color: color }, { default: () => text }) },
      );
    },
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
    field: 'dealer_name',
    label: '当前处理人',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'workflow_type_id',
    component: 'ApiCascader',
    label: '状态',
    colProps: {
      span: 8,
    },
    componentProps: {
      api: getTypeChild,
      apiParamKey: 'parentCode',
      initFetchParams: {
        repId: repId,
      },
      isLeaf: (record) => {
        return !(record.proofread_num > 0);
      },
    },
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
    field: 'alias',
    label: '别名',
    component: 'Input',
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
    field: 'era_name',
    label: '年号',
    component: 'Input',
  },
  {
    field: 'common_era',
    label: '公元纪年',
    component: 'Input',
  },
  {
    field: 'language',
    label: '文种',
    component: 'Input',
  },
  {
    field: 'inscription',
    label: '额题',
    component: 'Input',
  },
  {
    field: 'main_inscription',
    label: '首题',
    component: 'Input',
  },
  {
    field: 'material',
    label: '材质',
    component: 'Input',
  },
  {
    field: 'form',
    label: '形制',
    component: 'Input',
  },
  {
    field: 'shape',
    label: '形款',
    component: 'Input',
  },
  {
    field: 'composition',
    label: '撰文',
    component: 'Input',
  },
  {
    field: 'author',
    label: '书丹',
    component: 'Input',
  },
  {
    field: 'inscriber',
    label: '刊石',
    component: 'Input',
  },
  {
    field: 'font',
    label: '书体',
    component: 'Input',
  },
  {
    field: 'excavation_site',
    label: '出土地（或原址）及时间',
    component: 'Input',
  },
  {
    field: 'collector',
    label: '收藏者或保护单位',
    component: 'Input',
  },
  {
    field: 'content',
    component: 'Input',
    label: '叙录',
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
  {
    field: 'source',
    label: '著录文献',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入著录文献',
      rows: 8,
    },
    colProps: { span: 18 },
  },
];
export const ProofreadFormSchema: FormSchema[] = [
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
export const method = ['plans ourms lofm'];
export const plugins = [
  'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime  lists  nonbreaking noneditable pagebreak   preview print save searchreplace tabfocus  template  textpattern visualblocks visualchars wordcount image anchor link',
];

export const toolbar = [
  'undo redo searchreplace subscript superscript fullscreen image anchor link removeformat fontselect ',
  '',
];
