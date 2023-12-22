import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

export type AccountParams = BasicPageParams & {
  account?: string;
  nickname?: string;
};

export type RoleParams = {
  roleName?: string;
  status?: string;
};

export type RolePageParams = BasicPageParams & RoleParams;

export type DeptParams = {
  deptName?: string;
  status?: string;
};

export type MenuParams = {
  menuName?: string;
  status?: string;
};

export type StatisticsPageParams = BasicPageParams & StatisticsParams;
export type StatisticsParams = {
  Name?: string;
  dates?: string;
};

export interface AccountListItem {
  id: string;
  account: string;
  email: string;
  nickname: string;
  role: number;
  createTime: string;
  remark: string;
  status: number;
}

export interface DeptListItem {
  id: string;
  orderNo: string;
  createTime: string;
  remark: string;
  status: number;
}

export interface MenuListItem {
  id: string;
  title: string;
  path: string;
  name: string;
  component: string;
  redirect: string;
  priority: number;
  icon: string;
  is_frame: boolean;
  is_show: boolean;
  ignoreKeepAlive: boolean;
  create_time: string;
  is_active: number;
  is_button: boolean;
}

export interface PermissionListItem {
  id: string;
  title: string;
  path: string;
  is_config: string;
  method: string;
  code: number;
  create_time: string;
  is_active: boolean;
  priority: number;
  menu_id: number;
  name: string;
}

export interface RoleListItem {
  id: string;
  name: string;
  is_active: number;
  priority: string;
  create_time: string;
}

export interface StatisticsListItem {
  id: string;
  user_name: string;
  week_sum: string;
  mouth_sum: string;
  year_sum: string;
}

/**
 * @description: Request list return value
 */
export type AccountListGetResultModel = BasicFetchResult<AccountListItem>;

export type DeptListGetResultModel = BasicFetchResult<DeptListItem>;

export type MenuListGetResultModel = BasicFetchResult<MenuListItem>;

export type PermissionListGetResultModel = BasicFetchResult<PermissionListItem>;

export type RolePageListGetResultModel = BasicFetchResult<RoleListItem>;

export type RoleListGetResultModel = RoleListItem[];

export type StatisticsPageListGetResultModel = BasicFetchResult<StatisticsListItem>;
