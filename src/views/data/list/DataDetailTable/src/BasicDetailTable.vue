<template>
  <div class="p-2 w-2/4 xl:w-2/4">
    <div class="p-4 mb-2 bg-white" style="height: 100%">
      <BasicTable
        @register="registerTable"
        :searchInfo="searchInfo"
        style="height: 100%"
        ref="tableRef"
        :rowSelection="{ type: 'checkbox' }"
      >
        <template #toolbar>
          <a-select
            v-model:value="tasktype"
            :options="taskOptions"
            :fieldNames="{ label: 'name', value: 'img_type' }"
            @change="handleSelectChange"
          />
          <BasicUpload
            v-if="showUpload"
            :maxSize="20000000"
            :minSize="10"
            :maxNumber="200"
            :pathName="pathName"
            :bucketName="bucketName"
            :regStr="$props.regStr"
            @change="handleChange"
            class="my-5"
            ref="uploadRef"
          />
          <a-button type="primary" @click="handleDownload()">下载</a-button>
          <a-button type="primary" @click="handleDownloadAll()">全部下载</a-button>
          <a-button v-if="showUpload" type="error" @click="handleDelete" :loading="loading"
            >删除</a-button
          >
        </template>
        <template #bodyCell="{ record, column }">
          <TableAction
            v-if="column.dataIndex == 'action' && !isProofread && record.workflow_type_number < 2"
            :actions="[
              {
                icon: 'ant-design:picture-outlined',
                tooltip: '显示图片',
                onClick: handleShowImg.bind(null, record),
              },
              {
                icon: 'ant-design:file-text-outlined',
                tooltip: '显示文字',
                onClick: handleShowText.bind(null, record),
              },
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑资源',
                onClick: handleEdit.bind(null, record),
              },
            ]"
          />
          <TableAction
            v-if="
              column.dataIndex == 'action' &&
              !isProofread &&
              record.workflow_type_number >= 2 &&
              record.workflow_type_number % 5 == 0 &&
              record.node_error_memo == ''
            "
            :actions="[
              {
                icon: 'ant-design:picture-outlined',
                tooltip: '显示图片',
                onClick: handleShowImg.bind(null, record),
              },
              {
                icon: 'ant-design:file-text-outlined',
                tooltip: '显示文字',
                onClick: handleShowText.bind(null, record),
              },
            ]"
          />
          <TableAction
            v-if="
              column.dataIndex == 'action' &&
              !isProofread &&
              record.workflow_type_number >= 2 &&
              record.workflow_type_number % 5 == 0 &&
              record.node_error_memo != ''
            "
            :actions="[
              {
                icon: 'ant-design:picture-outlined',
                tooltip: '显示图片',
                onClick: handleShowImg.bind(null, record),
              },
              {
                icon: 'ant-design:file-text-outlined',
                tooltip: '显示文字',
                onClick: handleShowText.bind(null, record),
              },
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑资源',
                onClick: handleEdit.bind(null, record),
              },
            ]"
          />
          <TableAction
            v-if="
              column.dataIndex == 'action' &&
              record.workflow_type_number >= 2 &&
              record.workflow_type_number % 5 != 0 &&
              !isProofread
            "
            :actions="[
              {
                icon: 'ant-design:picture-outlined',
                tooltip: '显示图片',
                onClick: handleShowImg.bind(null, record),
              },
              {
                icon: 'ant-design:file-text-outlined',
                tooltip: '显示文字',
                onClick: handleShowText.bind(null, record),
              },
            ]"
          />
          <TableAction
            v-if="
              column.dataIndex == 'action' &&
              isProofread &&
              (record.workflow_type_number + 1) % 5 == 0
            "
            :actions="[
              {
                icon: 'ant-design:picture-outlined',
                tooltip: '显示图片',
                onClick: handleShowImg.bind(null, record),
              },
              {
                icon: 'ant-design:file-text-outlined',
                tooltip: '显示文字',
                onClick: handleShowText.bind(null, record),
              },
              {
                icon: 'ant-design:import-outlined',
                tooltip: '回退',
                onClick: handleReturn.bind(null, record),
              },
            ]"
          />
          <TableAction
            v-if="
              column.dataIndex == 'action' && isProofread && record.workflow_type_number % 5 == 0
            "
            :actions="[
              {
                icon: 'ant-design:picture-outlined',
                tooltip: '显示图片',
                onClick: handleShowImg.bind(null, record),
              },
              {
                icon: 'ant-design:file-text-outlined',
                tooltip: '显示文字',
                onClick: handleShowText.bind(null, record),
              },
              {
                icon: 'ant-design:clear-outlined',
                tooltip: '取消退回操作',
                popConfirm: {
                  title: '是否确认退回',
                  confirm: handleCancelReturn.bind(null, record),
                },
              },
            ]"
          />
          <TableAction
            v-if="
              column.dataIndex == 'action' &&
              isProofread &&
              (record.workflow_type_number - 3) % 5 == 0
            "
            :actions="[
              {
                icon: 'ant-design:picture-outlined',
                tooltip: '显示图片',
                onClick: handleShowImg.bind(null, record),
              },
              {
                icon: 'ant-design:file-text-outlined',
                tooltip: '显示文字',
                onClick: handleShowText.bind(null, record),
              },
            ]"
          />
        </template>
      </BasicTable> </div
  ></div>
  <DetailModal @register="registerModal" @success="handleSuccess" />
  <ProofreadlModal @register="registerModal2" @success="handleSuccess" />
