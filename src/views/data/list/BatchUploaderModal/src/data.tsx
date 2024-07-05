import type { BasicColumn, ActionItem } from '/@/components/Table';
import { FileItem, UploadResultStatus } from './typing';
import { Progress, Tag } from 'ant-design-vue';
import TableAction from '/@/components/Table/src/components/TableAction.vue';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

// 文件上传列表
export function createTableColumns(): BasicColumn[] {
  return [
    // {
    //   dataIndex: 'thumbUrl',
    //   title: t('component.upload.legend'),
    //   width: 100,
    //   customRender: ({ record }) => {
    //     const { thumbUrl } = (record as FileItem) || {};
    //     return thumbUrl && <ThumbUrl fileUrl={thumbUrl} />;
    //   },
    // },
    {
      dataIndex: 'self_code',
      title: '自编码',
    },
    {
      dataIndex: 'categories',
      title: '分类',
    },
    {
      dataIndex: 'h_name',
      title: '名称',
    },
    {
      dataIndex: 'alias',
      title: '别名',
    },
    {
      dataIndex: 'dynasty',
      title: '朝代',
    },
    {
      dataIndex: 'era_name',
      title: '年号',
    },
    {
      dataIndex: 'common_era',
      title: '公元纪年',
    },
    {
      dataIndex: 'language',
      title: '文种',
    },
    {
      dataIndex: 'inscription',
      title: '额题',
    },
    {
      dataIndex: 'main_inscription',
      title: '首题',
    },
    {
      dataIndex: 'material',
      title: '材质',
    },
    {
      dataIndex: 'form',
      title: '形制',
    },
    {
      dataIndex: 'shape',
      title: '形款',
    },
    {
      dataIndex: 'composition',
      title: '撰文',
    },
    {
      dataIndex: 'author',
      title: '书丹',
    },
    {
      dataIndex: 'inscriber',
      title: '刊石',
    },
    {
      dataIndex: 'font',
      title: '书体',
    },
    {
      dataIndex: 'excavation_site',
      title: '出土地（或原址）及时间',
    },
    {
      dataIndex: 'collector',
      title: '收藏者或保护单位',
    },
    {
      dataIndex: 'content',
      title: '叙录',
    },
    {
      dataIndex: 'name',
      title: t('component.upload.fileName'),
      align: 'left',
      customRender: ({ text, record }) => {
        const { percent, status: uploadStatus } = (record as FileItem) || {};
        let status: 'normal' | 'exception' | 'active' | 'success' = 'normal';
        if (uploadStatus === UploadResultStatus.ERROR) {
          status = 'exception';
        } else if (uploadStatus === UploadResultStatus.UPLOADING) {
          status = 'active';
        } else if (uploadStatus === UploadResultStatus.SUCCESS) {
          status = 'success';
        }
        return (
          <span>
            <p class="truncate mb-1" title={text}>
              {text}
            </p>
            <Progress percent={percent} size="small" status={status} />
          </span>
        );
      },
    },
    {
      dataIndex: 'size',
      title: t('component.upload.fileSize'),
      width: 100,
      customRender: ({ text = 0 }) => {
        return text && (text / 1024).toFixed(2) + 'KB';
      },
    },
    // {
    //   dataIndex: 'type',
    //   title: '文件类型',
    //   width: 100,
    // },
    {
      dataIndex: 'status',
      title: t('component.upload.fileStatue'),
      width: 100,
      customRender: ({ text }) => {
        if (text === UploadResultStatus.SUCCESS) {
          return <Tag color="green">{() => t('component.upload.uploadSuccess')}</Tag>;
        } else if (text === UploadResultStatus.ERROR) {
          return <Tag color="red">{() => t('component.upload.uploadError')}</Tag>;
        } else if (text === UploadResultStatus.UPLOADING) {
          return <Tag color="blue">{() => t('component.upload.uploading')}</Tag>;
        }

        return text;
      },
    },
  ];
}
export function createActionColumn(handleRemove: Function, handleRetry: Function): BasicColumn {
  return {
    width: 120,
    title: t('component.upload.operating'),
    dataIndex: 'action',
    fixed: false,
    customRender: ({ record }) => {
      let status = false;
      if (record.status == UploadResultStatus.ERROR) {
        status = true;
      }
      const actions: ActionItem[] = [
        {
          label: t('component.upload.retry'),
          onClick: handleRetry.bind(null, record),
          ifShow: status,
        },
        {
          label: t('component.upload.del'),
          color: 'error',
          onClick: handleRemove.bind(null, record),
        },
      ];

      return <TableAction actions={actions} outside={true} />;
    },
  };
}
