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
          :detail_id="detail_id"
          ref="tableRef"
          :rowSelection="{ type: 'checkbox' }"
        >
          <template #toolbar>
            <!-- <a-button v-if="detail_id == -1" type="primary" @click="handleCreate">新增</a-button> -->
            <BasicUpload
              v-if="uploadStatus"
              :maxSize="20000000"
              :minSize="10"
              :maxNumber="200"
              @change="handleChange"
              class="my-5"
              ref="uploadRef"
              :pathName="pathName"
              :bucketName="bucketName"
              :accessKey="accessKey"
              :secretKey="secretKey"
              :endPoint="endPoint"
              :regStr="regStr"
            />
            <a-button type="primary" @click="handleDownload(0)">下载</a-button>
            <a-button type="primary" @click="handleDownloadAll(0)">全部下载</a-button>
            <a-button v-if="uploadStatus" type="error" @click="handleDelete" :loading="loading"
              >删除</a-button
            >
          </template>
          <template #bodyCell="{ record, column }">
            <TableAction
              v-if="column.dataIndex == 'action' && detail_id == -1"
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
          </template>
        </BasicTable> </div
    ></div>
    <div class="p-2 w-2/4 xl:w-2/4">
      <div class="p-4 mb-2 bg-white" style="height: 100%">
        <BasicTable
          @register="registerTable2"
          :searchInfo="searchInfo2"
          style="height: 100%"
          :detail_id="detail_id"
          ref="tableRef2"
          :rowSelection="{ type: 'checkbox' }"
        >
          <template #toolbar>
            <!-- <BasicUpload
              :maxSize="200"
              :minSize="10"
              :maxNumber="200"
              @change="handleChange"
              :accept="['image/*']"
              ref="uploadRef"
              :pathName="pathName"
              :bucketName="bucketName"
              :accessKey="accessKey"
              :secretKey="secretKey"
              :endPoint="endPoint"
            /> -->
            <a-button type="primary" @click="handleDownload(1)">下载</a-button>
            <a-button type="primary" @click="handleDownloadAll(1)">全部下载</a-button>
            <!-- <a-button type="error" @click="handleDelete" :loading="loading">删除</a-button> -->
          </template>
          <template #bodyCell="{ record, column }">
            <TableAction
              v-if="column.dataIndex == 'action' && detail_id == -1"
              :actions="[
                {
                  icon: 'ant-design:picture-outlined',
                  tooltip: '显示图片',
                  onClick: handleShowImg.bind(null, record),
                },
              ]"
            />
          </template>
        </BasicTable> </div
    ></div>
    <!-- <div class="p-2 w-2/4 xl:w-2/4">
      <Card :hoverable="true" style="height: 100%" ref="element" id="card">
        <div id="img_div">
          <Image :placeholder="true" :width="200" :height="200" :src="detailData.img_path2" />
        </div>
      </Card>
    </div> -->
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
  import { detailAddApi } from '/@/api/data/detail';

  import {
    infoDetailApi,
    infoGetPathNameApi,
    infoDownLoadAllImageApi,
    getinfoRepRegStrApi,
    getinfoContainTextApi,
  } from '/@/api/data/info';
  import { useModal } from '/@/components/Modal';
  import DetailModal from './DetailModal.vue';
  import { detailDeleteApi } from '/@/api/data/detail';

  import { useGlobSetting } from '/@/hooks/setting';
  import { BasicUpload } from '/@/components/Uploader';
  import { useMessage } from '/@/hooks/web/useMessage';
  import useClipboard from 'vue-clipboard3';
  import { useUserStore } from '/@/store/modules/user';

  const { fileviewUrl = '' } = useGlobSetting();
  const { toClipboard } = useClipboard();
  const { createMessage } = useMessage();
  export default defineComponent({
    name: 'DataDetail',
    components: {
      PageWrapper,
      BasicTable,
      TableAction,
      DetailModal,
      BasicUpload,
    },
    setup() {
      const route = useRoute();
      const go = useGo();
      const userStore = useUserStore();

      const accessKey = userStore.getUserInfo.access_key;
      const secretKey = userStore.getUserInfo.secret_key;
      const endPoint = userStore.getUserInfo.end_point;
      const userId = userStore.getUserInfo.userId;
      const bucketName = ref('');
      const pathName = ref('');
      const regStr = ref('');
      // 此处可以得到用户ID
      const detail_id = ref(route.params?.detail_id);
      const infoId = ref(route.params?.id);
      const currentKey = ref('detail');
      const { setTitle } = useTabs();
      const tableData = ref([]);
      const searchInfo = reactive<Recordable>({});
      searchInfo.infoId = infoId.value;
      searchInfo.detailId = detail_id.value;
      searchInfo.type = 0;
      const searchInfo2 = reactive<Recordable>({});
      searchInfo2.infoId = infoId.value;
      searchInfo2.detailId = detail_id.value;
      searchInfo2.type = 1;
      const Infodata = ref<Recordable[]>([]);
      const detailData = ref<Recordable[]>([]);

      const uploadStatus = ref(false);
      const minioClient = window.getS3Object({
        accessKeyId: accessKey,
        computeChecksums: true,
        secretAccessKey: secretKey,
        endpoint: endPoint,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
        sslEnabled: false,
      });
      const getData = async () => {
        const res = await infoDetailApi(infoId.value);
        if (res) {
          tableData.value = res;
          if (tableData.value.proofread_num == '-1' && tableData.value.creator_id == userId) {
            uploadStatus.value = true;
          }
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
      function generateRegex(str: string): string {
        const regexStr = str.replace(/0/g, '\\d');
        const regexStrWithDash = regexStr.replace(/-/g, '-');
        const regex = new RegExp(`^${regexStrWithDash}$`);
        return regex.toString();
      }
      const getRegStr = async () => {
        const res = await getinfoRepRegStrApi(infoId.value);
        if (res) {
          regStr.value = generateRegex(res);
        }
      };
      const getStatusOFContainText = async () => {
        const res = await getinfoContainTextApi(infoId.value);
        console.log(res);
      };
      const loading = ref(false);
      const contain_text = ref(false);
      const uploadRef = ref<any>();
      const setUploadModalLoading = (status) => uploadRef.value.setModalLoading(status);
      getData();
      getPathName();
      getRegStr();
      getStatusOFContainText();
      const [registerModal, { openModal }] = useModal();
      const [registerTable, { reload }] = useTable({
        title: '资源详细',
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
          width: '100',
          // slots: { customRender: 'action' },
        },
      });
      const [registerTable2, {}] = useTable({
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
        go('/data/list');
      }
      function handleCreate() {
        openModal(true, {
          isUpdate: false,
          currentId: '',
          infoId: searchInfo.infoId,
          detail_id: searchInfo.detailId,
        });
      }
      function handleEdit(record: Recordable) {
        if (record.content_url) {
          minioClient.getObject(
            {
              Bucket: bucketName.value + '-documents',
              Key: record.content_url,
              ResponseCacheControl: 'no-cache',
            },
            function (err, data) {
              if (err) {
              } else {
                openModal(true, {
                  record,
                  isUpdate: true,
                  content: data.Body.toString('utf-8'),
                  currentId: record.id,
                  infoId: searchInfo.infoId,
                  detail_id: searchInfo.detailId,
                });
              }
            },
          );
        } else {
          openModal(true, {
            record,
            isUpdate: true,
            content: '',
            currentId: record.id,
            infoId: searchInfo.infoId,
            detail_id: searchInfo.detailId,
          });
        }
      }
      function handleShowImg(record: Recordable) {
        detailData.value = record;
        var path =
          userStore.getUserInfo.end_point + bucketName.value + '/' + detailData.value.img_path;
        var encode = encodeURI(path);
        var base64 = btoa(encode);
        window.open('http://' + fileviewUrl + '/onlinePreview?url=' + base64);
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

      function handleSuccess() {
        reload();
        // if (detailId != -1) {
        //   go('/data/task');
        // }
      }
      async function handleChange(list: string[]) {
        setUploadModalLoading(true);
        var dataList = [];

        for (let index = 0; index < list.length; index++) {
          var data = {
            img_path: list[index].Key,
            info: infoId.value,
            priority: index,
          };

          dataList.push(data);
        }
        try {
          await detailAddApi(dataList, 0).then(() => {});
        } catch (error) {
          createMessage.error('上传失败，请重试或联系管理员');
        }
        setUploadModalLoading(false);
        reload();
      }
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
          createMessage.success('所选内容已复制到剪切板，请使用下载工具批量下载');
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
          // createMessage.success('全部内容已复制到剪切板，请使用下载工具批量下载');
        } catch (e) {
          createMessage.error('下载链接生成失败，请重试或联系管理员');
        }
      }
      const tableRef = ref<Nullable<TableActionType>>(null);
      function getTableAction() {
        const tableAction = unref(tableRef);
        if (!tableAction) {
          throw new Error('tableAction is null');
        }
        return tableAction;
      }
      const tableRef2 = ref<Nullable<TableActionType>>(null);
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
        handleCreate,
        handleEdit,
        handleShowImg,
        handleShowText,
        handleDelete,
        handleSuccess,
        searchInfo,
        searchInfo2,
        registerModal,
        detail_id,
        handleChange,
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
        regStr,
        accessKey,
        secretKey,
        endPoint,
        userId,
        uploadStatus,
        contain_text,
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
