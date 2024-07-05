import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { getTypeChild } from '/@/api/data/workTaskType';
import { useUserStore } from '/@/store/modules/user';
const userStore = useUserStore();
const repId = userStore.getUserInfo.now_work_repository;
export const columns: BasicColumn[] = [
  {
    title: '用户名称',
    dataIndex: 'now_node_person_name',
  },
  {
    title: '查询数量',
    dataIndex: 'count',
  },
  // {
  //   title: '错误数量',
  //   dataIndex: 'err_nums',
  // },
  // {
  //   title: '错误占比',
  //   dataIndex: 'percent',

  //   // customRender: ({ text }) => {
  //   //   return h(Progress, { percent: Number(text) });
  //   // },

  //   customRender: ({ text }) => {
  //     if (text == undefined) {
  //       return '0%';
  //     }
  //     return text + '%';
  //   },
  // },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '用户名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'fieldTime',
    component: 'RangePicker',
    label: '时间区间',
    colProps: {
      span: 8,
    },
    componentProps: { showTime: true },
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
