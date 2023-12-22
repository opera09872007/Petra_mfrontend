<template>
  <Card title="项目" v-bind="$attrs">
    <template #extra>
      <a-button type="link" size="small">更多</a-button>
    </template>

    <CardGrid v-for="item in items" :key="item" class="width: 25%; text-align: center">
      <Popconfirm
        title="确认选择为当前项目?"
        ok-text="确认"
        cancel-text="取消"
        @confirm="ChoseItem(item.id)"
      >
        <span class="flex">
          <Icon icon="ant-design:read-outlined" size="30" />
          <span class="text-lg ml-4">{{ item.title }}</span>
        </span>
        <div class="flex mt-2 h-10 text-secondary">{{ item.memo }}</div>
        <div class="flex justify-between text-secondary">
          <span v-if="item.id == now_work_repository"><font color="#3fb27f">当前项目</font></span>
          <span>{{ item.create_time }}</span>
        </div>
      </Popconfirm>
    </CardGrid>
  </Card>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Card, Popconfirm } from 'ant-design-vue';
  import { Icon } from '/@/components/Icon';
  import { getRepositoryList, setUserRepApi } from '/@/api/data/repository';
  import { useUserStore } from '/@/store/modules/user';
  const now_work_repository = ref(-1);
  export default defineComponent({
    components: { Card, CardGrid: Card.Grid, Icon, Popconfirm },
    setup() {
      const items = ref({});
      const getData = async () => {
        const res = await getRepositoryList();
        items.value = res;
      };
      getData();
      now_work_repository.value = Number(useUserStore().getUserInfo.now_work_repository);

      return { items: items, now_work_repository };
    },
    methods: {
      async ChoseItem(id) {
        const res = await setUserRepApi(id);
        now_work_repository.value = res.now_work_repository;
        useUserStore().getUserInfoAction();
      },
    },
  });
</script>
