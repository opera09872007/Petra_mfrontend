import { BasicFetchResult } from '/@/api/model/baseModel';

export type ExcerptParams = {
  id?: string;
  title?: string;
  content?: string;
};

export interface ExcerptListItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  create_time: string;
  creator_name: string;
  update_time: string;
  updater: string;
}
export type ExcerptPageListGetResultModel = BasicFetchResult<ExcerptListItem>;
