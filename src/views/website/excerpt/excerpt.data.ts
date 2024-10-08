import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tinymce } from '/@/components/Tinymce/index';
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
