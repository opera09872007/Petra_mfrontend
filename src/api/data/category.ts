import { defHttp } from '/@/utils/http/axios';
enum Api {
  CateS = '/data/categoryies/',
  CateTree = '/data/categoryies/tree/',
}

// Get personal center-basic settings

export const getCateList = (params?: number | string) =>
  defHttp.get<void>({ url: Api.CateS, params });

export const getCateTree = () => defHttp.get<void>({ url: Api.CateTree });

export const CateAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.CateS, params: datas });

export const CateEditApi = (CateId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.CateS + CateId + '/', params: datas });

export const CateDetailApi = (CateId: number) =>
  defHttp.get<void>({ url: Api.CateS + CateId + '/' });

export const CateDeleteApi = (CateId: number) =>
  defHttp.delete<void>({ url: Api.CateS + CateId + '/' });
