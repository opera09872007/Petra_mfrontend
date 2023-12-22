<template>
  <PageWrapper :title="`用户` + tableData.name + `的资料`" contentBackground @back="goBack">
    <template #extra>
      <a-button type="primary" v-if="tableData.is_active == 1" danger @click="disabledAccount">
        禁用账号
      </a-button>
      <a-button
        type="primary"
        v-if="tableData.is_active == 0"
        color="success"
        @click="disabledAccount"
      >
        启用账号
      </a-button>
    </template>
    <template #footer>
      <a-tabs default-active-key="detail" v-model:activeKey="currentKey">
        <a-tab-pane key="detail" tab="用户资料" />
        <a-tab-pane key="logs" tab="操作日志" />
      </a-tabs>
    </template>
    <div class="pt-4 m-4 desc-wrap">
      <template v-if="currentKey == 'detail'">
        <div>用户名：{{ tableData.username }}</div>
        <div>用户姓名：{{ tableData.name }}</div>
        <div>用户昵称：{{ tableData.nick_name }}</div>
        <div>用户地址：{{ tableData.address }}</div>
        <div>手机号码：{{ tableData.mobile }}</div>
        <div>用户部门：{{ tableData.organization_name }}</div>
        <div>用户角色：{{ tableData.role_name }}</div>
        <div>加入时间：{{ tableData.date_joined }}</div>
        <div v-if="tableData.is_verified == 0">验证状态：未验证</div>
        <div v-if="tableData.is_verified == 1">验证状态：已验证</div>
        <div v-if="tableData.is_active == 0">账号状态：已停用</div>
        <div v-if="tableData.is_active == 1">账号状态：已启用</div>
      </template>
      <template v-if="currentKey == 'logs'">
        <div v-for="i in 20" :key="i">操作日志Tab{{ i }}</div>
      </template>
    </div>
  </PageWrapper>
</template>

<script>
  import { defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { useGo } from '/@/hooks/web/usePage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { Tabs } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { h } from 'vue';
  import { disableAccountApi, accountDetailApi } from '/@/api/account';

  export default defineComponent({
    name: 'AccountDetail',
    components: { PageWrapper, ATabs: Tabs, ATabPane: Tabs.TabPane },
    setup() {
      const route = useRoute();
      const go = useGo();
      // 此处可以得到用户ID
      const userId = ref(route.params?.id);
      const currentKey = ref('detail');
      const { setTitle } = useTabs();
      const tableData = ref([]);
      const getData = async () => {
        const res = await accountDetailApi(userId.value);
        if (res) {
          tableData.value = res;
          setTitle('详情：用户' + tableData.value.name);
        }
      };
      getData();

      // 页面左侧点击返回链接时的操作
      function goBack() {
        go('/system/account');
      }
      return { userId, currentKey, goBack, tableData, getData };
    },

    methods: {
      async disable(userId) {
        console.log(userId);
        try {
          const res = await disableAccountApi(userId);
          if (res) {
            if (res) {
              this.tableData.is_active = res.is_active;
            }
          }
        } catch {
          console.log('操作失败');
        }
      },
      disabledAccount() {
        const { createConfirm } = useMessage();
        const { t } = useI18n();
        createConfirm({
          iconType: 'warning',
          title: () => h('span', t('sys.app.logoutTip')),
          content: () => h('span', t('routes.basic.disabledAccount')),
          onOk: async () => {
            await this.disable(this.userId);
          },
        });
      },
    },
  });
</script>

<style></style>
