import { defHttp } from '/@/utils/http/axios';
import { getMenuListResultModel } from './model/menuModel';

enum Api {
  GetMenuList = '/menus/tree/',
}

/**
 * @description: Get user menu based on id
 */

export const getMenuList = (userId: number | string) => {
  return defHttp.get<getMenuListResultModel>({ url: Api.GetMenuList, params: { userId } });
};
