import { defHttp } from '/@/utils/http/axios';
import { RolePageParams, RolePageListGetResultModel } from '../model/systemModel';
enum Api {
  ROLES = '/roles/',
}

// Get personal center-basic settings

export const getRoleListByPage = (params?: RolePageParams) =>
  defHttp.get<RolePageListGetResultModel>({ url: Api.ROLES, params });

export const roleAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.ROLES, params: datas });

export const roleEditApi = (roleId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.ROLES + roleId + '/', params: datas });

export const roleDetailApi = (roleId: number) =>
  defHttp.get<void>({ url: Api.ROLES + roleId + '/' });

export const roleDeleteApi = (roleId: number) =>
  defHttp.delete<void>({ url: Api.ROLES + roleId + '/' });

export const setRoleStatus = (id: number, status: boolean) =>
  defHttp.post({ url: Api.ROLES + id + '/set-role-status/', params: { status } });
