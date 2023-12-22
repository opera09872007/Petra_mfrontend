import { defHttp } from '/@/utils/http/axios';
import { MenuListItem, MenuListGetResultModel } from '../model/systemModel';
enum Api {
  Menus = '/menus/',
}

// Get personal center-basic settings

export const getMenuList = (params?: MenuListItem) =>
  defHttp.get<MenuListGetResultModel>({ url: Api.Menus, params });

export const menuAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.Menus, params: datas });

export const menuEditApi = (menuId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.Menus + menuId + '/', params: datas });

export const menuDetailApi = (menuId: number) =>
  defHttp.get<void>({ url: Api.Menus + menuId + '/' });

export const menuDeleteApi = (menuId: number) =>
  defHttp.delete<void>({ url: Api.Menus + menuId + '/' });
