<template>
  <div>
    <Space>
      <a-button type="primary" @click="openUploadModal" preIcon="carbon:cloud-upload">
        批量上传
      </a-button>
    </Space>
    <UploadModal
      v-bind="bindValue"
      @register="registerUploadModal"
      @change="handleChange"
      @delete="handleDelete"
      ref="modalRef"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, watch, computed } from 'vue';
  import { Space } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { uploadContainerProps } from './props';
  import { omit } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { isArray } from '/@/utils/is';
  import UploadModal from './UploadModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { detailBatchAddApi, detailBatchUploadHtmlFileApi } from '/@/api/data/detail';
  import { getImgTypeByInfoIdList } from '/@/api/data/info';

  export default defineComponent({
    name: 'BatchUpload',
    components: { UploadModal, Space },
    props: {
      ...uploadContainerProps,
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
    emits: ['change', 'delete', 'update:value'],

    setup(props, { emit, attrs }) {
      const { t } = useI18n();
      const { createMessage } = useMessage();
      // 上传modal
      const [registerUploadModal, { openModal, closeModal }] = useModal();
      const modalRef = ref<any>();
      const handleModal = (status) => modalRef.value.setLoading(status);
      const fileList = ref<string[]>([]);

      const bindValue = computed(() => {
        const value = { ...attrs, ...props };
        return omit(value, 'onChange');
      });
      const setModalLoading = (status) => {
        handleModal(status);
      };
      const setModalClose = () => {
        closeModal();
      };
      watch(
        () => props.value,
        (value = []) => {
          fileList.value = isArray(value) ? value : [];
        },
        { immediate: true },
      );

      // 上传modal保存操作
      // function handleChange(urls: string[]) {
      //   // fileList.value = [...unref(fileList), ...(urls || [])];
      //   // emit('update:value', fileList.value);
      //   emit('change', urls);
      // }

      async function handleChange(list: string[], fileList: string[]) {
        handleModal(true);
        try {
          var dataList = [];

          for (let index = 0; index < list.length; index++) {
            var data = {
              img_path: list[index].Key,
              info_id: list[index].info_id,
              priority: 1,
            };
            dataList.push(data);
          }
          const res = await getImgTypeByInfoIdList(Number(dataList[0].info_id));

          if (res.img_type || res.img_type == 0) {
            await detailBatchAddApi(dataList, res.img_type);
          }

          const fileListArray = new Proxy(fileList, {
            get: function (target, property, receiver) {
              return Reflect.get(target, property, receiver);
            },
          });
          const batchSize = 10;
          await uploadInBatches(fileListArray, batchSize);
          emit('change', 'success');
        } catch (error) {
          createMessage.error('上传失败，请重试或联系管理员');
          emit('change', 'error');
        }
        handleModal(false);
      }

      async function uploadInBatches(fileListArray, batchSize) {
        async function uploadBatch(batch) {
          const formData = new FormData();
          for (let file of batch) {
            formData.append(file.Key, file.htmlBlob);
          }

          const response = await detailBatchUploadHtmlFileApi(formData);

          if (response !== '1') {
            throw new Error('上传出错');
          }
        }

        for (let i = 0; i < fileListArray.length; i += batchSize) {
          const batch = fileListArray.slice(i, i + batchSize);
          try {
            await uploadBatch(batch);
          } catch (error) {
            console.error('上传失败，请重试或联系管理员 ' + i, error);
            createMessage.error('上传失败，请重试或联系管理员');
            throw new Error('上传出错');
          }
        }
      }

      function handleDelete(record: Recordable) {
        emit('delete', record);
      }

      async function openUploadModal() {
        if (props.repId == -1) {
          createMessage.error('请先选择资源库');
          return;
        } else {
          openModal();
        }
      }
      return {
        registerUploadModal,
        openUploadModal,
        handleChange,
        fileList,
        bindValue,
        handleDelete,
        setModalLoading,
        setModalClose,
        modalRef,
        handleModal,
        t,
      };
    },
  });
</script>
