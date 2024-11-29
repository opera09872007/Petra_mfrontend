import { defHttp } from '/@/utils/http/axios';
enum Api {
  SiteSettings = '/data/site-settings/',
}
import { SiteSettingsPageListGetResultModel } from '../model/SiteSettingsModel';

// Get personal center-basic settings

export const getSiteSettingsList = () =>
  defHttp.get<SiteSettingsPageListGetResultModel>({ url: Api.SiteSettings });

export const siteSettingsEditApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.SiteSettings, params: datas });
