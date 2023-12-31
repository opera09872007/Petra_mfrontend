import { defHttp } from '/@/utils/http/axios';
import { WorkflowTaskPageParams, WorkflowTaskPageListGetResultModel } from '../model/dataModel';
enum Api {
  TASKS = '/data/workflow_tasks/',
  NODES = '/data/workflow_nodes/',
}

// Get personal center-basic settings

export const getTaskListByPage = (params?: WorkflowTaskPageParams) =>
  defHttp.get<WorkflowTaskPageListGetResultModel>({ url: Api.TASKS, params });

export const getTaskDetailApi = (taskId: number) =>
  defHttp.get<void>({ url: Api.TASKS + taskId + '/' });

export const getNodesByDetailIdApi = (detailId: number) =>
  defHttp.get<void>({ url: Api.NODES + '?detail_id=' + detailId });

// export const finishTaskApi = (infoId: number, detailId: number) =>
//   defHttp.post<void>({
//     url: Api.TASKS + 'finishTask/' + '?infoId=' + infoId + '&detailId=' + detailId,
//   });

export const finishTaskApi = (detailId: number, type?: number) =>
  defHttp.post<void>({
    url: Api.TASKS + detailId + '/' + 'finish_task/',
    params: { type: type },
  });
