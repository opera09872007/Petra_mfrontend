import { defHttp } from '/@/utils/http/axios';
enum Api {
  Bookmark = '/data/bookmark/',
}
import { BookmarkListItem, BookmarkPageListGetResultModel } from '../model/BookmarkModel';

// Get personal center-basic settings

export const getBookmarkList = (params: BookmarkListItem) =>
  defHttp.get<BookmarkPageListGetResultModel>({ url: Api.Bookmark, params });
