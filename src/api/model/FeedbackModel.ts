import { BasicFetchResult } from '/@/api/model/baseModel';

export type FeedbackParams = {
  id?: string;
  title?: string;
  content?: string;
};

export interface FeedbackListItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  create_time: string;
  creator_name: string;
  update_time: string;
  updater: string;
}
export type FeedbackPageListGetResultModel = BasicFetchResult<FeedbackListItem>;
