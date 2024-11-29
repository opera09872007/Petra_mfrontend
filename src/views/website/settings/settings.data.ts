import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag, Card, Space } from 'ant-design-vue';

import { BasicUpload } from '/@/components/Upload';
import { uploadApi } from '/@/api/sys/upload';
export const columns: BasicColumn[] = [
  {
    title: '订单编号',
    dataIndex: 'out_trade_no',
    align: 'left',
  },
  {
    title: '订单名称',
    dataIndex: 'subject',
    align: 'left',
  },
  {
    title: '总金额',
    dataIndex: 'total_amount',
    align: 'left',
    customRender: ({ record }) => {
      return Number(record.total_amount) / 10000;
    },
  },
  {
    title: '创建时间',
    dataIndex: 'order_create',
    align: 'left',
  },
  {
    title: '状态',
    dataIndex: 'trade_status',
    width: 180,
    customRender: ({ record }) => {
      let color = '#13c2c2';
      let text = '未处理';
      if (record.trade_status == 'TRADE_SUCCESS') {
        color = '#13c2c2';
        text = '支付成功';
      } else if (record.trade_status == 'TRADE_FINISHED') {
        color = '#13c2c2';
        text = '支付成功';
      } else if (record.trade_status == 'WAIT_BUYER_PAY') {
        color = '#13c2c2';
        text = '交易创建';
      } else if (record.trade_status == 'TRADE_CLOSED') {
        color = '#13c2c2';
        text = '交易关闭';
      } else {
        color = '#1890ff';
        text = '未付款';
      }
      return h(Tag, { color: color }, () => text);
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'carousel_image',
    label: '首页轮播图',
    component: 'Input',
    render: ({ model, field }) => {
      if (!Array.isArray(model[field])) {
        model[field] = [];
      }
      return h(Space, { align: 'center', size: [2, 10], wrap: true }, () => [
        h(BasicUpload, {
          api: uploadApi,
          maxNumber: 4,
          emptyHidePreview: true,
          onChange: (value) => {
            model[field] = value;
          },
        }),

        ...model[field].map((item, index) =>
          h(
            Card,
            { hoverable: true, style: { width: '240px' }, key: index },
            {
              cover: () =>
                h('img', {
                  alt: `轮播图 ${index + 1}`,
                  src: item,
                }),
              default: () => [h(Card.Meta, { title: `轮播图 ${index + 1}` })],
            },
          ),
        ),
      ]);
    },
  },
  {
    field: 'show_column_roll_news',
    label: '显示滚动新闻栏',
    colProps: { span: 24 },
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
    field: 'show_column_recommend',
    label: '显示数据库推荐栏',
    colProps: { span: 24 },
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
    field: 'show_column_news',
    label: '显示新闻栏',
    colProps: { span: 24 },
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
    field: 'copyright_footer_copyright',
    label: '页脚版权信息',
    colProps: { span: 18 },
    component: 'Input',
  },
];
export const plugins = [
  'advlist anchor autolink autosave code codesample  directionality  fullscreen hr insertdatetime  lists  nonbreaking noneditable pagebreak   preview print save searchreplace tabfocus  template  textpattern visualblocks visualchars wordcount image anchor link',
];

export const toolbar = [
  'undo redo searchreplace subscript superscript fullscreen image anchor link removeformat fontselect ',
  '',
];
