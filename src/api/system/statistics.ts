import { defHttp } from '/@/utils/http/axios';
import { StatisticsPageParams, StatisticsPageListGetResultModel } from '../model/systemModel';
enum Api {
  STATISTICS = '/data/statistics/',
}

// Get personal center-basic settings

export const getStatisticsListByPage = (params?: StatisticsPageParams) =>
  defHttp.get<StatisticsPageListGetResultModel>({ url: Api.STATISTICS, params });

export const getResOverviewByPage = () => defHttp.get<void>({ url: Api.STATISTICS + 'overview/' });
