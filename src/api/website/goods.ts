import { defHttp } from '/@/utils/http/axios';
enum Api {
  Goods = '/data/goods/',
}
import { GoodsParams, GoodsPageListGetResultModel } from '../model/goodsModel';

// Get personal center-basic settings

export const getgoodsList = (params: GoodsParams) =>
  defHttp.get<GoodsPageListGetResultModel>({ url: Api.Goods, params });

export const goodsAddApi = (datas: number[]) =>
  defHttp.post<void>({ url: Api.Goods, params: datas });

export const goodsEditApi = (goodsId: number, datas: number[]) =>
  defHttp.put<void>({ url: Api.Goods + goodsId + '/', params: datas });

export const goodsDetailApi = (goodsId: number) =>
  defHttp.get<void>({ url: Api.Goods + goodsId + '/' });

export const goodsDeleteApi = (goodsId: number) =>
  defHttp.delete<void>({ url: Api.Goods + goodsId + '/' });

export const setGoodsStatus = (id: number, on_shelves: boolean) =>
  defHttp.post({ url: Api.Goods + id + '/set-goods-status/', params: { on_shelves } });

export const getGoodsDetail = (id: number) => defHttp.get({ url: Api.Goods + id + '/get-detail/' });

export const addGoodsDetail = (id: number, rep_ids: number[], cate_ids: number[]) =>
  defHttp.post({
    url: Api.Goods + id + '/add-detail/',
    params: { rep_ids: rep_ids, cate_ids: cate_ids },
  });
