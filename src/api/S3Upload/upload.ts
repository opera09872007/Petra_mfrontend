import { defHttp } from '/@/utils/http/axios';

enum Api {
  getUpoladId = '/upload/create-multipart-upload/',
  getPreUrls = '/upload/presigned-urls/',
  completePart = '/upload/complete-part/',
  listParts = '/upload/list-parts/',
  deleteObjects = '/upload/delete-objects/',
  getPresignedObjects = '/upload/get-presigned-objects/',
}
// Get personal center-basic settings

export const createMultipartUpload = (params?: {
  bucketName: string;
  objectName: string;
  fileType: string;
}) => defHttp.get<void>({ url: Api.getUpoladId, params });

export const getPresignedUrls = (params?: {
  bucketName: string;
  objectName: string;
  partCount: number;
  uploadId: string;
}) => defHttp.get<void>({ url: Api.getPreUrls, params });

export const completePart = (params?: {
  bucketName: string;
  objectName: string;
  partCount: number;
  uploadId: string;
}) => defHttp.put<string>({ url: Api.completePart, params });

export const listParts = (params?: {
  bucketName: string;
  objectName: string;
  partCount: number;
  uploadId: string;
}) => defHttp.get<void>({ url: Api.listParts, params });

export const getPresignedObjects = (params?: { bucketName: string; objectName: string }) =>
  defHttp.get<void>({ url: Api.getPresignedObjects, params });

export const deleteObjects = (params?: { bucketName: string; delete_object_list: string[] }) =>
  defHttp.delete<void>({ url: Api.deleteObjects, params });
