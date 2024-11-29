import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tinymce } from '/@/components/Tinymce/index';
import { InputNumber, Switch, Space } from 'ant-design-vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { setGoodsStatus } from '/@/api/website/goods';

import { BasicUpload } from '/@/components/Upload';
import { uploadApi } from '/@/api/sys/upload';
export const columns: BasicColumn[] = [
  {
    title: '商品标题',
    dataIndex: 'title',
    align: 'left',
  },
  {
    title: '数量',
    dataIndex: 'num',
    align: 'left',
  },
  {
    title: '价格(元)',
    dataIndex: 'price',
    align: 'left',
    customRender: ({ record }) => {
      return Number(record.price) / 100;
    },
  },
  {
    title: '折扣',
    dataIndex: 'discount',
    align: 'left',
  },
  {
    title: '折后价(元)',
    dataIndex: 'discounted_price',
    align: 'left',
    customRender: ({ record }) => {
      return (Number(record.price) * Number(record.discount)) / 10000;
    },
  },
  {
    title: '状态',
    dataIndex: 'on_shelves',
    width: 120,
    customRender: ({ record }) => {
      if (!Reflect.has(record, 'pendingStatus')) {
        record.pendingStatus = false;
      }
      return h(Switch, {
        checked: record.on_shelves === true,
        checkedChildren: '已上架',
        unCheckedChildren: '未上架',
        loading: record.pendingStatus,
        onChange(checked: boolean) {
          record.pendingStatus = true;
          const newStatus = checked ? true : false;
          const { createMessage } = useMessage();
          setGoodsStatus(record.id, newStatus)
            .then(() => {
              record.on_shelves = newStatus;
              if (newStatus == true) {
                createMessage.success(`已成功上架商品`);
              } else {
                createMessage.success(`已成功下架商品`);
              }
            })
            .catch(() => {
              createMessage.error('修改商品上架状态失败');
            })
            .finally(() => {
              record.pendingStatus = false;
            });
        },
      });
    },
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
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    ifShow: false,
  },
  {
    field: 'title',
    label: '商品标题',
    component: 'Input',
    required: true,
  },
  {
    field: 'num',
    label: '数量',
    component: 'InputNumber',
    required: true,
    colProps: { span: 16 },
  },
  {
    field: 'price',
    label: '价格',
    component: 'InputNumber',
    required: true,

    render: ({ model, field }) => {
      return h(InputNumber, {
        value: Number(model[field]) / 100,
        onChange: (e) => {
          model[field] = Number(e) * 100;
        },
      });
    },
  },
  {
    field: 'discount',
    label: '折扣',
    component: 'InputNumber',
    required: true,
  },
  {
    field: 'is_trial',
    label: '是否试用',
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
    field: 'trial_period',
    label: '试用时长(月)',
    defaultValue: 0,
    component: 'InputNumber',
    required: true,
  },
  {
    field: 'online_time',
    label: '上线时间',
    component: 'Input',
  },
  {
    field: 'sales_method',
    label: '产品形式',
    component: 'Input',
  },
  {
    field: 'resource_count',
    label: '资源数量',
    component: 'InputNumber',
  },
  {
    field: 'update_frequency',
    label: '更新频率',
    component: 'Input',
  },
  {
    field: 'tags',
    label: '标签(用逗号隔开)',
    component: 'Input',
  },
  {
    field: 'memo',
    label: '商品简介',
    colProps: { span: 24 },
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入商品简介',
      rows: 6,
    },
    required: true,
  },
  {
    field: 'img',
    label: '商品图片',
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
          alt: `商品图片`,
          src: model[field],
        }),
      ]);
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

export const plugins = [
  'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime  lists  nonbreaking noneditable pagebreak   preview print save searchreplace tabfocus  template  textpattern visualblocks visualchars wordcount image anchor link',
];

export const toolbar = [
  'undo redo searchreplace subscript superscript fullscreen image anchor link removeformat fontselect ',
  '',
];
