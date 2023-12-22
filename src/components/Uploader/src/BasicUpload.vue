<template>
  <div>
    <Space>
      <a-button type="primary" @click="openUploadModal" preIcon="carbon:cloud-upload">
        {{ t('component.upload.upload') }}
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

  export default defineComponent({
    name: 'BasicUpload',
    components: { UploadModal, Space },
    props: {
      ...uploadContainerProps,
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
    emits: ['change', 'delete', 'update:value'],

    setup(props, { emit, attrs }) {
      const { t } = useI18n();
      // 上传modal
      const [registerUploadModal, { openModal: openUploadModal }] = useModal();
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
      watch(
        () => props.value,
        (value = []) => {
          fileList.value = isArray(value) ? value : [];
        },
        { immediate: true },
      );

      // 上传modal保存操作
      function handleChange(urls: string[]) {
        // fileList.value = [...unref(fileList), ...(urls || [])];
        // emit('update:value', fileList.value);
        emit('change', urls);
      }

      function handleDelete(record: Recordable) {
        emit('delete', record);
      }

      return {
        registerUploadModal,
        openUploadModal,
        handleChange,
        fileList,
        bindValue,
        handleDelete,
        setModalLoading,
        modalRef,
        handleModal,
        t,
      };
    },
  });
</script>
