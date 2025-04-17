import { defHttp } from '/@/utils/http/axios';
enum Api {
  IpRange = '/data/ipRange/',
}
import { IpRangeParams, IpRangePageListGetResultModel } from '../model/ipRangeModel';

export interface IpRangeDetail {
  network: string;
  [key: string]: any;
}

export interface IpAccessData {
  rep_ids: number[];
  cate_ids: string[];
}

export const getipRangeList = (params: IpRangeParams) =>
  defHttp.get<IpRangePageListGetResultModel>({ url: Api.IpRange, params });

export const ipRangeAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.IpRange, params: datas });

export const ipRangeEditApi = (ipRangeId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.IpRange + ipRangeId + '/', params: datas });

export const ipRangeDetailApi = (ipRangeId: number) =>
  defHttp.get<IpRangeDetail>({ url: Api.IpRange + ipRangeId + '/' });

export const ipRangeDeleteApi = (ipRangeId: number) =>
  defHttp.delete<void>({ url: Api.IpRange + ipRangeId + '/' });

export const getIpAccess = (IpRangeId: number) =>
  defHttp.post<IpAccessData>({ url: '/ip_range_access/', params: { IpRangeId } });

export const updateIpRangeAccess = (datas: any) =>
  defHttp.post<void>({ url: '/update_ip_range_access/', data: datas });
