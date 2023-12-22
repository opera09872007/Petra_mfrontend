<template>
  <CollapseContainer title="安全设置" :canExpan="false">
    <List v-if="list.length > 0">
      <template v-for="item in list" :key="item.key">
        <ListItem>
          <ListItemMeta>
            <template #title>
              {{ item.title }}
              <div class="extra" v-if="item.extra" :onClick="onClick.bind(null, item)">
                {{ item.extra }}
              </div>
            </template>
            <template #description>
              <div>{{ item.description }}</div>
            </template>
          </ListItemMeta>
        </ListItem>
      </template>
    </List>
  </CollapseContainer>
  <PasswordModal @register="registerModal" />
</template>
<script lang="ts">
  import { List } from 'ant-design-vue';
  import { defineComponent } from 'vue';
  import { CollapseContainer } from '/@/components/Container/index';

  import { secureSettingList } from './data';
  import { useUserStore } from '/@/store/modules/user';
  import { useModal } from '/@/components/Modal';
  import PasswordModal from './PasswordModal.vue';

  export default defineComponent({
    components: {
      CollapseContainer,
      List,
      ListItem: List.Item,
      ListItemMeta: List.Item.Meta,
      PasswordModal,
    },

    setup() {
      const userStore = useUserStore();
      const [registerModal, { openModal }] = useModal();
      function onClick(value) {
        if (value.key == 1) {
          openModal(true, {});
        }
      }
      secureSettingList[1]['description'] =
        '已绑定手机：：' + userStore.getUserInfo.mobile.replace(/(\w{3})\w*(\w{4})/, '$1****$2');
      secureSettingList[3]['description'] =
        '已绑定邮箱：：' + userStore.getUserInfo.email.replace(/(\w{0})\w*(\w{0})/, '$1****$2');
      return {
        list: secureSettingList,
        onClick,
        registerModal,
      };
    },
  });
</script>
<style lang="less" scoped>
  .extra {
    float: right;
    margin-top: 10px;
    margin-right: 30px;
    font-weight: normal;
    color: #1890ff;
    cursor: pointer;
  }
</style>
