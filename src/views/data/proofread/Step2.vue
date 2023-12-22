<template>
  <div>
    <div style="text-align: center">
      <a-space :size="40">
        <a-alert style="width: 100%" message="此次确认后，将完成此次校对，无法撤销。" show-icon
      /></a-space>
    </div>

    <Divider />
    <div style="text-align: center; margin: 30px 10px 10px 10px">
      <a-space :size="40">
        <a-textarea
          :rows="5"
          style="width: 400px"
          placeholder="填写当前回退的错误原因"
          :value="returnData"
          @change="onchange"
      /></a-space>
    </div>
    <div style="text-align: center; margin: 40px 0px 40px 0px">
      <a-space :size="40">
        <a-button block class="mt-2" @click="customResetFunc" :loading="loading">上一步</a-button>
        <Popconfirm
          title="是否确认回退?"
          ok-text="确认"
          cancel-text="取消"
          @confirm="confirm"
          @cancel="cancel"
        >
          <a-button block class="mt-2" type="danger" :loading="loading">退回</a-button>
        </Popconfirm>
        <Popconfirm
          title="是否确认完成当前校对?"
          ok-text="确认"
          cancel-text="取消"
          @confirm="confirm2"
          @cancel="cancel2"
        >
          <a-button block class="mt-2" type="primary" :loading="loading"
            >完成校对</a-button
          ></Popconfirm
        >
      </a-space>
    </div>

    <Divider />
    <iframe :src="iframeURL" width="100%" height="2000px"> </iframe>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Alert, Space } from 'ant-design-vue';
  import { Divider, Popconfirm } from 'ant-design-vue';
  export default defineComponent({
    components: {
      [Alert.name]: Alert,
      ASpace: Space,
      Divider,
      Popconfirm,
    },
    props: ['iframeURL'],
    emits: ['prev', 'return', 'proof'],
    setup(_, { emit }) {
      const loading = ref(false);
      const returnData = ref('');
      const confirm = () => {
        customReturnFunc();
      };

      const cancel = () => {};
      const confirm2 = () => {
        customSubmitFunc();
      };

      const cancel2 = () => {};
      async function customResetFunc() {
        try {
          emit('prev');
        } catch (error) {}
      }
      async function customSubmitFunc() {
        loading.value = true;
        try {
          setTimeout(() => {
            emit('proof');
          }, 1500);
        } catch (error) {
        } finally {
          setTimeout(() => {
            loading.value = false;
          }, 1500);
        }
      }
      async function customReturnFunc() {
        loading.value = true;
        try {
          setTimeout(() => {
            emit('return', returnData);
          }, 1500);
        } catch (error) {
        } finally {
          setTimeout(() => {
            loading.value = false;
            returnData.value = '';
          }, 1500);
        }
      }
      function onchange(value) {
        returnData.value = value.target.value;
      }
      return {
        customResetFunc,
        customReturnFunc,
        customSubmitFunc,
        loading,
        returnData,
        onchange,
        confirm,
        cancel,
        confirm2,
        cancel2,
      };
    },
  });
</script>
<style lang="less" scoped>
  .step2 {
    width: 450px;
    margin: 0 auto;
  }
</style>
