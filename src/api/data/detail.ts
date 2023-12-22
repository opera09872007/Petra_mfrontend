import { defHttp } from '/@/utils/http/axios';

enum Api {
  Details = '/data/details/',
  file_revert = '/filepond/revert/',
  Proofread = '/data/details/proofread/',
  imagedealtask = '/data/details/imagedealtask/',
}
import { DetailPageParams, DetailPageListGetResultModel } from '../model/dataModel';
// Get personal center-basic settings

export const getDetailList = (params: DetailPageParams) =>
  defHttp.get<DetailPageListGetResultModel>({ url: Api.Details, params });

export const detailAddApi = (datas: number[], type: number) =>
  defHttp.post<void>({ url: Api.Details, params: [datas, type] });

export const detailEditApi = (detailId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.Details + detailId + '/', params: datas });

export const detailDetailApi = (detailId: number) =>
  defHttp.get<void>({ url: Api.Details + detailId + '/' });

export const detailDeleteApi = (detailId: number[], type: number) =>
  defHttp.delete<void>({ url: Api.Details + detailId + '/', params: { type: type } });

export const fileDeleteApi = (file_id: number) =>
  defHttp.delete<void>({
    url: Api.file_revert,
    data: file_id,
    headers: {
      'Content-type': 'text/plain',
    },
  });

export const getImageDealTaskApi = (repositoryId: number, categoryId: number) =>
  defHttp.get<void>({
    url: Api.imagedealtask + '?rep_id=' + repositoryId + '&cate_id=' + categoryId,
  });

export const getProofreadApi = (repositoryId: number, categoryId: number, proofReadNum: string) =>
  defHttp.get<void>({
    url:
      Api.Proofread + '?rep_id=' + repositoryId + '&cate_id=' + categoryId + '&num=' + proofReadNum,
  });

export const detailProofreadApi = (repositoryId: number, categoryId: number) =>
  defHttp.get<void>({
    url: Api.Proofread + '?rep_id=' + repositoryId + '&cate_id=' + categoryId,
  });

export const finishProofreadApi = (detailId: number) =>
  defHttp.post<void>({ url: Api.Details + detailId + '/' + 'finish_proofread/' });

export const returnProofreadApi = (detailId: number, memo: string) =>
  defHttp.post<void>({
    url: Api.Details + detailId + '/' + 'return_proofread/' + '?memo=' + memo,
  });

export const cancelReturnApi = (detailId: number) =>
  defHttp.post<void>({ url: Api.Details + detailId + '/' + 'cancel_return/' });

export const refreshProofreadApi = (detailId: number) =>
  defHttp.post<void>({
    url: Api.Details + detailId + '/' + 'refresh_proofread/',
  });

export const setkeyProofreadApi = (detailId: number, userId: number) =>
  defHttp.post<void>({
    url: Api.Details + detailId + '/' + 'setkey_proofread/?id=' + userId,
  });

export const checkProofreadUniqueApi = (detailId: number, userId: number) =>
  defHttp.get<void>({
    url: Api.Details + detailId + '/' + 'check_proofread_unique/?id=' + userId,
  });
