<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :maskClosable="false"
  >
    <BasicForm @register="registerForm" />
    <div class="ant-col">
      <div class="ant-col ant-form-item-label" style="width: 120px">
        <label class="ant-form-item-no-colon">文件上传(word)</label></div
      >
      <Upload
        name="file"
        @change="handleChange"
        :action="rtfUploadUrl"
        :before-upload="beforeUpload"
        accept=".docx"
        list-type="docx"
        :max-count="1"
        :key="componentKey"
      >
        <a-button type="primary">
          {{ t('component.upload.choose') }}
        </a-button>
      </Upload>
    </div>
    <div
      id="doc_panle"
      style="height: 333px; width: 100%; overflow: auto"
      v-html="content"
      :key="componentKey"
    >
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { Upload } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { detailFormSchema } from './list.data';
  import { detailAddApi, detailEditApi } from '/@/api/data/detail';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGlobSetting } from '/@/hooks/setting';
  import { renderAsync } from 'docx-preview';

  export default defineComponent({
    name: 'DetailModal',
    components: { BasicModal, BasicForm, Upload },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      const rowId = ref('');
      const { t } = useI18n();
      var currentId = ref(-1);
      var infoId = ref(-1);
      var detailId = ref(-1);
      var filePondKey = ref(1);
      var componentKey = ref(1);
      var content = ref('');
      const docFile = ref();
      const ProcessFile = ref();
      const IsFilePondInitial = ref(false);
      const img_path = ref();
      const img_id = ref();
      const { rtfUploadUrl } = useGlobSetting();

      const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
        labelWidth: 100,
        schemas: detailFormSchema,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 23,
        },
      });

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        filePondKey.value += 1;
        ProcessFile.value = '';
        resetFields();
        setModalProps({ confirmLoading: false });

        isUpdate.value = !!data?.isUpdate;
        currentId = data?.currentId;
        infoId = data?.infoId;
        detailId = data?.detail_id;

        document.getElementById('doc_panle').innerHTML = '';
        content.value = data?.content;
        componentKey.value += 1;

        if (unref(isUpdate)) {
          rowId.value = data.record.id;
          data.record.img_id = img_id.value;
          if (data.record.is_active == true) {
            data.record.is_active = '1';
          } else {
            data.record.is_active = '0';
          }
          if (data.record.is_null == true) {
            data.record.is_null = '1';
          } else {
            data.record.is_null = '0';
          }
          setFieldsValue({
            ...data.record,
          });
        }
      });
      function getProcessFile(file) {
        ProcessFile.value = file;
        IsFilePondInitial.value = false;
      }
      function getFileInitialStatus(status) {
        IsFilePondInitial.value = status;
      }
      const getTitle = computed(() => (!unref(isUpdate) ? '新增资源' : '编辑资源'));
      function beforeUpload() {
        return false;
      }
      function handleChange(info: Recordable) {
        const file = info.file;

        if (file && file.status != 'removed') {
          const reader = new FileReader();
          reader.onload = (event) => {
            const fileData = event.target.result;
            const blob = new Blob([fileData], { type: file.type });
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
              docFile.value = blob;
            });
          };
          reader.readAsArrayBuffer(file);
        }
        if (file && file.status == 'removed') {
          componentKey.value += 1;
          docFile.value = '';
        }
      }

      async function handleSubmit() {
        try {
          const values = await validate();

          var docRef = document.getElementById('doc_panle');
          const divElements = docRef.querySelectorAll('div');

          divElements.forEach((divElement) => {
            const spanElement = document.createElement('span');
            spanElement.innerHTML = divElement.innerHTML;
            divElement.parentNode.replaceChild(spanElement, divElement);
          });

          var html = '<meta charset="UTF-8">' + docRef?.innerHTML;

          const data = values;
          data.info = infoId;
          setModalProps({ confirmLoading: true });
          infoId.value;

          if (docFile.value) {
            data.doc_file = docFile.value;
            const html_blob = new Blob([html], { type: 'text/html' });
            data.html_file = html_blob;

            const fd = new FormData();
            Object.keys(data).forEach((key) => {
              if (data[key] instanceof Array) {
                data[key].forEach((item) => {
                  fd.append(key, item);
                });
              } else {
                fd.append(key, data[key]);
              }
            });

            if (unref(detailId) == -1) {
              !unref(isUpdate) ? await detailAddApi(fd) : await detailEditApi(unref(currentId), fd);
            } else {
              await detailEditApi(unref(currentId), fd);
            }
          } else {
            if (unref(detailId) == -1) {
              !unref(isUpdate)
                ? await detailAddApi(data)
                : await detailEditApi(unref(currentId), data);
            } else {
              await detailEditApi(unref(currentId), data);
            }
          }

          emit('success', {
            isUpdate: unref(isUpdate),
            detailId: detailId,
            values: { ...values, id: rowId.value },
          });
          closeModal();
        } catch (error: any) {
          console.log(error);
        } finally {
          setModalProps({ confirmLoading: false });
        }
        // if (
        //   (ProcessFile.value == '' || ProcessFile.value == undefined) &&
        //   IsFilePondInitial.value
        // ) {
        //   createMessage.error('请等待上传');
        // } else {
        //   try {
        //     const values = await validate();

        //     const data = values;
        //     data.info = infoId;
        //     data.serverId = ProcessFile.value.serverId;
        //     setModalProps({ confirmLoading: true });
        //     infoId.value;

        //     if (
        //       data.content == '' &&
        //       (data.serverId == '' || data.serverId == undefined || data.serverId == null)
        //     ) {
        //       createMessage.error('请选择文件或填写内容');
        //     } else {
        //       data.content = decodeURIComponent(data.content);

        //       if (unref(detailId) == -1) {
        //         !unref(isUpdate)
        //           ? await detailAddApi(data)
        //           : await detailEditApi(unref(currentId), data);
        //       } else {
        //         data.work_flow_type = 4;
        //         await detailEditApi(unref(currentId), data);
        //       }
        //       emit('success', {
        //         isUpdate: unref(isUpdate),
        //         detailId: detailId,
        //         values: { ...values, id: rowId.value },
        //       });
        //       closeModal();
        //     }
        //   } catch (error: any) {
        //     console.log(error);
        //   } finally {
        //     setModalProps({ confirmLoading: false });
        //   }
        // }
      }
      async function handleCancel() {
        if (
          ProcessFile.value.serverId != '' &&
          ProcessFile.value.serverId != undefined &&
          ProcessFile.value.serverId != null
        ) {
          //todo
          console.log('删除文件');
        }
      }
      return {
        registerModal,
        registerForm,
        getTitle,
        img_path,
        img_id,
        rowId,
        t,
        filePondKey,
        handleSubmit,
        handleCancel,
        getProcessFile,
        getFileInitialStatus,
        handleChange,
        beforeUpload,
        rtfUploadUrl,
        content,
        componentKey,
      };
    },
  });
</script>
<style scoped>
  :deep(.doc_panle-wrapper) {
    background-color: #fff;
    padding: 0;
  }

  :deep(.doc_panle-wrapper > section.docx) {
    width: 100% !important;
    padding: 0rem !important;
    min-height: auto !important;
    box-shadow: none;
    margin-bottom: 0;
  }

  :deep(.doc_panle) {
    padding: 0rem !important;
  }

  :deep(.doc_panle) img {
    display: inline !important;
  }
</style>
