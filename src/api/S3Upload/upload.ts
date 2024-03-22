import { defHttp } from '/@/utils/http/axios';
enum Api {
  getUpoladId = '/upload/create-multipart-upload/',
  getPreUrls = '/upload/presigned-urls/',
  complete_part = '/upload/complete-part/',
  list_parts = '/upload/list-parts/',
}

// Get personal center-basic settings

export const createMultipartUpload = (params?: { bucketName: string; objectName: string }) =>
  defHttp.get<void>({ url: Api.getUpoladId, params });

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
}) => defHttp.put<string>({ url: Api.complete_part, params });

export const listParts = (params?: {
  bucketName: string;
  objectName: string;
  partCount: number;
  uploadId: string;
}) => defHttp.get<void>({ url: Api.list_parts, params });
