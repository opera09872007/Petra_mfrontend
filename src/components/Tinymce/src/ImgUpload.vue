<template>
  <div :class="[prefixCls, { fullscreen }]">
    <Upload
      name="file"
      multiple
      @change="handleChange"
      :action="rtfUploadUrl"
      :showUploadList="false"
      :before-upload="beforeUpload"
      accept=".jpg,.jpeg,.gif,.png,.webp"
    >
      <a-button type="primary" v-bind="{ ...getButtonProps }">
        {{ t('component.upload.imgUpload') }}
      </a-button>
    </Upload>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed } from 'vue';

  import { Upload } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { renderAsync } from 'docx-preview';

  export default defineComponent({
    name: 'TinymceImageUpload',
    components: { Upload },
    props: {
      fullscreen: {
        type: Boolean,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['uploading', 'done', 'error'],
    setup(props, { emit }) {
      const { rtfUploadUrl } = useGlobSetting();
      const { t } = useI18n();
      const { prefixCls } = useDesign('tinymce-img-upload');

      const getButtonProps = computed(() => {
        const { disabled } = props;
        return {
          disabled,
        };
      });
      function beforeUpload() {
        return false;
      }

      function handleChange(info: Recordable) {
        const file = info.file;
        const name = file?.name;

        if (file) {
          const reader = new FileReader();

          var a = document.createElement('div');
          reader.onload = (event) => {
            const fileData = event.target.result; // 读取文件数据
            const blob = new Blob([fileData], { type: file.type }); // 创建 Blob 对象
            console.log(blob); // 在控制台打印 Blob 对象
            var docxOptions = {
              className: 'docx',
              inWrapper: false,
              ignoreWidth: false,
              ignoreHeight: false,
              ignoreFonts: false,
              breakPages: true,
              ignoreLastRenderedPageBreak: true,
              experimental: false,
              trimXmlDeclaration: true,
              useBase64URL: false,
              useMathMLPolyfill: false,
              renderChanges: false,
              renderHeaders: true,
              renderFooters: true,
              renderFootnotes: true,
              renderEndnotes: true,
              debug: false,
            };
            renderAsync(blob, a, null, docxOptions).then(() => {
              console.log(a);
              emit('done', name, a.outerHTML);
            });
          };

          reader.readAsArrayBuffer(file); // 将文件读取为 ArrayBuffer
        }

        // console.log('res---->', docData);
        // console.log(123);

        // console.log(file.originFileObj);
        // console.log(123);
        // let ss = '';
        // //用docx-preview渲染
        // renderAsync(docData, ss).then((res) => {
        //   console.log('res---->', res);
        //   console.log('res---->', ss);
        // });
        // if (status === 'uploading') {
        //   if (!uploading) {
        //     emit('uploading', name);
        //     uploading = true;
        //   }
        // } else if (status === 'done') {
        //   emit('done', name, url.replace(/minio1/, imgUrl));
        //   uploading = false;
        // } else if (status === 'error') {
        //   emit('error');
        //   uploading = false;
        // }
      }

      return {
        prefixCls,
        handleChange,
        rtfUploadUrl,
        t,
        getButtonProps,
        beforeUpload,
      };
    },
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-tinymce-img-upload';

  .@{prefix-cls} {
    position: absolute;
    top: 4px;
    right: 10px;
    z-index: 20;

    &.fullscreen {
      position: fixed;
      z-index: 10000;
    }
  }
</style>
