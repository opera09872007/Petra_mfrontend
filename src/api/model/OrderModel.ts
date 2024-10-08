import { BasicFetchResult } from '/@/api/model/baseModel';

export type OrderParams = {
  id?: string;
  title?: string;
  content?: string;
};

export interface OrderListItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  create_time: string;
  creator_name: string;
  update_time: string;
  updater: string;
}
export type OrderPageListGetResultModel = BasicFetchResult<OrderListItem>;
