<template>
  <PageWrapper
    :title="tableData.name"
    dense
    contentFullHeight
    fixedHeight
    contentClass="flex"
    @back="goBack"
  >
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
            <!-- <a-button v-if="detail_id == -1" type="primary" @click="handleCreate">新增</a-button> -->
            <a-button type="primary" @click="handleDownload(0)">下载</a-button>
            <a-button type="primary" @click="handleDownloadAll(0)">全部下载</a-button>
          </template>
          <template #bodyCell="{ record, column }">
            <TableAction
              v-if="
                column.dataIndex == 'action' &&
                (record.work_flow_type == 8 || record.work_flow_type == 9)
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
                  onClick: handleReturn.bind(null, record, 0),
                },
              ]"
            />
            <TableAction
              v-if="column.dataIndex == 'action' && record.work_flow_type == 3"
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
                    confirm: handleCancelReturn.bind(null, record, 0),
                  },
                },
              ]"
            />
            <TableAction
              v-if="column.dataIndex == 'action' && record.work_flow_type == 10"
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
    <div class="p-2 w-2/4 xl:w-2/4">
      <div class="p-4 mb-2 bg-white" style="height: 100%">
        <BasicTable
          @register="registerTable2"
          :searchInfo="searchInfo2"
          style="height: 100%"
          ref="tableRef2"
          :rowSelection="{ type: 'checkbox' }"
        >
          <template #toolbar>
            <a-button type="primary" @click="handleDownload(1)">下载</a-button>
            <a-button type="primary" @click="handleDownloadAll(1)">全部下载</a-button>
          </template>
          <template #bodyCell="{ record, column }" v-if="tableData.proofread_num != -1">
            <TableAction
              v-if="column.dataIndex == 'action' && record.work_flow_type != 3"
              :actions="[
                {
                  icon: 'ant-design:picture-outlined',
                  tooltip: '显示图片',
                  onClick: handleShowImg.bind(null, record),
                },
                {
                  icon: 'ant-design:import-outlined',
                  tooltip: '回退',
                  onClick: handleReturn.bind(null, record, 1),
                },
              ]"
            />
            <TableAction
              v-if="column.dataIndex == 'action' && record.work_flow_type == 3"
              :actions="[
                {
                  icon: 'ant-design:picture-outlined',
                  tooltip: '显示图片',
                  onClick: handleShowImg.bind(null, record),
                },
                {
                  icon: 'ant-design:clear-outlined',
                  tooltip: '取消退回操作',
                  popConfirm: {
                    title: '是否确认退回',
                    confirm: handleCancelReturn.bind(null, record, 1),
                  },
                },
              ]"
            />
          </template>
        </BasicTable> </div
    ></div>
    <DetailModal @register="registerModal" @success="handleSuccess" />
  </PageWrapper>
</template>

