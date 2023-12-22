import { defHttp } from '/@/utils/http/axios';
enum Api {
  Infos = '/data/infos/',
}
import { InfoPageParams, InfoPageListGetResultModel } from '../model/dataModel';
// Get personal center-basic settings

export const getInfoList = (params: InfoPageParams) =>
  defHttp.get<InfoPageListGetResultModel>({ url: Api.Infos, params });

export const infoAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.Infos, params: datas });

export const infoEditApi = (infoId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.Infos + infoId + '/', params: datas });

export const infoDetailApi = (infoId: number) =>
  defHttp.get<void>({ url: Api.Infos + infoId + '/' });

export const infoDeleteApi = (infoId: number) =>
  defHttp.delete<void>({ url: Api.Infos + infoId + '/' });

export const infoGetPathNameApi = (infoId: number, type: number) =>
  defHttp.get<void>({ url: Api.Infos + infoId + '/' + 'get_pathname/', params: { type: type } });

export const finishUploadApi = (infoId: number, type?: number) =>
  defHttp.post<void>({
    url: Api.Infos + infoId + '/' + 'finish_upload/',
    params: { type: type },
  });

export const infoDownLoadAllImageApi = (infoId: number, type: number) =>
  defHttp.get<void>({ url: Api.Infos + infoId + '/' + 'download_all/', params: { type: type } });

export const infoResetStatusApi = (infoId: number) =>
  defHttp.post<void>({ url: Api.Infos + infoId + '/' + 'reset_status/' });

export const getinfoRepRegStrApi = (infoId: number) =>
  defHttp.get<void>({ url: Api.Infos + infoId + '/' + 'get_reg_path/' });

export const getinfoContainTextApi = (infoId: number) =>
  defHttp.get<void>({ url: Api.Infos + infoId + '/' + 'get_contain_text/' });
