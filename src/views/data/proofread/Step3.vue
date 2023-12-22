<template>
  <div class="step3">
    <a-result
      v-if="resultType == '1'"
      status="success"
      title="操作成功"
      sub-title="提交成功，完成本次校对"
    >
      <template #extra>
        <a-button type="primary" @click="redo" :loading="loading"> 下一个校对任务 </a-button>
      </template>
    </a-result>

    <a-result
      v-else
      status="error"
      title="操作失败"
      sub-title="提交失败，请检查网络或联系管理员,或者直接开始下一个校对"
    >
      <a-button block class="mt-2" @click="customResetFunc" :loading="loading">返回上一步</a-button>
      <template #extra>
        <a-button type="primary" @click="redo" :loading="loading"> 下一个校对任务 </a-button>
      </template>
      <div class="desc">
        <p style="font-size: 16px">
          <strong>可能的提交失败原因:</strong>
        </p>
        <p
          ><Icon icon="ant-design:close-circle-outlined" color="red" />
          网络连接不稳定
        </p>
        <p>
          <Icon icon="ant-design:close-circle-outlined" color="red" />
          服务器繁忙
        </p>
        <p>
          <Icon icon="ant-design:close-circle-outlined" color="red" />
          数据库不可用
        </p>
        <p>
          <Icon icon="ant-design:close-circle-outlined" color="red" />
          缓存不可用
        </p>
      </div>
    </a-result>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Result, Descriptions } from 'ant-design-vue';
  import Icon from '/@/components/Icon/index';
  export default defineComponent({
    components: {
      [Result.name]: Result,
      [Descriptions.name]: Descriptions,
      [Descriptions.Item.name]: Descriptions.Item,
      Icon,
    },
    props: ['resultType'],
    emits: ['redo', 'prev'],
    setup(_, { emit }) {
      const loading = ref(false);
      async function customResetFunc() {
        try {
          emit('prev');
        } catch (error) {}
      }
      async function redo() {
        loading.value = true;
        try {
          setTimeout(() => {
            emit('redo');
          }, 2000);
        } catch (error) {
        } finally {
          setTimeout(() => {
            loading.value = false;
          }, 2000);
        }
      }
      return {
        loading,
        redo,
        customResetFunc,
      };
    },
  });
</script>
<style lang="less" scoped>
  .step3 {
    width: 600px;
    margin: 0 auto;
  }

  .desc-wrap {
    padding: 24px 40px;
    margin-top: 24px;
    background-color: @background-color-light;
  }
</style>
