import { defHttp } from '/@/utils/http/axios';

enum Api {
  Details = '/data/details/',
  imageDealTask = '/data/details/image-deal-task/',
  BatchCreate = '/data/details/batch-create/',
  BatchUpdate = '/data/details/batch-update/',
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

export const getImageDealTaskApi = (repositoryId: number) =>
  defHttp.get<void>({
    url: Api.imageDealTask + '?repId=' + repositoryId,
  });

export const detailProofreadApi = (repositoryId: number, categoryId: number) =>
  defHttp.get<void>({
    url: Api.Proofread + '?repId=' + repositoryId + '&cateId=' + categoryId,
  });

export const finishProofreadApi = (detailId: number) =>
  defHttp.post<void>({ url: Api.Details + detailId + '/' + 'finish-proofread/' });

export const returnProofreadApi = (detailId: number, memo: string) =>
  defHttp.post<void>({
    url: Api.Details + detailId + '/' + 'return-proofread/' + '?memo=' + memo,
  });

export const cancelReturnApi = (detailId: number) =>
  defHttp.post<void>({ url: Api.Details + detailId + '/' + 'cancel-return/' });

export const refreshProofreadApi = (detailId: number) =>
  defHttp.post<void>({
    url: Api.Details + detailId + '/' + 'refresh-proofread/',
  });

export const setkeyProofreadApi = (detailId: number, userId: number) =>
  defHttp.post<void>({
    url: Api.Details + detailId + '/' + 'set-key-proofread/?id=' + userId,
  });

export const checkProofreadUniqueApi = (detailId: number, userId: number) =>
  defHttp.get<void>({
    url: Api.Details + detailId + '/' + 'check-proofread-unique/?id=' + userId,
  });

export const detailBatchAddApi = (datas: number[], type: number) =>
  defHttp.post<void>({ url: Api.BatchCreate, params: [datas, type] });

export const detailBatchUploadHtmlFileApi = (datas: any) =>
  defHttp.post<void>({ url: Api.BatchUpdate, params: datas });
