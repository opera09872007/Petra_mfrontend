import { defHttp } from '/@/utils/http/axios';
enum Api {
  Perms = '/permissions/',
}

// Get personal center-basic settings

export const getPermsList = () => defHttp.get<void>({ url: Api.Perms });

export const permAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.Perms, params: datas });

export const permEditApi = (permId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.Perms + permId + '/', params: datas });

export const permDetailApi = (permId: number) =>
  defHttp.get<void>({ url: Api.Perms + permId + '/' });

export const permDeleteApi = (permId: number) =>
  defHttp.delete<void>({ url: Api.Perms + permId + '/' });
