<template>
  <FilePonds
    name="filepond"
    ref="pond"
    class-name="my-pond"
    label-idle="选择文件"
    allow-multiple="true"
    max-files="1"
    acceptedFileTypes="image/*"
    credits=""
    :server="uploadUrl"
    maxFileSize="500MB"
    labelMaxFileSizeExceeded="文件太大"
    labelMaxFileSize="最大允许 {filesize}"
    labelFileTypeNotAllowed="文件类型不被允许"
    fileValidateTypeLabelExpectedTypes="只允许 {allButLastType} 或 {lastType}"
    labelFileProcessing="上传中"
    labelFileProcessingComplete="上传完成"
    labelTapToCancel="点击取消"
    labelTapToUndo="点击删除"
    @processfile="handleProcessFile"
    @processfilestart="handleFilePondStart"
  />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  // Import FilePond
  import vueFilePond from 'vue-filepond';

  // Import plugins
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js';
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.esm.js';
  import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

  // Import styles
  import 'filepond/dist/filepond.min.css';
  import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
  import { useGlobSetting } from '/@/hooks/setting';

  // Create FilePond component
  const FilePonds = vueFilePond(
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview,
    FilePondPluginFileValidateSize,
  );

  const globSetting = useGlobSetting();
  export default defineComponent({
    name: 'FilePond',
    components: {
      FilePonds,
    },
    props: ['img_path', 'img_id'],
    setup() {},
    data: function () {
      const url = globSetting.fileuploadUrl;
      const uploadUrl = {
        url: url,
        process: 'process/',
        patch: 'patch/',
        revert: 'revert/',
        fetch: 'fetch/?target=',
        load: 'load/?target=',
      };
      return {
        uploadUrl: uploadUrl,
      };
    },
    // data: function () {
    //   return {
    //     myFiles: ['index.html'],
    //   };
    // },
    methods: {
      handleProcessFile: function (file) {
        this.$emit('getProcessFile', file);
      },
      handleFilePondStart: function () {
        this.$emit('getFileInitialStatus', true);
      },
    },
  });
</script>
<style></style>
