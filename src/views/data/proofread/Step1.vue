<template>
  <div class="step1">
    <div class="step1-form">
      <a-descriptions bordered title="基本信息校对" :column="1" size="middle " :InfoData="InfoData">
        <a-descriptions-item label="名称">{{ InfoData.name }}</a-descriptions-item>
        <a-descriptions-item label="所属分类">{{ InfoData.categories }}</a-descriptions-item>
        <a-descriptions-item label="朝代">{{ InfoData.dynasty }}</a-descriptions-item>
        <a-descriptions-item label="版本">{{ InfoData.mode }}</a-descriptions-item>
        <a-descriptions-item label="材质">{{ InfoData.material }}</a-descriptions-item>
        <a-descriptions-item label="书体">{{ InfoData.font }}</a-descriptions-item>
        <a-descriptions-item label="形制">{{ InfoData.form }}</a-descriptions-item>
      </a-descriptions>

      <div style="text-align: center; margin: 40px 0px 40px 0px">
        <a-space :size="40">
          <a-button block class="mt-2" type="primary" @click="customSubmitFunc" :loading="loading"
            >下一步</a-button
          >
        </a-space>
      </div>
    </div>
    <a-divider />
    <h3>说明</h3>
    <h4></h4>
    <p>
      <Icon icon="ant-design:info-circle-outlined" color="blue" />
      首先选择需要校对的资源库，获取随机校对任务，然后依次校对每个版面的信息</p
    >
    <p
      ><Icon icon="ant-design:info-circle-outlined" color="blue" />
      如若选择分类，校对顺序将按照该分类的顺序进行</p
    >
    <p
      ><Icon icon="ant-design:info-circle-outlined" color="blue" />
      如有错误，在文本框填写相应的错误信息，点击退回，错误内容将返回资源创建人。</p
    >
    <p
      ><Icon icon="ant-design:info-circle-outlined" color="blue" />
      当每个版面都没错误时，点击完成，完成当前校验任务。</p
    >
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Select, Input, Divider, Descriptions, Space } from 'ant-design-vue';
  import Icon from '/@/components/Icon/index';
  export default defineComponent({
    components: {
      ASpace: Space,
      [Descriptions.name]: Descriptions,
      [Descriptions.Item.name]: Descriptions.Item,
      [Select.name]: Select,
      [Input.name]: Input,
      [Input.Group.name]: Input.Group,
      [Divider.name]: Divider,
      Icon,
    },
    props: ['InfoData'],
    emits: ['next', 'prev'],
    setup(_, { emit }) {
      const loading = ref(false);
      const returnData = ref('');
      const confirm = () => {
        customResetFunc();
      };

      const cancel = () => {};

      async function customSubmitFunc() {
        try {
          emit('next');
        } catch (error) {}
      }
      async function customResetFunc() {
        loading.value = true;
        try {
          setTimeout(() => {
            emit('prev', returnData);
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
      return { customSubmitFunc, customResetFunc, returnData, onchange, loading, confirm, cancel };
    },
  });
</script>
<style lang="less" scoped>
  .step1 {
    &-form {
      width: 450px;
      margin: 0 auto;
    }

    h3 {
      margin: 0 0 12px;
      font-size: 16px;
      line-height: 32px;
      color: @text-color;
    }

    h4 {
      margin: 0 0 4px;
      font-size: 14px;
      line-height: 22px;
      color: @text-color;
    }

    p {
      color: @text-color;
    }
  }

  .pay-select {
    width: 20%;
  }

  .pay-input {
    width: 70%;
  }
</style>
