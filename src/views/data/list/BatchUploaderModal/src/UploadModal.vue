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
    :cancelButtonProps="{ disabled: isDisabled() }"
    :loading="loading"
    :confirmLoading="loading"
  >
    <template #centerFooter>
      <a-button
        @click="handleStartUpload"
        color="success"
        :disabled="!getIsSelectFile"
        :loading="isDisabled()"
      >
        {{ getUploadBtnText }}
      </a-button>
    </template>

    <div id="doc_panle" v-show="false" style="height: 333px; width: 100%; overflow: auto"> </div>
    <a-select
      v-model:value="task_type"
      :options="taskOptions"
      :fieldNames="{ label: 'name', value: 'id' }"
    />
    <a-button @click="selectFile" type="dashed" style="margin-bottom: 10px"
      >选择需要解析的Excel文件</a-button
    >
    <input type="file" ref="fileInput" style="display: none" @change="handleGetExcel" />
    <div class="upload-modal-toolbar">
      <Alert :message="getHelpText" type="info" banner class="upload-modal-toolbar__text" />

      <Upload
        :accept="getStringAccept"
        :multiple="multiple"
        :before-upload="beforeUpload"
        :show-upload-list="false"
        :openFileDialogOnClick="!isDisabled()"
        :directory="true"
        class="upload-modal-toolbar__btn"
      >
        <a-button type="primary"> 选择文件夹 </a-button>
      </Upload>
    </div>
    <a-progress
      :stroke-color="{
        '0%': '#108ee9',
        '100%': '#87d068',
      }"
      :percent="progressPercent"
      style="margin-bottom: 10px"
    />
    <a-tag color="blue">上传列表文件数量：{{ fileNum }}</a-tag>
    <a-tag color="green">上传成功文件数量：{{ uploadedNum }}</a-tag>
    <a-tag color="red" style="margin-bottom: 10px"> 上传错误文件数量：{{ errNum }}</a-tag>
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
  import * as XLSX from 'xlsx';
  import { buildUUID } from '/@/utils/uuid';
  import { cloneDeep } from 'lodash-es';
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
  import { infoBatchUploadApi } from '/@/api/data/info';
  import { renderAsync } from 'docx-preview';
  import { getTaskTypeList } from '/@/api/data/workTaskType';
  import { useUserStore } from '/@/store/modules/user';
  import { Select } from 'ant-design-vue';
  export default defineComponent({
    components: { BasicModal, Upload, Alert, FileList, [Tag.name]: Tag, [Select.name]: Select },
    props: {
      ...basicProps,
      previewFileList: {
        type: Array as PropType<string[]>,
        default: () => [],
      },
      endPoint: {
        type: String as PropType<string>,
        default: '',
      },
      repId: {
        type: Number as PropType<number>,
        default: -1,
      },
      bucketName: {
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
      const isUploadingRef = ref(0);
      const isClickSaveButton = ref(true);
      const fileListRef = ref<FileItem[]>([]);
      const fileListRefCopy = ref<FileItem[]>([]);
      const fileListIndexAndcode = new Map<string, number>();
      const fileNameAndcode = new Map<string, number>();
      const HtmlAndDocMap = new Map<string, string>();
      const fileNameSet = new Set();
      const fileNum = ref(fileListRef.value.length);
      const predictFileNum = ref(0);
      const uploadedNum = ref(0);
      const errNum = ref(0);
      const progressPercent = ref(0);
      const task_type = ref('-1');
      const taskOptions = ref<Recordable>();
      const userStore = useUserStore();
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
          progressPercent.value =
            ((parseInt(uploadedNum.value) / parseInt(fileNum.value)) * 100) | 0;
          if (uploadedNum.value + errNum.value == 0) {
            if (predictFileNum.value > fileNum.value) {
              isUploadingRef.value = 2;
            } else {
              isUploadingRef.value = 0;
            }
          }
          if (fileNum.value == uploadedNum.value + errNum.value && calErrNum == 0) {
            isUploadingRef.value = 0;
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

      const getTaskOptionsAndList = async () => {
        taskOptions.value = await getTaskTypeList(
          Number(userStore.getUserInfo.now_work_repository),
        );
        task_type.value = taskOptions.value[0].id;
        console.log(1234);
        console.log(task_type.value);
      };
      getTaskOptionsAndList();
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
          disabled: isDisabled() || fileListRef.value.length === 0 || !someSuccess,
        };
      });

      const getUploadBtnText = computed(() => {
        const someError = fileListRef.value.some(
          (item) => item.status === UploadResultStatus.ERROR,
        );
        if (someError) {
          return t('component.upload.reUploadFailed');
        }
        switch (isUploadingRef.value) {
          case 0:
            return t('component.upload.startUpload');
          case 1:
            return t('component.upload.uploading');
          case 2:
            return '正在解析';
          default:
            return '';
        }
      });
      function isImage(headerString: String) {
        const imageHeaders = [
          '89504e47', // PNG
          'ffd8ff', // JPEG
          '47494638', // GIF
          '49492a00', // TIFF (little-endian)
          '4d4d002a', // TIFF (big-endian)
          '52494646', // WEBP
        ];

        return imageHeaders.some((header) => headerString.startsWith(header));
      }
      function isWordDocument(headerString: String) {
        const wordHeaders = [
          // 'd0cf11e0', // DOC
          '504b0304', // DOCX 只允许docx
        ];

        return wordHeaders.some((header) => headerString.startsWith(header));
      }
      function isHtml(headerString: String) {
        const htmlHeaders = ['68746D6C3E', '3c6d6574'];

        return htmlHeaders.some((header) => headerString.startsWith(header));
      }
      async function getFileHeader(file: File, length: number): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = function (e) {
            if (e.target && e.target.result) {
              const header = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, length);
              const headerHex = Array.from(header)
                .map((byte) => byte.toString(16).padStart(2, '0'))
                .join('');
              resolve(headerHex);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = function () {
            reject(reader.error);
          };
          reader.readAsArrayBuffer(file.slice(0, length));
        });
      }

      async function getBucketName(file: File) {
        const header = await getFileHeader(file, 4);
        if (isImage(header)) return props.bucketName;
        if (isWordDocument(header) || isHtml(header)) return props.bucketName + '-documents';
        else {
          console.log(header);

          return false;
        }
      }
      function converDocToHtml(file: File) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = function (e) {
            if (e.target && e.target.result) {
              const header = new Uint8Array(e.target.result.slice(0, 4) as ArrayBuffer).subarray(
                0,
                4,
              );
              const headerHex = Array.from(header)
                .map((byte) => byte.toString(16).padStart(2, '0'))
                .join('');
              if (isWordDocument(headerHex)) {
                predictFileNum.value += 1;
                const blob = new Blob([e.target.result], { type: 'text/html' });
                var docxOptions = {
                  className: 'doc_panle',
                  inWrapper: false,
                  ignoreWidth: false,
                  ignoreHeight: false,
                  ignoreFonts: false,
                  breakPages: true,
                  ignoreLastRenderedPageBreak: true,
                  experimental: false,
                  trimXmlDeclaration: true,
                  useBase64URL: true,
                  useMathMLPolyfill: false,
                  renderChanges: false,
                  renderHeaders: true,
                  renderFooters: true,
                  renderFootnotes: true,
                  renderEndnotes: true,
                  debug: false,
                };
                let docRef = document.getElementById('doc_panle');
                renderAsync(blob, docRef, null, docxOptions).then(() => {
                  var docRef = document.getElementById('doc_panle');
                  const divElements = docRef.querySelectorAll('div');

                  divElements.forEach((divElement) => {
                    const spanElement = document.createElement('span');
                    spanElement.innerHTML = divElement.innerHTML;
                    divElement.parentNode.replaceChild(spanElement, divElement);
                  });

                  var html = '<meta charset="UTF-8">' + docRef?.innerHTML;
                  const blob2 = new Blob([html], { type: 'text/html' });

                  // const htmlFile = new File([blob2], html_name, { type: 'text/html' });
                  resolve(blob2);
                });
              }
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = function () {
            reject(reader.error);
          };
          reader.readAsArrayBuffer(file);
        });
      }
      // 上传前校验
      function beforeUpload(file: File) {
        try {
          isUploadingRef.value = 0;
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
          let sub_name = name.substring(0, name.lastIndexOf('-'));

          if (fileListIndexAndcode.has(sub_name)) {
            var local = fileListIndexAndcode.get(sub_name);
            if (typeof local != 'undefined') {
              if (!fileNameSet.has(file.name)) {
                fileNameSet.add(file.name);

                HtmlAndDocMap.set(file.name.substring(0, file.name.lastIndexOf('.')), file.name);
                if (fileListRef.value[local].file) {
                  let newFileItem = cloneDeep(fileListRefCopy.value[local]);
                  newFileItem.uuid = buildUUID();
                  newFileItem.file = file;
                  newFileItem.size = size;
                  newFileItem.name = name;
                  newFileItem.percent = 0;
                  newFileItem.pause = false;
                  newFileItem.chunkList = chunkList;
                  fileListRef.value.push(newFileItem);
                  fileNameAndcode.set(file.name, fileListRef.value.length - 1);
                } else {
                  fileListRef.value[local] = cloneDeep(fileListRefCopy.value[local]);
                  fileListRef.value[local].uuid = buildUUID();
                  fileListRef.value[local].file = file;
                  fileListRef.value[local].size = size;
                  fileListRef.value[local].name = name;
                  fileListRef.value[local].percent = 0;
                  fileListRef.value[local].pause = false;
                  fileListRef.value[local].chunkList = chunkList;

                  fileNameAndcode.set(file.name, local);
                }
                converDocToHtml(file)
                  .then((htmlBlob) => {
                    let html_name = name.replace(/\.[^/.]+$/, '.html');

                    let htmlFile = new File([htmlBlob], html_name, { type: 'text/html' });
                    const fileChunkList: Array<{ file: Blob }> = [];
                    let size_count = 0;
                    while (size_count < htmlFile.size) {
                      fileChunkList.push({
                        file: htmlFile.slice(size_count, size_count + chunkSize),
                      });
                      size_count += chunkSize;
                    }
                    var chunkList = fileChunkList.map(({ file }, index) => ({
                      index,
                      source: file,
                      size: file.size,
                    }));
                    let newFileItem = cloneDeep(fileListRefCopy.value[local]);
                    newFileItem.uuid = buildUUID();
                    newFileItem.file = htmlFile;
                    newFileItem.size = size;
                    newFileItem.name = html_name;
                    newFileItem.percent = 0;
                    newFileItem.pause = false;
                    newFileItem.chunkList = chunkList;
                    newFileItem.htmlBlob = htmlBlob;
                    fileListRef.value.push(newFileItem);
                    fileNameSet.add(html_name);
                    fileNum.value = fileListRef.value.length;
                  })
                  .catch((error) => {
                    console.error('Error:', error);
                  });
              }
            }
          }
          fileNum.value = fileListRef.value.length;
          predictFileNum.value = fileNum.value;
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
        let bucketName = await getBucketName(record.file);
        if (record.UploadId && record.chunkList && bucketName) {
          let multipartCreateResult: any = await listParts({
            bucketName: bucketName,
            objectName: record.pathName + record.h_name + '/' + record.file.name,
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
        await filterAndStoreChunks(record);
        try {
          uploadApiByItem3([record], 0);
        } catch (e) {
          uploadApiByItem3([record], 0);
        }
      }
      async function uploadApiByItem3(uploadFileList: FileItem[], count: number) {
        if (count >= uploadFileList.length) return;

        var item;
        let loop_num;
        let simult_num = 1;
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

        let bucketName = await getBucketName(item.file);
        if (item.Key == undefined && item.UploadId == undefined && bucketName) {
          let multipartCreateResult = await createMultipartUpload({
            bucketName: bucketName,
            objectName: item.pathName + item.h_name + '/' + item.name,
            fileType: item.file.type,
          });
          item.UploadId = multipartCreateResult;
          item.Key = item.pathName + item.h_name + '/' + item.name;

          length = item.chunkList.length;
          var PresignedUrls = await getPresignedUrls({
            bucketName: bucketName,
            objectName: item.pathName + item.h_name + '/' + item.name,
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
                  isUploadingRef.value = 0;
                }),
            );

          let num = 0;
          for await (const res of asyncPool(connect_num, uploaded_arr, fn)) {
            num++;
            if (res[0].ok) {
              size += res[1].size;
              var percent = ((parseInt(size) / parseInt(item.size)) * 100) | 0;
              isUploadingRef.value = 1;
              // data.onProgress({ percent: percent });
              item.percent = percent;
            } else {
              item.status = UploadResultStatus.ERROR;
            }
            if (num == length) {
              let bucketName = await getBucketName(item.file);
              if (item.status == UploadResultStatus.UPLOADING && bucketName) {
                await completePart({
                  bucketName: bucketName,
                  objectName: item.pathName + item.h_name + '/' + item.name,
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
                        info_id: item.info_id,
                        Bucket: bucketName,
                        Key: item.Key,
                      };
                      item.Bucket = bucketName;

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
        try {
          const { maxNumber } = props;
          if (fileListRef.value.length > maxNumber) {
            return createMessage.warning(t('component.upload.maxNumber', [maxNumber]));
          }
          for (let listIndex = 0; listIndex < fileListRef.value.length; listIndex++) {
            if (!fileListRef.value[listIndex].file) {
              return createMessage.error('文件和表中的数量未完全关联，请检查表或者文件');
            }
          }
          isClickSaveButton.value = false;
          isUploadingRef.value = 1;
          const someError = fileListRef.value.some(
            (item) => item.status === UploadResultStatus.ERROR,
          );
          // const res = await infoBatchUploadApi(fileListRefCopy.value, props.repId);
          const batchSize = 2;
          var res = [];
          for (let i = 0; i < fileListRefCopy.value.length; i += batchSize) {
            const batch = fileListRefCopy.value.slice(i, i + batchSize);
            try {
              console.log(task_type.value);

              const result = await infoBatchUploadApi(batch, props.repId, task_type.value);
              if (result.infoData) {
                res = [...res, ...result.infoData];
              } else {
                throw new Error('上传出错,位于' + i);
              }
            } catch (error) {
              throw error;
            }
          }
          if (res.length == fileListRefCopy.value.length) {
            var infoIDs = new Map<string, number>();
            var infoPathNames = new Map<string, number>();
            for (let index = 0; index < res.length; index++) {
              infoIDs.set(res[index].name, res[index].id);
              infoPathNames.set(res[index].name, res[index].pathName);
            }
            for (let index = 0; index < fileListRef.value.length; index++) {
              let info_id = infoIDs.get(fileListRef.value[index].h_name);
              if (info_id) {
                fileListRef.value[index].info_id = info_id;
              }
              let path = infoPathNames.get(fileListRef.value[index].h_name);
              if (path) {
                fileListRef.value[index].pathName = path;
              }
            }
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
          }
        } catch (error) {
          isUploadingRef.value = 0;
          createMessage.error('发生错误:' + error + '。请检查excel和文件');
          // throw e;
        }
      }

      //   点击保存
      async function handleOk() {
        const { maxNumber } = props;

        if (fileListRef.value.length > maxNumber) {
          return createMessage.warning(t('component.upload.maxNumber', [maxNumber]));
        }
        if (isDisabled()) {
          return createMessage.warning(t('component.upload.saveWarn'));
        }

        const imgFileList: string[] = [];
        const fileList: string[] = [];

        var num = 0;
        for (const item of fileListRef.value) {
          const { status, responseData, file, htmlBlob } = item;
          if (status === UploadResultStatus.SUCCESS && responseData) {
            num++;
            const header = await getFileHeader(file, 4);

            if (isImage(header)) {
              var data = cloneDeep(responseData);
              imgFileList.push(data);
            }
            if (htmlBlob) {
              var docName = HtmlAndDocMap.get(item.name.substring(0, item.name.lastIndexOf('.')));
              var index = fileNameAndcode.get(docName);
              var data = cloneDeep(fileListRef.value[index].responseData);
              data['htmlBlob'] = htmlBlob;
              fileList.push(data);
            }
          }
        }
        // 没有全部上传成功
        if (num != fileListRef.value.length) {
          return createMessage.warning(t('component.upload.saveError2'));
        }
        // fileListRef.value = [];
        // closeModal();
        isClickSaveButton.value = true;
        emit('change', imgFileList, fileList);
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
        if (isDisabled()) {
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
      function handleGetExcel(event) {
        fileListIndexAndcode.clear();
        fileNameSet.clear();
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(sheet['!ref']);

            // 计算列数和行数
            const numCols = range.e.c - range.s.c + 1;
            const numRows = range.e.r - range.s.r + 1;

            if (numCols != 20) {
              throw new Error('列数不为20');
            }
            if (numRows > 100) {
              throw new Error('列数大于100');
            }

            const excelJsonData = XLSX.utils.sheet_to_json(sheet, {
              header: [
                'self_code',
                'categories',
                'h_name',
                'alias',
                'dynasty',
                'era_name',
                'common_era',
                'language',
                'inscription',
                'main_inscription',
                'material',
                'form',
                'shape',
                'composition',
                'author',
                'inscriber',
                'font',
                'excavation_site',
                'collector',
                'content',
              ],
            });
            excelJsonData.shift();

            for (let index = 0; index < excelJsonData.length; index++) {
              const key = excelJsonData[index]['self_code'];
              if (!key) {
                throw new Error('第' + Number(index + 2) + '行(' + key + ')编码为空');
              }
              if (!excelJsonData[index]['h_name']) {
                throw new Error('第' + Number(index + 2) + '行(' + key + ')名称为空');
              }
              if (!excelJsonData[index]['categories']) {
                throw new Error('第' + Number(index + 2) + '行(' + key + ')分类为空');
              }
              if (fileListIndexAndcode.has(key)) {
                throw new Error('第' + Number(index + 2) + '行(' + key + ')重复');
              } else {
                fileListIndexAndcode.set(key, index);
              }
            }
            fileListRefCopy.value = cloneDeep(unref(excelJsonData));
            fileListRef.value = cloneDeep(unref(excelJsonData));
            fileNum.value = fileListRef.value.length;
            predictFileNum.value = 0;
          } catch (error) {
            event.target.value = '';
            createMessage.error('发生错误:' + error + '。请检查excel并重新导入');
          }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = '';
      }
      function isDisabled() {
        if (isUploadingRef.value === 0) {
          return false;
        } else return true;
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
        isDisabled,
        handleStartUpload,
        handleOk,
        handleCloseFunc,
        getIsSelectFile,
        getUploadBtnText,
        t,
        fileNum,
        uploadedNum,
        errNum,
        handleGetExcel,
        progressPercent,
        task_type,
        taskOptions,
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
      selectFile() {
        this.$refs.fileInput.click();
      },
    },
  });
</script>
<style lang="less">
  .upload-modal {
    .ant-upload-list {
      width: 100%;
      overflow-x: auto; /* 允许横向滚动 */
      white-space: nowrap; /* 禁止内容自动换行 */
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

  .ant-modal-body > .scrollbar > .scrollbar__bar.is-horizontal {
    display: block !important;
  }
</style>
