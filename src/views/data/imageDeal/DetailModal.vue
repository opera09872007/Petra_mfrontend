<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :maskClosable="false"
  >
    <div>
      <label>上传的文件:</label>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  import { useMessage } from '/@/hooks/web/useMessage';
  import { detailAddApi, detailEditApi } from '/@/api/data/detail';

  export default defineComponent({
    name: 'DetailModal',
    components: { BasicModal },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      const rowId = ref('');
      var currentId = ref(-1);
      var infoId = ref(-1);
      var detailId = ref(-1);
      var filePondKey = ref(1);
      const ProcessFile = ref();
      const IsFilePondInitial = ref(false);
      const img_path = ref();
      const img_id = ref();

      const { createMessage } = useMessage();

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        filePondKey.value += 1;
        ProcessFile.value = '';
        resetFields();
        setModalProps({ confirmLoading: false });

        isUpdate.value = !!data?.isUpdate;
        currentId = data?.currentId;
        infoId = data?.infoId;
        detailId = data?.detail_id;

        if (unref(isUpdate)) {
          rowId.value = data.record.id;
          data.record.img_id = img_id.value;
          if (data.record.is_active == true) {
            data.record.is_active = '1';
          } else {
            data.record.is_active = '0';
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

      async function handleSubmit() {
        if (
          (ProcessFile.value == '' || ProcessFile.value == undefined) &&
          IsFilePondInitial.value
        ) {
          createMessage.error('请等待上传');
        } else {
          try {
            const values = await validate();

            const data = values;
            data.info = infoId;
            data.serverId = ProcessFile.value.serverId;
            setModalProps({ confirmLoading: true });
            infoId.value;

            if (
              data.content == '' &&
              (data.serverId == '' || data.serverId == undefined || data.serverId == null)
            ) {
              createMessage.error('请选择文件或填写内容');
            } else {
              data.content = decodeURIComponent(data.content);

              if (unref(detailId) == -1) {
                !unref(isUpdate)
                  ? await detailAddApi(data)
                  : await detailEditApi(unref(currentId), data);
              } else {
                data.work_flow_type = 4;
                await detailEditApi(unref(currentId), data);
              }
              emit('success', {
                isUpdate: unref(isUpdate),
                detailId: detailId,
                values: { ...values, id: rowId.value },
              });
              closeModal();
            }
          } catch (error: any) {
            console.log(error);
          } finally {
            setModalProps({ confirmLoading: false });
          }
        }
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
        getTitle,
        img_path,
        img_id,
        rowId,
        filePondKey,
        handleSubmit,
        handleCancel,
        getProcessFile,
        getFileInitialStatus,
      };
    },
  });
</script>
