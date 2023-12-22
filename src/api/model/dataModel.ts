import { BasicPageParams, BasicFetchResult } from '/@/api/model/baseModel';

export type InfoParams = {
  name?: string;
  title?: string;
  is_active?: string;
};

export type DetailParams = {
  is_active?: string;
  type?: string;
};
export type WorkflowTaskParams = {
  name?: string;
  status?: string;
};
export type InfoPageParams = BasicPageParams & InfoParams;

export type DetailPageParams = BasicPageParams & DetailParams;
export type WorkflowTaskPageParams = BasicPageParams & WorkflowTaskParams;
export interface InfoListItem {
  id: string;
  name: string;
  title: string;
  is_active: number;
  priority: string;
  create_time: string;
}
export interface DetailListItem {
  id: string;
  is_active: number;
  priority: string;
  create_time: string;
  creator: string;
}
export interface WorkflowTaskListItem {
  id: string;
  name: string;
  task_name: string;
  memo: number;
  type: string;
  create_time: string;
}
export type DetailPageListGetResultModel = BasicFetchResult<DetailListItem>;
export type InfoPageListGetResultModel = BasicFetchResult<InfoListItem>;
export type WorkflowTaskPageListGetResultModel = BasicFetchResult<WorkflowTaskListItem>;
