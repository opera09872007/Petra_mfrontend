import { BasicFetchResult } from '/@/api/model/baseModel';

export type GoodsParams = {
  id?: string;
  title?: string;
  content?: string;
};

export interface GoodsListItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  create_time: string;
  creator_name: string;
  update_time: string;
  updater: string;
}
export type GoodsPageListGetResultModel = BasicFetchResult<GoodsListItem>;
