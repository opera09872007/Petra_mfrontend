import { BasicFetchResult } from '/@/api/model/baseModel';

export type NewsParams = {
  id?: string;
  title?: string;
  content?: string;
};

export interface NewsListItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  create_time: string;
  creator_name: string;
  update_time: string;
  updater: string;
}
export type NewsPageListGetResultModel = BasicFetchResult<NewsListItem>;