<script lang="ts">
  import { defineComponent, ref, reactive, unref } from 'vue';
  import { useRoute } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, useTable, TableAction, TableActionType } from '/@/components/Table';
  import { detailColumns } from './list.data';
  import { useGo } from '/@/hooks/web/usePage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { getDetailList } from '/@/api/data/detail';

  import { cancelReturnApi } from '/@/api/data/detail';

  import { infoDetailApi, infoGetPathNameApi, infoDownLoadAllImageApi } from '/@/api/data/info';

  import { useModal } from '/@/components/Modal';
  import DetailModal from './DetailModal.vue';
  import { detailDeleteApi } from '/@/api/data/detail';

  import { useGlobSetting } from '/@/hooks/setting';

  import { useMessage } from '/@/hooks/web/useMessage';
  // import AWS from 'aws-sdk';
  import useClipboard from 'vue-clipboard3';
  import { useUserStore } from '/@/store/modules/user';

  const { toClipboard } = useClipboard();
  const { createMessage } = useMessage();
  export default defineComponent({
    name: 'ImageProofReadDetail',
    components: {
      PageWrapper,
      BasicTable,
      TableAction,
      DetailModal,
    },
    setup() {
      const { fileviewUrl = '' } = useGlobSetting();
      const userStore = useUserStore();
      // const accessKey = userStore.getUserInfo.access_key;
      // const secretKey = userStore.getUserInfo.secret_key;
      const endPoint = userStore.getUserInfo.end_point;
      // const minioClient = window.getS3Object({
      //   accessKeyId: accessKey,
      //   computeChecksums: true,
      //   secretAccessKey: secretKey,
      //   endpoint: endPoint,
      //   s3ForcePathStyle: true,
      //   signatureVersion: 'v4',
      //   sslEnabled: false,
      // });
      const route = useRoute();
      const go = useGo();
      // 此处可以得到用户ID
      const infoId = ref(route.params?.id);
      const currentKey = ref('detail');
      const { setTitle } = useTabs();
      const tableData = ref([]);
      const searchInfo = reactive<Recordable>({});
      searchInfo.infoId = infoId.value;
      searchInfo.type = 0;
      const searchInfo2 = reactive<Recordable>({});
      searchInfo2.infoId = infoId.value;
      searchInfo2.type = 1;
      const bucketName = ref('');
      const pathName = ref('');
      const Infodata = ref<Recordable[]>([]);
      const detailData = ref<Recordable[]>([]);
      const getData = async () => {
        const res = await infoDetailApi(infoId.value);
        if (res) {
          console.log(tableData.value.proofread_num);

          tableData.value = res;
          setTitle('详情：' + tableData.value.name);
        }
      };
      const getPathName = async () => {
        const res = await infoGetPathNameApi(infoId.value, 0);
        if (res) {
          pathName.value = res.pathName;
          bucketName.value = res.bucketName;
        }
      };
      const loading = ref(false);
      const uploadRef = ref<any>();
      const setUploadModalLoading = (status) => uploadRef.value.setModalLoading(status);
      getData();
      getPathName();
      const [registerModal, { openModal }] = useModal();
      const [registerTable, { reload: reload2 }] = useTable({
        title: '原始图版列表',
        api: getDetailList,
        rowKey: 'id',
        columns: detailColumns,
        dataSource: Infodata,
        useSearchForm: false,
        isTreeTable: false,
        showTableSetting: true,
        bordered: true,
        handleSearchInfoFn(info) {
          return info;
        },
        actionColumn: {
          title: '操作',
          dataIndex: 'action',
          width: '60',
          // slots: { customRender: 'action' },
        },
      });
      const [registerTable2, { reload }] = useTable({
        title: '处理上传图版列表',
        api: getDetailList,
        rowKey: 'id',
        columns: detailColumns,
        dataSource: Infodata,
        useSearchForm: false,
        isTreeTable: false,
        showTableSetting: true,
        bordered: true,
        handleSearchInfoFn(info) {
          return info;
        },
        actionColumn: {
          title: '操作',
          dataIndex: 'action',
          width: '60',
          // slots: { customRender: 'action' },
        },
      });
      // 页面左侧点击返回链接时的操作
      function goBack() {
        go('/data/proofread');
      }
      // function handleCreate() {
      //   openModal(true, {
      //     isUpdate: false,
      //     currentId: '',
      //     infoId: searchInfo.infoId,
      //     detail_id: searchInfo.detail_id,
      //   });
      // }
      // function handleEdit(record: Recordable) {
      //   openModal(true, {
      //     record,
      //     isUpdate: true,
      //     currentId: record.id,
      //     infoId: searchInfo.infoId,
      //     detail_id: searchInfo.detail_id,
      //   });
      // }
      function handleShowImg(record: Recordable) {
        detailData.value = record;
        var path =
          userStore.getUserInfo.end_point + bucketName.value + '/' + detailData.value.img_path;
        var encode = encodeURI(path);
        var base64 = btoa(encode);
        window.open('http://' + fileviewUrl + '/onlinePreview?url=' + base64, 'img');
      }

      function handleShowText(record: Recordable) {
        detailData.value = record;
        var path2 =
          userStore.getUserInfo.end_point +
          bucketName.value +
          '-documents/' +
          detailData.value.img_path;
        window.open(path2.replace('.tif', '.html'), 'html');
      }

      function handleReturn(record: Recordable) {
        openModal(true, {
          cateId: searchInfo.cateId,
          repId: searchInfo.repId,
          record,
          isUpdate: true,
          currentId: record.id,
        });
      }

      async function handleCancelReturn(record: Recordable, type: number) {
        try {
          const res = await cancelReturnApi(unref(record.id));

          if (res == 1) {
            createMessage.success('取消成功');
            if (type == 0) {
              reload2();
            } else {
              reload();
            }
          } else {
            createMessage.error('取消失败，请重试或联系管理员');
          }
        } catch (e) {
          createMessage.error('取消失败，请重试或联系管理员');
        }
      }

      async function handleDelete(record: Recordable, type: number) {
        try {
          loading.value = true;
          var tableSelectedList = getTableAction2().getSelectRows();
          var dataList = [];
          if (tableSelectedList.length <= 0) {
            loading.value = false;
            return;
          }
          for (let index = 0; index < tableSelectedList.length; index++) {
            const key = tableSelectedList[index].id;
            dataList.push(key);
          }

          await detailDeleteApi(dataList, 1).then(() => {
            getTableAction2().clearSelectedRowKeys();
            createMessage.success('删除成功');
          });
        } catch (e) {
          createMessage.error('删除失败，请重试或联系管理员');
        }
        loading.value = false;
        if (type == 0) {
          reload2();
        } else {
          reload();
        }
      }

      function handleSuccess() {
        reload();
        reload2();
        // if (detailId != -1) {
        //   go('/data/task');
        // }
      }

      // async function getDocument({ s3Key }) {
      //   const params = {
      //     Bucket: 'test',
      //     Expires: 3000,
      //     Key: s3Key, // this key is the S3 full file path (ex: mnt/sample.txt)
      //   };

      //   const url = await minioClient.getSignedUrlPromise('getObject', params).catch((err) => {
      //     console.log(err);
      //   });
      // }

      async function handleDownload(type: number) {
        try {
          var tableSelectedList =
            type == 0 ? getTableAction().getSelectRows() : getTableAction2().getSelectRows();
          var wholeUrl = '';

          if (tableSelectedList.length <= 0) return;

          var name = type == 0 ? bucketName : 'imagedeal';
          for (let index = 0; index < tableSelectedList.length; index++) {
            const key = tableSelectedList[index].img_path;

            wholeUrl = wholeUrl + (endPoint + name + '/' + key) + '  \n';
          }
          await toClipboard(wholeUrl);
          createMessage.success('内容已复制到剪切板，请使用下载工具批量下载');
        } catch (e) {
          createMessage.error('下载链接生成失败，请重试或联系管理员');
        }
      }

      async function handleDownloadAll(type: number) {
        try {
          const data = await infoDownLoadAllImageApi(infoId.value, type);
          var wholeUrl = '';
          const res = JSON.parse(data);
          for (var n in res) {
            wholeUrl = wholeUrl + (endPoint + bucketName.value + '/' + res[n]) + '  \n';
          }
          await toClipboard(wholeUrl);
          createMessage.success('全部内容已复制到剪切板，请使用下载工具批量下载');
          // var tableSelectedList =
          //   type == 0 ? getTableAction().getDataSource() : getTableAction2().getDataSource();
          // var wholeUrl = '';

          // if (tableSelectedList.length <= 0) return;

          // var name = type == 0 ? bucketName : 'imagedeal';
          // for (let index = 0; index < tableSelectedList.length; index++) {
          //   const key = tableSelectedList[index].img_path;

          //   wholeUrl = wholeUrl + (endPoint + name + '/' + key) + '  \n';
          // }
          // await toClipboard(wholeUrl);
          // createMessage.success('内容已复制到剪切板，请使用下载工具批量下载');
        } catch (e) {
          createMessage.error('下载链接生成失败，请重试或联系管理员');
        }
      }

      const tableRef = ref<Nullable<TableActionType>>(null);
      const tableRef2 = ref<Nullable<TableActionType>>(null);
      function getTableAction() {
        const tableAction = unref(tableRef);
        if (!tableAction) {
          throw new Error('tableAction is null');
        }
        return tableAction;
      }
      function getTableAction2() {
        const tableAction = unref(tableRef2);
        if (!tableAction) {
          throw new Error('tableAction is null');
        }
        return tableAction;
      }
      return {
        infoId,
        Infodata,
        currentKey,
        goBack,
        tableData,
        detailData,
        getData,
        registerTable,
        registerTable2,
        // handleCreate,
        // handleEdit,
        handleReturn,
        handleCancelReturn,
        handleDelete,
        handleSuccess,
        searchInfo,
        searchInfo2,
        registerModal,
        loading,
        uploadRef,
        setUploadModalLoading,
        handleDownload,
        handleDownloadAll,
        tableRef,
        tableRef2,
        pathName,
        getPathName,
        bucketName,
        handleShowImg,
        handleShowText,
      };
    },
    data() {
      return {
        scrollerHeight: window.innerHeight - 300 - 200 + 'px',
        scrollerWidth: this.calWidth(),
      };
    },
    mounted() {
      const that = this;
      window.onresize = function windowResize() {
        that.scrollerHeight = window.innerHeight - 300 - 200 + 'px';
        if (window.innerWidth < 1000) {
          that.scrollerWidth = window.innerWidth / 2 - 70 + 'px';
        } else {
          that.scrollerWidth = window.innerWidth / 2 - 280 + 'px';
        }
      };
    },
    methods: {
      calWidth() {
        if (window.innerWidth < 1000) {
          return window.innerWidth / 2 - 70 + 'px';
        } else {
          return window.innerWidth / 2 - 280 + 'px';
        }
      },
    },
  });
</script>

<style></style>
