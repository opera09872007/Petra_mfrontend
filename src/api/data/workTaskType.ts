import { defHttp } from '/@/utils/http/axios';
enum Api {
  task = '/data/worktask-type/',
}

export const getTaskTypeList = (repId: number) =>
  defHttp.get<Recordable[]>({ url: Api.task, params: { repId: repId } });

export const TaskTypeAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.task, params: datas });

export const TaskTypeEditApi = (task_id: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.task + task_id + '/', params: datas });

export const TaskTypeDeleteApi = (task_id: number) =>
  defHttp.delete<void>({ url: Api.task + task_id + '/' });

export const getTaskTypeTreeList = (repId: number) =>
  defHttp.get<Recordable[]>({ url: Api.task + 'tree/', params: { repId: repId } });
