import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import { Icon } from '/@/components/Icon';

export const columns: BasicColumn[] = [
  {
    title: '菜单名称',
    dataIndex: 'title',
    width: 200,
    align: 'left',
  },
  {
    title: '图标',
    dataIndex: 'icon',
    width: 50,
    customRender: ({ record }) => {
      return h(Icon, { icon: record.icon });
    },
  },
  {
    title: '路由',
    dataIndex: 'path',
  },
  {
    title: '权限标识',
    dataIndex: 'name',
    width: 180,
  },
  {
    title: '组件',
    dataIndex: 'component',
  },
  {
    title: '排序',
    dataIndex: 'priority',
  },
  {
    title: '类型',
    dataIndex: 'is_button',
    customRender: ({ record }) => {
      const is_button = record.is_button;
      let color = 'green';
      let text = '按钮';
      switch (is_button) {
        case '0':
          color = '#13c2c2';
          text = '目录';
          break;
        case '1':
          color = '#1890ff';
          text = '菜单';
          break;
        default:
          color = '#faad14';
          text = '按钮';
          break;
      }
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '请求分类',
    dataIndex: 'method',
  },
  {
    title: '权限码',
    dataIndex: 'code',
  },
  {
    title: '状态',
    dataIndex: 'is_active',
    width: 80,
    customRender: ({ record }) => {
      const status = record.is_active;
      const enable = ~~status === 1;
      const color = enable ? 'green' : 'red';
      const text = enable ? '启用' : '停用';
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    width: 180,
  },
];

const isDir = (is_button: string) => is_button === '0';
const isMenu = (is_button: string) => is_button === '1';
const isButton = (is_button: string) => is_button === '2';

export const searchFormSchema: FormSchema[] = [
  {
    field: 'title',
    label: '菜单名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'is_active',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: '1' },
        { label: '停用', value: '0' },
      ],
    },
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'is_button',
    label: '菜单类型',
    component: 'RadioButtonGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '目录', value: '0' },
        { label: '菜单', value: '1' },
        { label: '按钮', value: '2' },
      ],
    },
    colProps: { lg: 24, md: 24 },
    dynamicDisabled: ({ values }) => {
      if (values.isUpdate) {
        return true;
      } else return false;
    },
  },
  {
    field: 'title',
    label: '菜单名称',
    component: 'Input',
    required: true,
  },

  {
    field: 'priority',
    label: '排序',
    component: 'InputNumber',
    required: true,
    defaultValue: 1,
  },
  {
    field: 'path',
    label: '路由地址',
    component: 'Input',
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

  {
    field: 'name',
    label: '权限标识',
    required: true,
    component: 'Input',
  },
  {
    field: 'icon',
    label: '图标',
    component: 'IconPicker',
    ifShow: ({ values }) => !isButton(values.is_button),
  },
  {
    field: 'component',
    label: '组件',
    component: 'Input',
    required: true,
    ifShow: ({ values }) => isMenu(values.is_button),
  },

  {
    field: 'is_show',
    label: '是否显示',
    component: 'RadioButtonGroup',
    defaultValue: '1',
    componentProps: {
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
    },
    ifShow: ({ values }) => !isButton(values.is_button),
  },
  {
    field: 'menu',
    label: '上级菜单',
    component: 'TreeSelect',
    required: true,
    componentProps: {
      fieldNames: {
        label: 'title',
        key: 'id',
        value: 'id',
      },
      getPopupContainer: () => document.body,
    },
    ifShow: ({ values }) => !isDir(values.is_button),
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'method',
    label: '请求分类',
    component: 'Input',
    required: true,
    ifShow: ({ values }) => isButton(values.is_button),
  },
  {
    field: 'code',
    label: '权限码',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => isButton(values.is_button),
  },

  {
    field: 'isUpdate',
    label: '更新',
    component: 'Input',
    ifShow: false,
  },
  // {
  //   field: 'is_frame',
  //   label: '是否外链',
  //   component: 'RadioButtonGroup',
  //   defaultValue: '0',
  //   componentProps: {
  //     options: [
  //       { label: '否', value: '0' },
  //       { label: '是', value: '1' },
  //     ],
  //   },
  //   ifShow: ({ values }) => !isButton(values.is_button),
  // },

  {
    field: 'ignoreKeepAlive',
    label: '忽略缓存',
    component: 'RadioButtonGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '否', value: '0' },
        { label: '是', value: '1' },
      ],
    },
    ifShow: ({ values }) => isMenu(values.is_button),
  },
];
