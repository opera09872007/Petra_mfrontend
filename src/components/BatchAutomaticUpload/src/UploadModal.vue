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
  import { defineComponent, reactive, ref, toRefs, unref, computed, PropType, watch } from 'vue';
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
  import {
    createMultipartUpload,
    getPresignedUrls,
    completePart,
    listParts,
    deleteObjects,
  } from '/@/api/S3Upload/upload';

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

      watch(
        fileListRef,
        (newValue) => {
          let calUploadedNum = 0;
          let calErrNum = 0;
          newValue.forEach((file) => {
            if (file.status === UploadResultStatus.SUCCESS) {
              calUploadedNum++;
            }
            if (file.status === UploadResultStatus.ERROR) {
              calErrNum++;
            }
          });
          uploadedNum.value = calUploadedNum;
          errNum.value = calErrNum;
          if (fileNum.value == uploadedNum.value + errNum.value) {
            isUploadingRef.value = false;
          }
          if (calErrNum == 0) {
            isUploadingRef.value = false;
          }
        },
        { deep: true },
      );
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
          const fileChunkList: Array<{ file: Blob }> = [];
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
          // var deleteParams = {
          //   Bucket: record.Bucket,
          //   Key: record.Key,
          // };
          // await minioClient.deleteObject(deleteParams, function (error) {
          //   if (error) {
          //     createMessage.warning(t('component.upload.delError') + error);
          //     return;
          //   } else {
          //     const index = fileListRef.value.findIndex((item) => item.uuid === record.uuid);
          //     index !== -1 && fileListRef.value.splice(index, 1);

          //     fileNum.value = fileListRef.value.length;
          //     emit('delete', record);
          //     return;
          //   }
          // });
          let deleteResult: any = await deleteObjects({
            bucketName: record.Bucket,
            delete_object_list: [record.Key],
          });
          if (deleteResult == 'ok') {
            const index = fileListRef.value.findIndex((item) => item.uuid === record.uuid);
            index !== -1 && fileListRef.value.splice(index, 1);

            fileNum.value = fileListRef.value.length;
            emit('delete', record);
            return;
          } else {
            createMessage.warning(t('component.upload.delError') + deleteResult.message);
            return;
          }
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
      async function filterAndStoreChunks(record) {
        if (record.UploadId && record.chunkList) {
          let multipartCreateResult: any = await listParts({
            bucketName: props.bucketName,
            objectName: props.pathName + record.file.name,
            uploadId: record.UploadId,
            partCount: record.chunkList.length,
          });
          let arr: number[] = Array.from(
            record.chunkList,
            (data: { index: number; source: File; size: number }) => {
              return data.index;
            },
          );
          const arr2: number[] = [];
          for (const key in multipartCreateResult.Parts) {
            console.log(multipartCreateResult.Parts[key].PartNumber);
            arr2.push(multipartCreateResult.Parts[key].PartNumber);
          }
          let arr3 = distinct(arr, arr2);

          var arr4: { index: number; source: File; size: number; preUrl: string }[] = [];

          record.chunkList?.forEach((data) => {
            if (arr3.includes(data.index)) {
              arr4.push({
                index: data.index,
                source: data.source,
                size: data.size,
                preUrl: data.preUrl,
              });
            }
          });
          record.remainingChunkList = arr4;

          record.status = '';
        }
      }
      // 重试
      async function handleRetry(record: FileItem) {
        // let multipartCreateResult = await minioClient.listParts(params).promise();
        await filterAndStoreChunks(record);
        try {
          uploadApiByItem3([record], 0);
          // resendFile(record);
        } catch (e) {
          uploadApiByItem3([record], 0);
        }
      }
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
        let uploaded_arr = [];
        let length;
        let size;

        if (item.Key == undefined && item.UploadId == undefined) {
          let multipartCreateResult = await createMultipartUpload({
            bucketName: props.bucketName,
            objectName: props.pathName + item.name,
            fileType: item.file.type,
          });
          item.UploadId = multipartCreateResult;
          item.Key = props.pathName + item.name;

          length = item.chunkList.length;
          var PresignedUrls = await getPresignedUrls({
            bucketName: props.bucketName,
            objectName: props.pathName + item.name,
            partCount: length,
            uploadId: item.UploadId,
          });
          uploaded_arr = item.chunkList.map((chunk) => {
            chunk['preUrl'] = PresignedUrls[chunk.index];
            return chunk;
          });
          size = 0;
        } else {
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
              fetch(chunk.preUrl, {
                method: 'PUT',
                body: chunk.source,
              })
                .then((res) => {
                  resolve([res, chunk]);
                })
                .catch((err) => {
                  reject(err);
                  console.log(err);
                  item.status = UploadResultStatus.ERROR;
                  isUploadingRef.value = false;
                }),
            );

          let num = 0;
          for await (const res of asyncPool(connect_num, uploaded_arr, fn)) {
            num++;
            if (res[0].ok) {
              size += res[1].size;
              var percent = ((parseInt(size) / parseInt(item.size)) * 100) | 0;
              isUploadingRef.value = true;
              // data.onProgress({ percent: percent });
              item.percent = percent;
            } else {
              item.status = UploadResultStatus.ERROR;
            }
            if (num == length) {
              if (item.status == UploadResultStatus.UPLOADING) {
                await completePart({
                  bucketName: props.bucketName,
                  objectName: props.pathName + item.name,
                  uploadId: item.UploadId,
                  partCount: item.chunkList.length,
                })
                  .then((res) => {
                    if (res == 'ok') {
                      // data.onSuccess(data2, item.file);
                      item.status = UploadResultStatus.SUCCESS;
                      item.responseData = {
                        message: 'success',
                        code: 200,
                        url: item.Key,
                        Bucket: props.bucketName,
                        Key: item.Key,
                      };
                      item.Bucket = props.bucketName;

                      if (count != -1) uploadApiByItem3(uploadFileList, loop_num);
                      return {
                        success: true,
                        error: null,
                      };
                    } else {
                      return {
                        success: false,
                        error: '文件合并错误',
                      };
                    }
                  })
                  .catch((err) => {
                    return {
                      success: false,
                      error: err,
                    };
                  });
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
          const someError = fileListRef.value.some(
            (item) => item.status === UploadResultStatus.ERROR,
          );
          if (someError) {
            //todo 重写全部重新上传
            for (let index = 0; index < fileListRef.value.length; index++) {
              if (fileListRef.value[index].status === UploadResultStatus.ERROR) {
                await filterAndStoreChunks(fileListRef.value[index]);
              }
            }
            uploadApiByItem3(fileListRef.value, 0);
            console.log(fileListRef.value);
          } else {
            uploadApiByItem3(fileListRef.value, 0);
          }
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
