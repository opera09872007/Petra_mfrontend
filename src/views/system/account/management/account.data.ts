import { getAllRoleList, getDeptList } from '/@/api/system';
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

const validatorPhone = async (rule, value) => {
  if (!value) return;
  if (!/^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/.test(value)) {
    return Promise.reject('手机号格式不正确!');
  } else {
    return Promise.resolve();
  }
};
const validatorEmail = async (rule, value) => {
  if (!value) return;
  if (
    !/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.(?:com|cn)$/.test(
      value,
    )
  ) {
    return Promise.reject('邮箱格式不正确!');
  } else {
    return Promise.resolve();
  }
};
export const columns: BasicColumn[] = [
  {
    title: '用户名',
    dataIndex: 'username',
    width: 120,
  },
  {
    title: '姓名',
    dataIndex: 'name',
    width: 120,
  },
  {
    title: '昵称',
    dataIndex: 'nick_name',
    width: 120,
  },
  {
    title: '部门',
    dataIndex: 'organization_name',
    width: 200,
  },
  {
    title: '角色',
    dataIndex: 'roles',
    width: 200,
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
    title: '邮箱',
    dataIndex: 'email',
    width: 120,
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'date_joined',
    width: 180,
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '姓名',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const accountFormSchema: FormSchema[] = [
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    required: true,
    helpMessage: ['不能输入带有admin的用户名'],
    // rules: [
    //   { trigger: 'blur', required: true, message: '请输入用户名' },
    //   {
    //     validator(_, value) {
    //       console.log('444');
    //       console.log(value);
    //       return new Promise((resolve, reject) => {
    //         isAccountExist(value)
    //           .then(() => resolve())
    //           .catch((err) => {
    //             reject(err.message || '验证失败');
    //           });
    //       });
    //     },
    //   },
    // ],
    // dynamicRules: ({ values }) => {
    //   return [
    //     {
    //       required: true,
    //       validator: (_, value) => {
    //         console.log('555');
    //         console.log(values);
    //         console.log('555');
    //         return new Promise((resolve, reject) => {
    //           isAccountExist(value)
    //             .then(() => resolve())
    //             .catch((err) => {
    //               reject(err.message || '验证失败');
    //             });
    //         });
    //       },
    //     },
    //   ];
    // },
  },
  {
    field: 'name',
    label: '姓名',
    component: 'Input',
    required: true,
  },
  {
    field: 'nick_name',
    label: '昵称',
    component: 'Input',
  },
  {
    field: 'pwd',
    label: '密码',
    component: 'InputPassword',
    required: true,
    ifShow: false,
  },
  {
    label: '角色',
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
    field: 'organization_name',
    label: '所属部门',
    component: 'ApiTreeSelect',
    colProps: {
      span: 16,
    },
    componentProps: {
      api: getDeptList,
      resultField: 'list',
      treeDefaultExpandAll: true,
      fieldNames: {
        label: 'name',
        key: 'id',
        value: 'name',
      },
      getPopupContainer: () => document.body,
    },
    required: true,
  },

  {
    label: '邮箱',
    field: 'email',
    component: 'Input',
    rules: [
      { trigger: 'blur', required: true },
      {
        validator: validatorEmail,
      },
    ],
    required: true,
  },
  {
    label: '手机号',
    field: 'mobile',
    component: 'Input',
    rules: [
      { trigger: 'blur', required: true },
      {
        validator: validatorPhone,
      },
    ],
    required: true,
  },
  {
    label: '任务上限',
    field: 'task_num',
    component: 'InputNumber',
    defaultValue: 10,
    required: true,
  },
  {
    field: 'is_deal_self',
    label: '(回退任务申请方式)只申请自己',
    labelWidth: '11',
    component: 'Switch',
    required: true,
    defaultValue: true,
  },
  {
    label: 'AccessKey',
    field: 'secret_key',
    component: 'Input',
  },
  {
    label: 'SecretKey',
    field: 'access_key',
    component: 'Input',
  },
  {
    label: 'EndPoint',
    field: 'end_point',
    component: 'Input',
  },
  {
    label: '备注',
    field: 'remark',
    component: 'InputTextArea',
  },
];
