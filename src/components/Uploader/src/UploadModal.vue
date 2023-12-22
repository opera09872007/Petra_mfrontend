<template>
  <BasicModal
    width="800px"
    :title="t('component.upload.upload')"
    :okText="t('component.upload.save')"
    v-bind="$attrs"
    @register="register"
    @ok="handleOk"
    :closeFunc="handleCloseFunc"
    :maskClosable="false"
    :keyboard="false"
    class="upload-modal"
    :okButtonProps="getOkButtonProps"
    :cancelButtonProps="{ disabled: isUploadingRef }"
    :loading="loading"
    :confirmLoading="loading"
  >
    <template #centerFooter>
      <a-button
        @click="handleStartUpload"
        color="success"
        :disabled="!getIsSelectFile"
        :loading="isUploadingRef"
      >
        {{ getUploadBtnText }}
      </a-button>
    </template>

    <div class="upload-modal-toolbar">
      <Alert :message="getHelpText" type="info" banner class="upload-modal-toolbar__text" />

      <Upload
        :accept="getStringAccept"
        :multiple="multiple"
        :before-upload="beforeUpload"
        :show-upload-list="false"
        :openFileDialogOnClick="!isUploadingRef"
        class="upload-modal-toolbar__btn"
      >
        <a-button type="primary">
          {{ t('component.upload.choose') }}
        </a-button>
      </Upload>
      <a-button type="error" @click="deleteAll()">
        {{ '删除未上传' }}
      </a-button>
    </div>
    <a-tag color="blue">上传列表文件数量：{{ fileNum }}</a-tag>
    <a-tag color="green">上传成功文件数量：{{ uploadedNum }}</a-tag>
    <a-tag color="red">上传错误文件数量：{{ errNum }}</a-tag>
    <FileList :dataSource="fileListRef" :columns="columns" :actionColumn="actionColumn" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, toRefs, unref, computed, PropType } from 'vue';
  import { Upload, Alert, Tag } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  //   import { BasicTable, useTable } from '/@/components/Table';
  // hooks
  import { useUploadType } from './useUpload';
  import { useMessage } from '/@/hooks/web/useMessage';
  //   types
  import { FileItem, UploadResultStatus } from './typing';
  import { basicProps } from './props';
  import { createTableColumns, createActionColumn } from './data';
  // utils

  import { buildUUID } from '/@/utils/uuid';

  import FileList from './FileList.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import AWS from 'aws-sdk';

  export default defineComponent({
    components: { BasicModal, Upload, Alert, FileList, [Tag.name]: Tag },
    props: {
      ...basicProps,
      previewFileList: {
        type: Array as PropType<string[]>,
        default: () => [],
      },
      pathName: {
        type: String as PropType<string>,
        default: '',
      },
      bucketName: {
        type: String as PropType<string>,
        default: '',
      },
      accessKey: {
        type: String as PropType<string>,
        default: '',
      },
      secretKey: {
        type: String as PropType<string>,
        default: '',
      },
      endPoint: {
        type: String as PropType<string>,
        default: '',
      },
      regStr: {
        type: String as PropType<string>,
        default: '',
      },
    },
    emits: ['change', 'register', 'delete'],
    setup(props, { emit }) {
      // const minioClient2 = createMinioClient({
      //   endPoint: props.endPoint,
      //   port: 9000,
      //   useSSL: false,
      //   accessKey: props.accessKey,
      //   secretKey: props.secretKey,
      // });

      // minioClient2.listBuckets().then((res) => {
      //   console.log(res);
      // });
      // minioClient2.bucketExists(props.bucketName, function (err, exists) {
      //   if (err) {
      //     console.log(err);
      //   }
      //   if (!exists) {
      //     createMessage.error('存储服务器连接失败（桶不存在）');
      //   } else {
      //   }
      // });
      // const minioClientest = new AWS.S3({
      //   accessKeyId: props.accessKey,
      //   computeChecksums: true,
      //   secretAccessKey: props.secretKey,
      //   endpoint: props.endPoint,
      //   s3ForcePathStyle: true,
      //   signatureVersion: 'v4',
      //   sslEnabled: false,
      // });

      const minioClient = window.getS3Object({
        accessKeyId: props.accessKey,
        computeChecksums: true,
        secretAccessKey: props.secretKey,
        endpoint: props.endPoint,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
        sslEnabled: false,
      });
      // minioClient.config.update({
      //   accessKeyId: props.accessKey,
      //   computeChecksums: true,
      //   secretAccessKey: props.secretKey,
      //   endpoint: props.endPoint,
      //   s3ForcePathStyle: true,
      //   signatureVersion: 'v4',
      //   sslEnabled: false,
      // });
      // var params = {
      //   Bucket: props.bucketName,
      // };
      // minioClient.headBucket(
      //   params,
      //   function (err, data) {
      //     if (err) console.log(err, err.stack); // an error occurred
      //     else console.log(data); // successful response
      //   },
      // );
      const state = reactive<{ fileList: FileItem[] }>({
        fileList: [],
      });

      //   是否正在上传
      const isUploadingRef = ref(false);
      const isClickSaveButton = ref(true);
      const fileListRef = ref<FileItem[]>([]);
      const fileNum = ref(fileListRef.value.length);
      const uploadedNum = ref(0);
      const errNum = ref(0);

      const { accept, helpText, maxNumber, maxSize, minSize } = toRefs(props);

      const { t } = useI18n();
      const [register, { closeModal }] = useModalInner();

      const { getStringAccept, getHelpText } = useUploadType({
        acceptRef: accept,
        helpTextRef: helpText,
        maxNumberRef: maxNumber,
        maxSizeRef: maxSize,
        minSizeRef: minSize,
      });

      const { createMessage } = useMessage();

      const getIsSelectFile = computed(() => {
        return (
          fileListRef.value.length > 0 &&
          !fileListRef.value.every((item) => item.status === UploadResultStatus.SUCCESS)
        );
      });

      const getOkButtonProps = computed(() => {
        const someSuccess = fileListRef.value.some(
          (item) => item.status === UploadResultStatus.SUCCESS,
        );
        return {
          disabled: isUploadingRef.value || fileListRef.value.length === 0 || !someSuccess,
        };
      });

      const getUploadBtnText = computed(() => {
        const someError = fileListRef.value.some(
          (item) => item.status === UploadResultStatus.ERROR,
        );
        return isUploadingRef.value
          ? t('component.upload.uploading')
          : someError
          ? t('component.upload.reUploadFailed')
          : t('component.upload.startUpload');
      });

      // 上传前校验
      function beforeUpload(file: File) {
        try {
          const { size, name } = file;
          const { maxSize, minSize } = props;
          // 设置最大值，则判断
          if (maxSize && file.size / 1024 / 1024 >= maxSize) {
            createMessage.error(t('component.upload.maxSizeMultiple', [maxSize]));
            return false;
          }

          if (minSize && file.size / 1024 / 1024 <= minSize) {
            createMessage.error(t('component.upload.minSizeMultiple', [minSize]));
            return false;
          }

          if (!name.replace(/\.[^/.]+$/, '').match(eval(props.regStr))) {
            createMessage.error(t('component.upload.regError', [name]));
            return false;
          }
          let chunkSize = 5 * 1024 * 1024;
          if (file.size > 2000 * 1024 * 1024) {
            chunkSize = 1024 * 1024 * 15;
          } else if (file.size > 1000 * 1024 * 1024) {
            chunkSize = 1024 * 1024 * 10;
          } else if (file.size > 500 * 1024 * 1024) {
            chunkSize = 1024 * 1024 * 8;
          } else {
            chunkSize = 5 * 1024 * 1024;
          }
          const fileChunkList = [];
          let count = 0;
          while (count < file.size) {
            fileChunkList.push({
              file: file.slice(count, count + chunkSize),
            });
            count += chunkSize;
          }
          var chunkList = fileChunkList.map(({ file }, index) => ({
            index,
            source: file,
            size: file.size,
          }));

          const commonItem = {
            uuid: buildUUID(),
            file,
            size,
            name,
            percent: 0,
            pause: false,
            // type: name.split('.').pop(),
            type: file.type,
            chunkList: chunkList,
          };

          fileListRef.value = [...unref(fileListRef), commonItem];
          fileNum.value = fileListRef.value.length;
          return false;
        } catch (e) {
          return false;
        }
      }

      // 删除
      async function handleRemove(record: FileItem) {
        if (record.Bucket != undefined && record.Key != undefined) {
          if (record.status == UploadResultStatus.UPLOADING) {
            createMessage.warning(t('component.upload.uploadWait'));
            return;
          }
          if (record.status == UploadResultStatus.SUCCESS) {
            uploadedNum.value--;
          }
          if (record.status == UploadResultStatus.ERROR) {
            errNum.value--;
          }
          var deleteParams = {
            Bucket: record.Bucket,
            Key: record.Key,
          };
          await minioClient.deleteObject(deleteParams, function (error) {
            if (error) {
              createMessage.warning(t('component.upload.delError') + error);
              return;
            } else {
              const index = fileListRef.value.findIndex((item) => item.uuid === record.uuid);
              index !== -1 && fileListRef.value.splice(index, 1);

              fileNum.value = fileListRef.value.length;
              emit('delete', record);
              return;
            }
          });
        } else {
          if (record.status == UploadResultStatus.UPLOADING) {
            createMessage.warning(t('component.upload.uploadWait'));
            return;
          }
          const index = fileListRef.value.findIndex((item) => item.uuid === record.uuid);
          index !== -1 && fileListRef.value.splice(index, 1);
          fileNum.value = fileListRef.value.length;
          emit('delete', record);
        }
      }
      function distinct(a, b) {
        return a.concat(b).filter((v) => !a.includes(v) || !b.includes(v));
      }

      // 重试
      async function handleRetry(record: FileItem) {
        var params = {
          Bucket: props.bucketName,
          Key: props.pathName + record.file.name,
          UploadId: record.UploadId,
        };
        let multipartCreateResult = await minioClient.listParts(params).promise();
        multipartCreateResult.Parts?.map(() => {});
        let arr = Array.from(record.chunkList, (data) => {
          return data.index;
        });
        let arr2 = Array.from(multipartCreateResult.Parts, (data) => {
          return data.PartNumber;
        });
        let arr3 = distinct(arr, arr2);

        var arr4: { index: number; source: File; size: number }[] = [];

        record.chunkList?.forEach((data) => {
          if (arr3.includes(data.index)) {
            arr4.push({
              index: data.index,
              source: data.source,
              size: data.size,
            });
          }
        });
        record.remainingChunkList = arr4;
        uploadApiByItem3([record], -1);
      }

      // async function uploadApiByItem(item: FileItem) {
      //   try {
      //     // item.status = UploadResultStatus.UPLOADING;
      //     // minioClient2.presignedPutObject(
      //     //   props.bucketName,
      //     //   props.pathName + item.name,
      //     //   24 * 60 * 60,
      //     //   function (err, presignedUrl) {
      //     //     if (err) {
      //     //       console.log(err);
      //     //       item.status = UploadResultStatus.ERROR;
      //     //       isUploadingRef.value = false;
      //     //       return {
      //     //         success: false,
      //     //         error: err,
      //     //       };
      //     //     } else {
      //     //       let reader = new FileReader();
      //     //       reader.readAsDataURL(item.file);
      //     //       var blob = dataURItoBlob(reader);
      //     //       readBlob(blob, 'ArrayBuffer').then((res) => {
      //     //         console.log(res);
      //     //       });
      //     //       console.log(item.file);
      //     //       minioClient2.putObject(
      //     //         props.bucketName,
      //     //         props.pathName + item.name,
      //     //         reader.result,
      //     //         item.size,
      //     //         function (err, etag) {
      //     //           return console.log(err, etag); // err should be null
      //     //         },
      //     //       );
      //     //       // var formData = new FormData();
      //     //       // formData.append('file', item.file);
      //     //       // let http = new XMLHttpRequest();
      //     //       // http.upload.addEventListener('progress', function (e) {
      //     //       //   var progressRate = Math.round((e.loaded / e.total) * 100) + '%';
      //     //       //   console.log('fileName:', presignedUrl, 'uploaded:', progressRate);
      //     //       // });
      //     //       // http.onload = () => {
      //     //       //   if ((http.status === 200 && http.status < 300) || http.status === 304) {
      //     //       //     try {
      //     //       //       const result = http.responseURL;
      //     //       //       console.log(result);
      //     //       //     } catch (error) {}
      //     //       //   }
      //     //       // };
      //     //       // http.open('PUT', presignedUrl, true);
      //     //       // //加入头信息
      //     //       // // Object.keys(customHeader).forEach((key, index) => {
      //     //       // //   http.setRequestHeader(key, customHeader[key]);
      //     //       // // });
      //     //       // http.send(item.file);
      //     //     }
      //     //   },
      //     // );
      //     // var params = {
      //     //   Bucket: props.bucketName,
      //     //   Key: props.pathName + item.name,
      //     //   Body: item.file,
      //     // };
      //     // var upload = await minioClient.upload(params, {}).on('httpUploadProgress', function (e) {
      //     //   var percent = ((parseInt(e.loaded, 10) / parseInt(e.total, 10)) * 100) | 0;
      //     //   isUploadingRef.value = true;
      //     //   // data.onProgress({ percent: percent });
      //     //   item.percent = percent;
      //     // });
      //     // await upload.send(function (err, data2) {
      //     //   if (err) {
      //     //     console.log(err);
      //     //     item.status = UploadResultStatus.ERROR;
      //     //     isUploadingRef.value = false;
      //     //     return {
      //     //       success: false,
      //     //       error: err,
      //     //     };
      //     //   } else {
      //     //     isUploadingRef.value = false;
      //     //     // data.onSuccess(data2, item.file);
      //     //     item.status = UploadResultStatus.SUCCESS;
      //     //     item.responseData = {
      //     //       message: 'success',
      //     //       code: 200,
      //     //       url: data2.Location,
      //     //       Bucket: data2.Bucket,
      //     //       Key: data2.Key,
      //     //     };
      //     //     item.Bucket = data2.Bucket;
      //     //     item.Key = data2.Key;
      //     //     return {
      //     //       success: true,
      //     //       error: null,
      //     //     };
      //     //   }
      //     // });
      //     var params = {
      //       Bucket: props.bucketName,
      //       Key: props.pathName + item.name,
      //     };
      //     let multipartCreateResult = await minioClient.createMultipartUpload(params).promise();
      //     item.UploadId = multipartCreateResult.UploadId;
      //     item.status = UploadResultStatus.UPLOADING;
      //     var uploadPartResults = [];
      //     let num = 0;
      //     let size = 0;

      //     item.chunkList.forEach((chunk, index) => {
      //       Promise.all([
      //         minioClient
      //           .uploadPart({
      //             Body: chunk.source,
      //             Bucket: props.bucketName,
      //             Key: multipartCreateResult.Key,
      //             PartNumber: chunk.index,
      //             UploadId: multipartCreateResult.UploadId,
      //           })
      //           .promise()
      //           .then((data, err) => {
      //             if (err) console.log(err);
      //             else {
      //               size += chunk.size;
      //               var percent = ((parseInt(size) / parseInt(item.size)) * 100) | 0;
      //               isUploadingRef.value = true;
      //               // data.onProgress({ percent: percent });
      //               item.percent = percent;
      //               num++;
      //               uploadPartResults.push({
      //                 PartNumber: chunk.index,
      //                 ETag: data.ETag,
      //               });
      //             }
      //           }),
      //       ])
      //         .then(() => {
      //           if (num === item.chunkList.length) {
      //             const array = new Array(uploadPartResults.length - 1).fill('');
      //             uploadPartResults.map((data) => {
      //               array[data.PartNumber] = data.ETag;
      //             });
      //             uploadPartResults = [];
      //             array.map((data, index) => {
      //               uploadPartResults.push({
      //                 PartNumber: index,
      //                 ETag: data,
      //               });
      //             });
      //             var params = {
      //               Bucket: props.bucketName,
      //               Key: multipartCreateResult.Key,
      //               UploadId: multipartCreateResult.UploadId,
      //               MultipartUpload: {
      //                 Parts: uploadPartResults,
      //               },
      //             };
      //             minioClient.completeMultipartUpload(params, function (err, data) {
      //               if (err) {
      //                 return {
      //                   success: false,
      //                   error: err,
      //                 };
      //               } else {
      //                 isUploadingRef.value = false;
      //                 // data.onSuccess(data2, item.file);
      //                 item.status = UploadResultStatus.SUCCESS;
      //                 item.responseData = {
      //                   message: 'success',
      //                   code: 200,
      //                   url: data.Location,
      //                   Bucket: data.Bucket,
      //                   Key: data.Key,
      //                 };
      //                 item.Bucket = data.Bucket;
      //                 item.Key = data.Key;
      //                 return {
      //                   success: true,
      //                   error: null,
      //                 };
      //               }
      //             });
      //           }
      //         })
      //         .catch(() => {
      //           //错误操作
      //         });
      //     });

      //     // minioClient.createPresignedPost({ Bucket: props.bucketName }, function (err, data) {
      //     //   if (err) console.log(err, err.stack); // an error occurred
      //     //   else {
      //     //     console.log(111);

      //     //     console.log(data);
      //     //   } // successful response
      //     // });
      //     // minioClient.createMultipartUpload(params, function (err, data) {
      //     //   if (err) console.log(err, err.stack); // an error occurred
      //     //   else console.log(data); // successful response
      //     // });
      //   } catch (e) {
      //     item.status = UploadResultStatus.ERROR;
      //     return {
      //       success: false,
      //       error: e,
      //     };
      //   }
      // }
      // async function uploadApiByItem2(uploadFileList: FileItem[], count: number) {
      //   if (count > uploadFileList.length) return;
      //   let loop_num = count;
      //   var item = uploadFileList[loop_num];
      //   try {
      //     for (let index = 1; index < 5; index++) {
      //       if (uploadFileList.length - loop_num > index) {
      //         uploadApiByItem(uploadFileList[loop_num + index]);
      //       }
      //     }
      //     loop_num += 5;
      //     var params = {
      //       Bucket: props.bucketName,
      //       Key: props.pathName + item.name,
      //     };
      //     let multipartCreateResult = await minioClient.createMultipartUpload(params).promise();
      //     item.UploadId = multipartCreateResult.UploadId;
      //     item.status = UploadResultStatus.UPLOADING;
      //     var uploadPartResults = [];
      //     let num = 0;
      //     let size = 0;

      //     item.chunkList.forEach((chunk) => {
      //       Promise.all([
      //         minioClient
      //           .uploadPart({
      //             Body: chunk.source,
      //             Bucket: props.bucketName,
      //             Key: multipartCreateResult.Key,
      //             PartNumber: chunk.index,
      //             UploadId: multipartCreateResult.UploadId,
      //           })
      //           .promise()
      //           .then((data, err) => {
      //             if (err) console.log(err);
      //             else {
      //               size += chunk.size;
      //               var percent = ((parseInt(size) / parseInt(item.size)) * 100) | 0;
      //               isUploadingRef.value = true;
      //               // data.onProgress({ percent: percent });
      //               item.percent = percent;
      //               num++;
      //               uploadPartResults.push({
      //                 PartNumber: chunk.index,
      //                 ETag: data.ETag,
      //               });
      //             }
      //           }),
      //       ])
      //         .then(() => {
      //           if (num === item.chunkList.length) {
      //             const array = new Array(uploadPartResults.length - 1).fill('');
      //             uploadPartResults.map((data) => {
      //               array[data.PartNumber] = data.ETag;
      //             });
      //             uploadPartResults = [];
      //             array.map((data, index) => {
      //               uploadPartResults.push({
      //                 PartNumber: index,
      //                 ETag: data,
      //               });
      //             });
      //             var params = {
      //               Bucket: props.bucketName,
      //               Key: multipartCreateResult.Key,
      //               UploadId: multipartCreateResult.UploadId,
      //               MultipartUpload: {
      //                 Parts: uploadPartResults,
      //               },
      //             };
      //             minioClient.completeMultipartUpload(params, function (err, data) {
      //               if (err) {
      //                 return {
      //                   success: false,
      //                   error: err,
      //                 };
      //               } else {
      //                 isUploadingRef.value = false;
      //                 // data.onSuccess(data2, item.file);
      //                 item.status = UploadResultStatus.SUCCESS;
      //                 item.responseData = {
      //                   message: 'success',
      //                   code: 200,
      //                   url: data.Location,
      //                   Bucket: data.Bucket,
      //                   Key: data.Key,
      //                 };
      //                 item.Bucket = data.Bucket;
      //                 item.Key = data.Key;
      //                 uploadApiByItem2(uploadFileList, loop_num);
      //                 return {
      //                   success: true,
      //                   error: null,
      //                 };
      //               }
      //             });
      //           }
      //         })
      //         .catch(() => {
      //           //错误操作
      //         });
      //     });

      //     // minioClient.createPresignedPost({ Bucket: props.bucketName }, function (err, data) {
      //     //   if (err) console.log(err, err.stack); // an error occurred
      //     //   else {
      //     //     console.log(111);

      //     //     console.log(data);
      //     //   } // successful response
      //     // });
      //     // minioClient.createMultipartUpload(params, function (err, data) {
      //     //   if (err) console.log(err, err.stack); // an error occurred
      //     //   else console.log(data); // successful response
      //     // });
      //   } catch (e) {
      //     item.status = UploadResultStatus.ERROR;
      //     return {
      //       success: false,
      //       error: e,
      //     };
      //   }
      // }
      async function uploadApiByItem3(uploadFileList: FileItem[], count: number) {
        if (count >= uploadFileList.length) return;

        var item;
        let loop_num;
        let simult_num = 3;
        let connect_num = 2;
        if (count != -1) {
          loop_num = count;
          item = uploadFileList[loop_num];
          for (let index = 1; index < simult_num; index++) {
            if (uploadFileList.length - loop_num > index) {
              uploadApiByItem3([uploadFileList[loop_num + index]], -1);
            }
          }
          loop_num += simult_num;
        } else {
          item = uploadFileList[0];
        }
        if (item.status == UploadResultStatus.SUCCESS || item.status == UploadResultStatus.ERROR) {
          if (count % simult_num == 0) {
            uploadApiByItem3(uploadFileList, loop_num);
          }
          return;
        }
        // if (count != -1) uploadApiByItem3(uploadFileList, loop_num);
        var Key;
        var UploadId;
        let uploaded_arr = [];
        let length;
        let size;

        if (item.Key == undefined && item.UploadId == undefined) {
          let multipartCreateResult = await minioClient
            .createMultipartUpload({
              Bucket: props.bucketName,
              Key: props.pathName + item.name,
              ContentType: item.type,
            })
            .promise()
            .catch((err) => {
              console.log(err);
            });

          item.UploadId = multipartCreateResult.UploadId;
          item.Key = multipartCreateResult.Key;
          UploadId = multipartCreateResult.UploadId;
          Key = multipartCreateResult.Key;
          uploaded_arr = item.chunkList.map((item) => {
            return item;
          });
          length = item.chunkList.length;
          size = 0;
        } else {
          Key = item.Key;
          UploadId = item.UploadId;
          uploaded_arr = item.remainingChunkList.map((item) => {
            return item;
          });
          length = item.remainingChunkList.length;

          size = item.chunkList[0].size * (item.chunkList.length - item.remainingChunkList.length);
        }
        item.status = UploadResultStatus.UPLOADING;

        if (item.UploadId != undefined) {
          const fn = (chunk) =>
            new Promise((resolve, reject) =>
              minioClient.uploadPart(
                {
                  Body: chunk.source,
                  Bucket: props.bucketName,
                  Key: Key,
                  PartNumber: chunk.index,
                  UploadId: UploadId,
                },
                (err, res) => {
                  if (err) {
                    reject(err);
                    console.log(err);
                    item.status = UploadResultStatus.ERROR;
                    errNum.value++;
                  } else {
                    resolve([res, chunk]);
                  }
                },
              ),
            );

          let num = 0;
          var uploadPartResults: { PartNumber: number; ETag: string }[] = [];
          for await (const res of asyncPool(connect_num, uploaded_arr, fn)) {
            num++;
            if ('ETag' in res[0]) {
              size += res[1].size;
              var percent = ((parseInt(size) / parseInt(item.size)) * 100) | 0;
              isUploadingRef.value = true;
              // data.onProgress({ percent: percent });
              item.percent = percent;
              uploadPartResults.push({
                PartNumber: res[1].index,
                ETag: res[0].ETag,
              });
            } else {
              item.status = UploadResultStatus.ERROR;
            }
            if (num == length) {
              if (item.status == UploadResultStatus.UPLOADING) {
                const array = new Array(uploadPartResults.length - 1).fill('');
                uploadPartResults.map((data) => {
                  array[data.PartNumber] = data.ETag;
                });
                uploadPartResults = [];
                array.map((data, index) => {
                  uploadPartResults.push({
                    PartNumber: index,
                    ETag: data,
                  });
                });
                minioClient.completeMultipartUpload(
                  {
                    Bucket: props.bucketName,
                    Key: Key,
                    UploadId: UploadId,
                    MultipartUpload: {
                      Parts: uploadPartResults,
                    },
                  },
                  function (err, data) {
                    if (err) {
                      return {
                        success: false,
                        error: err,
                      };
                    } else {
                      uploadedNum.value++;
                      if (fileNum.value == uploadedNum.value + errNum.value) {
                        isUploadingRef.value = false;
                      }
                      // data.onSuccess(data2, item.file);
                      item.status = UploadResultStatus.SUCCESS;
                      item.responseData = {
                        message: 'success',
                        code: 200,
                        url: data.Location,
                        Bucket: data.Bucket,
                        Key: data.Key,
                      };
                      item.Bucket = data.Bucket;
                      item.Key = data.Key;

                      if (count != -1) uploadApiByItem3(uploadFileList, loop_num);
                      return {
                        success: true,
                        error: null,
                      };
                    }
                  },
                );
              } else {
                return {
                  success: false,
                  error: null,
                };
              }
            }
          }
        } else {
          item.status = UploadResultStatus.ERROR;
        }
      }
      // 点击开始上传
      async function handleStartUpload() {
        const { maxNumber } = props;
        if (fileListRef.value.length > maxNumber) {
          return createMessage.warning(t('component.upload.maxNumber', [maxNumber]));
        }
        try {
          isClickSaveButton.value = false;
          isUploadingRef.value = true;
          // 只上传不是成功状态的
          // const uploadFileList =
          //   fileListRef.value.filter((item) => item.status !== UploadResultStatus.SUCCESS) || [];

          // uploadApiByItem2(uploadFileList, 0);

          uploadApiByItem3(fileListRef.value, 0);
          // const data = await Promise.all(
          //   uploadFileList.map((item) => {
          //     return uploadApiByItem(item);
          //   }),
          // ).then((values) => {
          //   console.log(111);
          // });
        } catch (e) {
          isUploadingRef.value = false;
          throw e;
        }
      }

      //   点击保存
      function handleOk() {
        const { maxNumber } = props;

        if (fileListRef.value.length > maxNumber) {
          return createMessage.warning(t('component.upload.maxNumber', [maxNumber]));
        }
        if (isUploadingRef.value) {
          return createMessage.warning(t('component.upload.saveWarn'));
        }

        const fileList: string[] = [];

        for (const item of fileListRef.value) {
          const { status, responseData } = item;
          if (status === UploadResultStatus.SUCCESS && responseData) {
            fileList.push(responseData);
          }
        }
        // 没有全部上传成功
        if (fileList.length != fileListRef.value.length) {
          return createMessage.warning(t('component.upload.saveError2'));
        }
        // fileListRef.value = [];
        // closeModal();
        isClickSaveButton.value = true;
        emit('change', fileList);
      }
      async function* asyncPool(concurrency, iterable, iteratorFn) {
        const executing = new Set();
        async function consume() {
          const [promise, value] = await Promise.race(executing);
          executing.delete(promise);
          return value;
        }
        for (const item of iterable) {
          // Wrap iteratorFn() in an async fn to ensure we get a promise.
          // Then expose such promise, so it's possible to later reference and
          // remove it from the executing pool.

          const promise = (async () => await iteratorFn(item, iterable))().then(
            (value) => [promise, value], // 将返回值包装成 [自身引用, 结果]
          );
          executing.add(promise);
          if (executing.size >= concurrency) {
            yield await consume();
          }
        }
        while (executing.size) {
          yield await consume();
        }
      }
      // 点击关闭：则所有操作不保存，包括上传的
      async function handleCloseFunc() {
        if (isUploadingRef.value) {
          createMessage.warning(t('component.upload.uploadWait'));
          return false;
        } else if (!isClickSaveButton.value) {
          if (fileListRef.value.length <= 0) {
            return true;
          }
          createMessage.warning('上传信息还未保存，请先保存');
          return false;
        } else {
          fileListRef.value = [];
          fileNum.value = 0;
          uploadedNum.value = 0;
          errNum.value = 0;
          return true;
        }
        // if (!isUploadingRef.value) {
        //   let length = 0;
        //   fileListRef.value.map(async (item, index) => {
        //     if (item.status == UploadResultStatus.SUCCESS) {
        //       length++;
        //     }
        //   });
        //   // fileListRef.value = [];
        //   var arr: number[] = [];
        //   let count = 0;
        //   // let promises = fileListRef.value.map(async (item) => {
        //   //   return minioClient
        //   //     .deleteObject({
        //   //       Bucket: item.Bucket,
        //   //       Key: item.Key,
        //   //     })
        //   //     .promise()
        //   //     .then(function (data) {
        //   //       console.log('Uploadedd1234');
        //   //     });
        //   // });

        //   // Promise.all(promises)
        //   //   .then(function (data) {
        //   //     console.log('Uploadedd');
        //   //   })
        //   //   .catch(function (err) {
        //   //     console.log(55555);
        //   //     console.log(err);
        //   //   });

        //   fileListRef.value.map(async (item, index) => {
        //     if (item.status == UploadResultStatus.SUCCESS) {
        //       await minioClient
        //         .deleteObject({
        //           Bucket: item.Bucket,
        //           Key: item.Key,
        //         })
        //         .promise()
        //         .then(function (data) {
        //           count++;
        //           arr.push(index);
        //           if (count == length) {
        //             fileListRef.value = [];
        //           }
        //         })
        //         .catch((err) => {
        //           arr.sort((a, b) => {
        //             return b - a;
        //           });
        //           arr.map((data, index) => {
        //             fileListRef.value.splice(data, 1);
        //           });
        //           createMessage.warning(t('component.upload.delError'));
        //           return false;
        //         });
        //     }
        //   });
        //   // const fn = (item) => {
        //   //   new Promise((resolve, react) => {
        //   //     minioClient.deleteObject({ Bucket: item.Bucket, Key: item.Key }, () => {
        //   //       resolve(item);
        //   //     });
        //   //   });
        //   // };
        //   // let uploaded_arr = fileListRef.value.map((item) => {
        //   //   if (item.status == UploadResultStatus.SUCCESS) {
        //   //     return item;
        //   //   }
        //   // });
        //   // for await (const item of asyncPool(4, uploaded_arr, fn)) {
        //   //   console.log(item);
        //   // }
        //   if (fileListRef.value.length <= 0) {
        //     return true;
        //   }
        // } else {
        //   createMessage.warning(t('component.upload.uploadWait'));
        //   return false;
        // }
      }
      function deleteAll() {
        let arr: number[] = [];
        fileListRef.value.map((item, index) => {
          if (item.status == undefined) {
            arr.push(index);
          }
        });
        arr.sort((a, b) => {
          return b - a;
        });
        arr.map((data) => {
          fileListRef.value.splice(data, 1);
        });
        fileNum.value = fileListRef.value.length;
        // const index = fileListRef.value.findIndex((item) => item.uuid === record.uuid);
        // index !== -1 && fileListRef.value.splice(index, 1);
        // emit('delete', record);
      }

      return {
        columns: createTableColumns() as any[],
        actionColumn: createActionColumn(handleRemove, handleRetry) as any,
        register,
        closeModal,
        getHelpText,
        getStringAccept,
        getOkButtonProps,
        beforeUpload,
        // registerTable,
        fileListRef,
        state,
        isUploadingRef,
        handleStartUpload,
        handleOk,
        handleCloseFunc,
        getIsSelectFile,
        getUploadBtnText,
        deleteAll,
        t,
        fileNum,
        uploadedNum,
        errNum,
      };
    },
    data: function () {
      return {
        loading: false,
      };
    },
    methods: {
      setLoading(status) {
        this.loading = status;
      },
    },
  });
</script>
<style lang="less">
  .upload-modal {
    .ant-upload-list {
      display: none;
    }

    .ant-table-wrapper .ant-spin-nested-loading {
      padding: 0;
    }

    &-toolbar {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &__btn {
        margin-left: 8px;
        text-align: right;
        flex: 1;
      }
    }
  }
</style>
