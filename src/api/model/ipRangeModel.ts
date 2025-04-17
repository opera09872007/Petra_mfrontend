import { BasicFetchResult } from '/@/api/model/baseModel';

export type IpRangeParams = {
  id?: string;
  title?: string;
  content?: string;
};

export interface IpRangeListItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  create_time: string;
  creator_name: string;
  update_time: string;
  updater: string;
}
export type IpRangePageListGetResultModel = BasicFetchResult<IpRangeListItem>;