</template>
<script lang="ts">
  import { defineComponent, ref, reactive, unref } from 'vue';
  import type { PropType } from 'vue';
  import { BasicTable, useTable, TableAction, TableActionType } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicUpload } from '/@/components/Uploader';
  import { useModal } from '/@/components/Modal';
  import DetailModal from './DetailModal.vue';
  import ProofreadlModal from './ProofreadlModal.vue';
  import useClipboard from 'vue-clipboard3';
  import { Select } from 'ant-design-vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useUserStore } from '/@/store/modules/user';
  import {
    infoDownLoadAllImageApi,
    getImgTypeByInfoIdList,
    infoGetPathNameApi,
  } from '/@/api/data/info';
  import { getTaskTypeList } from '/@/api/data/workTaskType';
  import { detailColumns } from '../../list.data';
  import {
    detailAddApi,
    detailDeleteApi,
    getDetailList,
    cancelReturnApi,
  } from '/@/api/data/detail';
  import { getPresignedObjects } from '/@/api/S3Upload/upload';
  import axios from 'axios';

  export default defineComponent({
    name: 'BasicDetailTable',
    components: {
      BasicUpload,
      DetailModal,
      ProofreadlModal,
      BasicTable,
      TableAction,
      [Select.name]: Select,
    },
    props: {
      titleSuffix: {
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
      infoId: {
        type: Number as PropType<Number>,
        default: -1,
      },
      creatorId: {
        type: Number as PropType<Number>,
        default: -1,
      },
      workflowType: {
        type: Number as PropType<Number>,
        default: -1,
      },
      optionOffset: {
        type: Number as PropType<Number>,
        default: 0,
      },
      isProofread: {
        type: Boolean as PropType<boolean>,
        default: false,
      },
    },
    emits: ['change', 'delete', 'update:value'],

    setup(props, {}) {
      const { createMessage } = useMessage();
      const { toClipboard } = useClipboard();
      const { fileviewUrl = '' } = useGlobSetting();
      const userStore = useUserStore();

      const userId = userStore.getUserInfo.userId;
      const searchInfo = reactive<Recordable>({});
      const pathName = ref('');
      const bucketName = ref('');
      const tableTiltle = ref('图版列表');
      const Infodata = ref<Recordable[]>([]);
      const nowImgType = ref(-1);
      const loading = ref(false);
      const showUpload = ref(false);
      const uploadRef = ref<any>();
      const setUploadModalLoading = (status) => uploadRef.value.setModalLoading(status);
      const tasktype = ref(-1);
      const taskOptions = ref<Recordable>();
      const tableRef = ref<Nullable<TableActionType>>(null);
      const [registerModal, { openModal }] = useModal();
      const [registerModal2, { openModal: openModal2 }] = useModal();
      const [registerTable, { reload }] = useTable({
        title: tableTiltle,
        api: getDetailList,
        rowKey: 'id',
        columns: detailColumns,
        dataSource: Infodata,
        useSearchForm: false,
        isTreeTable: false,
        showTableSetting: true,
        bordered: true,
        immediate: false,
        handleSearchInfoFn(info) {
          return info;
        },
        actionColumn: {
          title: '操作',
          dataIndex: 'action',
          width: '150',
          // slots: { customRender: 'action' },
        },
      });

      async function handleChange(list: string[]) {
        setUploadModalLoading(true);
        var dataList = [];

        for (let index = 0; index < list.length; index++) {
          var data = {
            img_path: list[index].Key,
            info: props.infoId,
            priority: index,
          };

          dataList.push(data);
        }
        try {
          await detailAddApi(dataList, nowImgType.value).then(() => {});
        } catch (error) {
          createMessage.error('上传失败，请重试或联系管理员');
        }
        setUploadModalLoading(false);
        reload();
      }

      const getPathName = async () => {
        const res = await infoGetPathNameApi(Number(props.infoId), Number(tasktype.value));
        if (res) {
          pathName.value = res.pathName;
          bucketName.value = res.bucketName;
        }
      };
      const getTaskOptionsAndList = async () => {
        taskOptions.value = await getTaskTypeList(
          Number(userStore.getUserInfo.now_work_repository),
        );

        const res = await getImgTypeByInfoIdList(Number(props.infoId));
        nowImgType.value = unref(res.img_type);
        searchInfo.infoId = props.infoId;

        let localNum = Number(nowImgType.value) + Number(props.optionOffset);
        if (localNum >= 0) {
          tasktype.value = taskOptions.value[localNum].img_type;
          getPathName();
        } else {
          tasktype.value = -1;
        }
        tableTiltle.value += props.titleSuffix;
        searchInfo.type = tasktype.value;

        if (
          nowImgType.value == searchInfo.type &&
          (Number(props.workflowType) <= 1 || Number(props.workflowType) % 5 == 0)
        ) {
          showUpload.value = unref(true);
        } else {
          showUpload.value = unref(false);
        }
        if (searchInfo.type == -1) {
          showUpload.value = unref(false);
        }
        reload();
      };
      async function handleSelectChange() {
        searchInfo.type = tasktype.value;
        tableTiltle.value = tableTiltle.value.substring(0, 4);

        if (
          nowImgType.value == searchInfo.type &&
          (Number(props.workflowType) <= 1 || Number(props.workflowType) % 5 == 0)
        ) {
          showUpload.value = unref(true);
        } else {
          showUpload.value = unref(false);
        }
        getPathName();
        reload();
      }
      function getTableAction() {
        const tableAction = unref(tableRef);
        if (!tableAction) {
          throw new Error('tableAction is null');
        }
        return tableAction;
      }
      async function handleDownload() {
        try {
          var tableSelectedList = getTableAction().getSelectRows();
          var wholeUrl = '';

          if (tableSelectedList.length <= 0) return;

          for (let index = 0; index < tableSelectedList.length; index++) {
            const key = tableSelectedList[index].img_path;

            wholeUrl = wholeUrl + (props.endPoint + bucketName.value + '/' + key) + '  \n';
          }
          await toClipboard(wholeUrl);
          createMessage.success('所选内容已复制到剪切板，请使用下载工具批量下载');
        } catch (e) {
          createMessage.error('下载链接生成失败，请重试或联系管理员');
        }
      }

      async function handleDownloadAll() {
        try {
          const data = await infoDownLoadAllImageApi(Number(props.infoId), searchInfo.type);
          var wholeUrl = '';
          const res = JSON.parse(data);
          for (var n in res) {
            wholeUrl = wholeUrl + (props.endPoint + bucketName.value + '/' + res[n]) + '  \n';
          }
          await toClipboard(wholeUrl);
          createMessage.success('全部内容已复制到剪切板，请使用下载工具批量下载');
        } catch (e) {
          createMessage.error('下载链接生成失败，请重试或联系管理员');
        }
      }
      async function handleDelete() {
        try {
          loading.value = true;
          var tableSelectedList = getTableAction().getSelectRows();
          var dataList = [];
          if (tableSelectedList.length <= 0) {
            loading.value = false;
            return;
          }
          for (let index = 0; index < tableSelectedList.length; index++) {
            const key = tableSelectedList[index].id;
            dataList.push(key);
          }

          await detailDeleteApi(dataList, 0).then(() => {
            getTableAction().clearSelectedRowKeys();
            createMessage.success('删除成功');
          });
        } catch (e) {
          createMessage.error('删除失败，请重试或联系管理员');
        }
        loading.value = false;
        reload();
      }
      async function handleShowImg(record: Recordable) {
        var PresignedUrl = await getPresignedObjects({
          bucketName: bucketName.value,
          objectName: record.img_path,
        });

        var encode = encodeURI(PresignedUrl);
        var base64 = btoa(encode);

        window.open('http://' + fileviewUrl + '/onlinePreview?url=' + base64);
      }
      async function handleShowText(record: Recordable) {
        var PresignedUrl = await getPresignedObjects({
          bucketName: bucketName.value + '-documents',
          objectName: record.img_path.replace('.tif', '.html'),
        });

        window.open(PresignedUrl, record.img_path.replace('.tif', '.html'));
      }
      async function handleEdit(record: Recordable) {
        if (record.content_url) {
          var PresignedUrl = await getPresignedObjects({
            bucketName: bucketName.value + '-documents',
            objectName: record.content_url,
          });
          axios
            .get(PresignedUrl)
            .then((response) => {
              openModal(true, {
                record,
                isUpdate: true,
                content: response.data.toString('utf-8'),
                currentId: record.id,
                infoId: searchInfo.infoId,
              });
            })
            .catch((error) => {
              createMessage.error('打开失败（' + error + '），请重试或联系管理员');
            });
        } else {
          openModal(true, {
            record,
            isUpdate: true,
            content: '',
            currentId: record.id,
            infoId: searchInfo.infoId,
          });
        }
      }

      function handleReturn(record: Recordable) {
        openModal2(true, {
          cateId: searchInfo.cateId,
          repId: searchInfo.repId,
          record,
          isUpdate: true,
          currentId: record.id,
        });
      }

      async function handleCancelReturn(record: Recordable) {
        try {
          const res = await cancelReturnApi(unref(record.id));

          if (res == 1) {
            createMessage.success('取消成功');
            reload();
          } else {
            createMessage.error('取消失败，请重试或联系管理员');
          }
        } catch (e) {
          createMessage.error('取消失败，请重试或联系管理员');
        }
      }

      function handleSuccess() {
        reload();
        // if (detailId != -1) {
        //   go('/data/task');
        // }
      }

      getTaskOptionsAndList();
      return {
        registerTable,
        registerModal,
        registerModal2,
        reload,
        searchInfo,
        handleChange,
        handleDownload,
        handleDownloadAll,
        handleDelete,
        loading,
        handleShowImg,
        handleShowText,
        handleEdit,
        handleSuccess,
        Infodata,
        handleSelectChange,
        tasktype,
        taskOptions,
        tableRef,
        uploadRef,
        nowImgType,
        showUpload,
        tableTiltle,
        pathName,
        bucketName,
        userId,
        handleReturn,
        handleCancelReturn,
      };
    },
  });
</script>
