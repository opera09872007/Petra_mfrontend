import { defHttp } from '/@/utils/http/axios';
enum Api {
  FeedBack = '/data/feedback/',
}
import { FeedbackParams, FeedbackPageListGetResultModel } from '../model/FeedbackModel';

// Get personal center-basic settings

export const getFeedBackList = (params: FeedbackParams) =>
  defHttp.get<FeedbackPageListGetResultModel>({ url: Api.FeedBack, params });

export const completefeedBackApi = (feedbackId: number) =>
  defHttp.post<void>({ url: Api.FeedBack, params: feedbackId + '/complete-feedback/' });
