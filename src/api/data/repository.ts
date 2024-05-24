import { defHttp } from '/@/utils/http/axios';
enum Api {
  Repositories = '/data/repositories/',

  RepositoriesTree = '/data/repositories/tree/',
}

// Get personal center-basic settings

export const getRepositoryList = () => defHttp.get<void>({ url: Api.Repositories });

export const getRepositoryTree = () => defHttp.get<void>({ url: Api.RepositoriesTree });

export const repositoryAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.Repositories, params: datas });

export const repositoryEditApi = (repositoryId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.Repositories + repositoryId + '/', params: datas });

export const repositoryDetailApi = (repositoryId: number) =>
  defHttp.get<void>({ url: Api.Repositories + repositoryId + '/' });

export const repositoryDeleteApi = (repositoryId: number) =>
  defHttp.delete<void>({ url: Api.Repositories + repositoryId + '/' });

export const getCateByResIdApi = (repositoryId: number) =>
  defHttp.get<void>({ url: Api.Repositories + repositoryId + '/' + 'cate-tree/' });

export const setUserRepApi = (repositoryId: number) =>
  defHttp.post<void>({ url: Api.Repositories + repositoryId + '/' + 'set-user-rep/' });

export const getTaskTypeApi = (repositoryId: number) =>
  defHttp.get<void>({ url: Api.Repositories + repositoryId + '/' + 'task-type/' });
