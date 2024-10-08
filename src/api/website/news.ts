import { defHttp } from '/@/utils/http/axios';
enum Api {
  News = '/data/news/',
}
import { NewsParams, NewsPageListGetResultModel } from '../model/newsModel';

// Get personal center-basic settings

export const getnewsList = (params: NewsParams) =>
  defHttp.get<NewsPageListGetResultModel>({ url: Api.News, params });

export const newsAddApi = (datas: number[]) => defHttp.post<void>({ url: Api.News, params: datas });

export const newsEditApi = (newsId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.News + newsId + '/', params: datas });

export const newsDetailApi = (newsId: number) =>
  defHttp.get<void>({ url: Api.News + newsId + '/' });

export const newsDeleteApi = (newsId: number) =>
  defHttp.delete<void>({ url: Api.News + newsId + '/' });
