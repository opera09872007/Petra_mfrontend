import { defHttp } from '/@/utils/http/axios';
enum Api {
  Order = '/data/order/',
}
import { OrderParams, OrderPageListGetResultModel } from '../model/OrderModel';

// Get personal center-basic settings

export const getOrderList = (params: OrderParams) =>
  defHttp.get<OrderPageListGetResultModel>({ url: Api.Order, params });

export const completefeedBackApi = (ordersId: number) =>
  defHttp.post<void>({ url: Api.Order, params: ordersId + '/complete-orders/' });
