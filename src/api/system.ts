import {
  AccountParams,
  DeptListItem,
  RoleParams,
  MenuListGetResultModel,
  PermissionListGetResultModel,
  DeptListGetResultModel,
  AccountListGetResultModel,
  RoleListGetResultModel,
} from './model/systemModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  AccountList = '/users/',
  IsAccountExist = '/auth/accountExist/',
  DeptList = '/organizations/tree/',
  MenuList = '/menus/tree-list/',
  PermissionList = '/permissions/permission-list/',
  GetAllRoleList = '/roles/',
}

export const getAccountList = (params: AccountParams) =>
  defHttp.get<AccountListGetResultModel>({ url: Api.AccountList, params });

export const getDeptList = (params?: DeptListItem) =>
  defHttp.get<DeptListGetResultModel>({ url: Api.DeptList, params });

export const getMenuList = (userId?: number | string) =>
  defHttp.get<MenuListGetResultModel>({ url: Api.MenuList, params: { userId } });

export const getPermissionList = (userId?: number | string) =>
  defHttp.get<PermissionListGetResultModel>({ url: Api.PermissionList, params: { userId } });

export const getAllRoleList = (params?: RoleParams) =>
  defHttp.get<RoleListGetResultModel>({ url: Api.GetAllRoleList, params });

export const isAccountExist = (username: string, currentName: string) =>
  defHttp.post(
    { url: Api.IsAccountExist, params: { username, currentName } },
    { errorMessageMode: 'none' },
  );
