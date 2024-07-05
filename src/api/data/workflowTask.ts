import { defHttp } from '/@/utils/http/axios';
import { WorkflowTaskPageParams, WorkflowTaskPageListGetResultModel } from '../model/dataModel';
enum Api {
  TASKS = '/data/workflow-tasks/',
  NODES = '/data/workflow-nodes/',
  Proofread = '/data/workflow-tasks/proofread/',
}

// Get personal center-basic settings

export const getTaskListByPage = (params?: WorkflowTaskPageParams) =>
  defHttp.get<WorkflowTaskPageListGetResultModel>({ url: Api.TASKS, params });

export const getTaskDetailApi = (taskId: number) =>
  defHttp.get<void>({ url: Api.TASKS + taskId + '/' });

export const taskDeleteApi = (taskId: number) =>
  defHttp.delete<void>({ url: Api.TASKS + taskId + '/' });

export const getNodesByDetailIdApi = (detailId: number) =>
  defHttp.get<void>({ url: Api.NODES + '?detailId=' + detailId });

// export const finishTaskApi = (infoId: number, detailId: number) =>
//   defHttp.post<void>({
//     url: Api.TASKS + 'finishTask/' + '?infoId=' + infoId + '&detailId=' + detailId,
//   });

export const getTaskImgTypeApi = (task_id: number) =>
  defHttp.get<void>({ url: Api.TASKS + task_id + '/' + 'img-type/' });

export const getProofreadApi = (
  repositoryId: number,
  proofReadType: string,
  proofReadNum: string,
) =>
  defHttp.get<void>({
    url: Api.Proofread,
    params: { repId: repositoryId, typeId: proofReadType, num: proofReadNum },
  });

export const finishTaskApi = (infoId: number, type?: number) =>
  defHttp.post<void>({
    url: Api.TASKS + infoId + '/' + 'finish-task/',
    params: { type: type },
  });

export const TaskAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.TASKS, params: datas });
