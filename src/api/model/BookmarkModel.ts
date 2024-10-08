import { BasicFetchResult } from '/@/api/model/baseModel';

export type BookmarkParams = {
  id?: string;
  title?: string;
  content?: string;
};

export interface BookmarkListItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  create_time: string;
  creator_name: string;
  update_time: string;
  updater: string;
}
export type BookmarkPageListGetResultModel = BasicFetchResult<BookmarkListItem>;
