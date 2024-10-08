import { defHttp } from '/@/utils/http/axios';
enum Api {
  Excerpt = '/data/excerpt/',
}
import { ExcerptListItem, ExcerptPageListGetResultModel } from '../model/ExcerptModel';

// Get personal center-basic settings

export const getExcerptList = (params: ExcerptListItem) =>
  defHttp.get<ExcerptPageListGetResultModel>({ url: Api.Excerpt, params });
