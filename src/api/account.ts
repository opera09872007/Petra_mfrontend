import { defHttp } from '/@/utils/http/axios';
import { GetAccountInfoModel } from './model/accountModel';

enum Api {
  ACCOUNT_INFO = '/account/getAccountInfo',
  SESSION_TIMEOUT = '/user/sessionTimeout',
  TOKEN_EXPIRED = '/user/tokenExpired',
  ACCOUNT = '/users/',
}

// Get personal center-basic settings

export const accountInfoApi = () => defHttp.get<GetAccountInfoModel>({ url: Api.ACCOUNT_INFO });

export const sessionTimeoutApi = () => defHttp.post<void>({ url: Api.SESSION_TIMEOUT });

export const tokenExpiredApi = () => defHttp.post<void>({ url: Api.TOKEN_EXPIRED });

export const disableAccountApi = (accountId: number) =>
  defHttp.post<void>({ url: Api.ACCOUNT, params: accountId + '/disabled-account/' });

export const accountAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.ACCOUNT, params: datas });

export const accountEditApi = (accountId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.ACCOUNT + accountId + '/', params: datas });

export const accountDetailApi = (accountId: number) =>
  defHttp.get<void>({ url: Api.ACCOUNT + accountId + '/' });

export const accountDeleteApi = (accountId: number) =>
  defHttp.delete<void>({ url: Api.ACCOUNT + accountId + '/' });
