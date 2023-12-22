<template>
  <div class="m-4 mr-0 overflow-hidden bg-white">
    <BasicTree
      title="资源库列表"
      toolbar
      v-if="treeData.length"
      :treeData="treeData"
      search
      :clickRowToExpand="false"
      :defaultExpandAll="true"
      :fieldNames="{ key: 'id', title: 'title' }"
      @select="handleSelect"
      treeNodeFilterProp="title"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';

  import { BasicTree, TreeItem } from '/@/components/Tree';
  import { getRepositoryTree } from '/@/api/data/repository';

  export default defineComponent({
    name: 'ResTree',
    components: { BasicTree },

    emits: ['select'],
    setup(_, { emit }) {
      const treeData = ref<TreeItem[]>([]);

      async function fetch() {
        treeData.value = (await getRepositoryTree()) as unknown as TreeItem[];
      }

      function handleSelect(keys) {
        emit('select', keys[0]);
      }

      onMounted(() => {
        fetch();
      });
      return { treeData, handleSelect };
    },
  });
</script>
