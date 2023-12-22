import { defHttp } from '/@/utils/http/axios';
enum Api {
  DeptS = '/organizations/',
}

// Get personal center-basic settings

export const getDeptList = () => defHttp.get<void>({ url: Api.DeptS });

export const DeptAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.DeptS, params: datas });

export const DeptEditApi = (DeptId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.DeptS + DeptId + '/', params: datas });

export const DeptDetailApi = (DeptId: number) =>
  defHttp.get<void>({ url: Api.DeptS + DeptId + '/' });

export const DeptDeleteApi = (DeptId: number) =>
  defHttp.delete<void>({ url: Api.DeptS + DeptId + '/' });
