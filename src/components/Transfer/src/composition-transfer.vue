<template>
  <a-spin :spinning="loading">
    <a-transfer
      :data-source="dataSource"
      :target-keys="targetKeys"
      :render="(item) => item.title"
      :show-select-all="false"
      @change="onChange"
      :list-style="{
        background: 'white',
        overflow: 'auto',
        maxHeight: '750px',
      }"
      :disabled="disabled"
      :operations="['添加', '移除']"
      :operation-props="{
        leftDisabled: leftCheckedKey.length === 0,
        rightDisabled: rightCheckedKey.length === 0,
      }"
    >
      <template #children="{ direction, selectedKeys, onItemSelect }">
        <template v-if="direction === 'left'">
          <a-tree
            v-if="leftTreeData.length"
            blockNode
            checkable
            defaultExpandAll
            :tree-data="leftTreeData"
            :checked-keys="leftCheckedKey"
            :height="400"
            :virtual="true"
            @check="
              (_, props) => {
                handleLeftChecked(_, props, [...selectedKeys, ...targetKeys], onItemSelect);
              }
            "
          />
          <a-empty v-else>
            <template #description>暂无数据</template>
          </a-empty>
        </template>
        <template v-else-if="direction === 'right'">
          <a-tree
            v-if="rightTreeData.length"
            blockNode
            checkable
            defaultExpandAll
            :tree-data="rightTreeData"
            v-model:checked-keys="rightCheckedKey"
            v-model:expanded-keys="rightExpandedKey"
            :height="400"
            :virtual="true"
            @check="
              (_, props) => {
                handleRightChecked(_, props, [...selectedKeys, ...targetKeys], onItemSelect);
              }
            "
          />
          <a-empty v-else>
            <template #description>暂无数据</template>
          </a-empty>
        </template>
      </template>
    </a-transfer></a-spin
  >
</template>

<script lang="ts">
  import { defineComponent, PropType, toRefs } from 'vue';
  import { useTreeTransfer } from './use-tree-transfer';
  import type { TreeDataItem } from './types';

  import { Tree, Empty, Transfer, Spin } from 'ant-design-vue';
  export default defineComponent({
    name: 'CompositionTransfer',
    components: { AEmpty: Empty, ATree: Tree, ATransfer: Transfer, ASpin: Spin },
    props: {
      /** 树数据 */
      treeData: {
        type: Array as PropType<TreeDataItem[]>,
        default: () => [],
      },
      /** 编辑 key */
      editKey: {
        type: Array as PropType<string[]>,
        default: () => [],
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const { state, onChange, handleLeftChecked, handleRightChecked } = useTreeTransfer(props);

      return {
        ...toRefs(state),

        onChange,
        handleLeftChecked,
        handleRightChecked,
      };
    },
  });
</script>

<style scoped lang="less">
  .ant-transfer {
    ::v-deep(.ant-transfer-list) {
      width: 500px;
    }

    ::v-deep(.ant-transfer-list-body) {
      overflow: auto;
    }
  }
</style>
