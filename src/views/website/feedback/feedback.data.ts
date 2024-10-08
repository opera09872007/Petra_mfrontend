import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tinymce } from '/@/components/Tinymce/index';
import { Tag } from 'ant-design-vue';
export const columns: BasicColumn[] = [
  {
    title: '问题id',
    dataIndex: 'detail_id',
    align: 'left',
  },
  {
    title: '标题',
    dataIndex: 'title',
    align: 'left',
  },
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
  {
    title: '状态',
    dataIndex: 'id_done',
    width: 180,
    customRender: ({ record }) => {
      let color = '#13c2c2';
      let text = '未处理';
      if (record.is_done == false) {
        color = '#13c2c2';
      } else {
        color = '#1890ff';
        text = '已处理';
      }
      return h(Tag, { color: color }, () => text);
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'detail_id',
    label: '问题id',
    component: 'Input',
    dynamicDisabled: true,
  },
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
    field: 'title',
    label: '问题标题',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    field: 'creator_name',
    label: '提交的用户名称',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    field: 'contact',
    label: '联系方式',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    field: 'memo',
    component: 'Input',
    label: '问题描述',
    colProps: { span: 24 },
    render: ({ model, field }) => {
      return h(Tinymce, {
        value: model[field],
        showImageUpload: false,
        toolbar: toolbar,
        plugins: plugins,
        options: { readonly: true },
        onChange: (value: string) => {
          model[field] = value;
        },
      });
    },
  },
];

export const plugins = [
  'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime  lists  nonbreaking noneditable pagebreak   preview print save searchreplace tabfocus  template  textpattern visualblocks visualchars wordcount image anchor link',
];

export const toolbar = [
  'undo redo searchreplace subscript superscript fullscreen image anchor link removeformat fontselect ',
  '',
];
