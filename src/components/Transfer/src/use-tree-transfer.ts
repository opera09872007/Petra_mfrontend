import { onMounted, reactive, watch } from 'vue';
import {
  cloneDeep,
  flatten,
  getDeepList,
  getTreeKeys,
  handleLeftTreeData,
  handleRightTreeData,
  isChecked,
  uniqueTree,
  findAllRelatedKeys,
} from './utils';
import type { TreeDataItem } from './types';

interface Props {
  /** 树数据 */
  treeData: TreeDataItem[];
  /** 编辑 key */
  editKey: string[];
}

interface State {
  /** 显示在右侧框数据的 key 集合 */
  targetKeys: string[];
  /** 数据源，其中的数据将会被渲染到左边一栏 */
  dataSource: TreeDataItem[];
  /** 左侧树选中 key 集合 */
  leftCheckedKey: string[];
  /** 左侧半选集合 */
  leftHalfCheckedKeys: string[];
  /** 左侧树选中的 key 集合，包括半选与全选 */
  leftCheckedAllKey: string[];
  /** 左侧树 */
  leftTreeData: TreeDataItem[];
  /** 右侧树选中集合 */
  rightCheckedKey: string[];
  /** 右侧树选中集合，包括半选与全选 */
  rightCheckedAllKey: string[];
  /** 右侧展开数集合 */
  rightExpandedKey: string[];
  /** 右侧树 */
  rightTreeData: TreeDataItem[];
  /** 往父级组件传递的数据 */
  emitKeys: string[];
  /** 深层列表 */
  deepList: string[];
}

interface UseTreeTransfer {
  state: State;
  /** 穿梭更改 */
  onChange: (targetKeys: string[], direction: string) => void;
  /** 左侧选择 */
  handleLeftChecked: (
    _: string[],
    { node, halfCheckedKeys }: any,
    checkedKeys: any,
    itemSelect: (arg0: any, arg1: boolean) => void,
  ) => void;
  /** 右侧选择 */
  handleRightChecked: (
    _: string[],
    { node, halfCheckedKeys }: any,
    checkedKeys: any,
    itemSelect: (arg0: any, arg1: boolean) => void,
  ) => void;
}

export function useTreeTransfer(props: Props): UseTreeTransfer {
  const state = reactive<State>({
    targetKeys: [],
    dataSource: [],
    leftCheckedKey: [],
    leftHalfCheckedKeys: [],
    leftCheckedAllKey: [],
    leftTreeData: [],
    rightCheckedKey: [],
    rightCheckedAllKey: [],
    rightExpandedKey: [],
    rightTreeData: [],
    emitKeys: [],
    deepList: [],
  });

  watch(props, () => {
    processEditData();
  });

  onMounted(() => {
    processTreeData();
  });

  /** 处理树数据 */
  function processTreeData(): void {
    flatten(cloneDeep(props.treeData), state.dataSource);
    if (props.editKey.length) {
      processEditData();
    } else {
      state.leftTreeData = handleLeftTreeData(cloneDeep(props.treeData), state.leftCheckedKey);
    }
  }

  /** 处理编辑数据 */
  function processEditData(): void {
    const allRelatedKeys = findAllRelatedKeys(props.treeData, props.editKey);
    state.leftCheckedAllKey = allRelatedKeys;
    state.rightExpandedKey = allRelatedKeys;
    state.targetKeys = allRelatedKeys;
    state.rightTreeData = handleRightTreeData(cloneDeep(props.treeData), props.editKey);

    getDeepList(state.deepList, props.treeData);

    state.leftCheckedKey = uniqueTree(props.editKey, state.deepList);
    state.leftHalfCheckedKeys = state.leftCheckedAllKey.filter(
      (item) => state.leftCheckedKey.indexOf(item) === -1,
    );
    state.leftTreeData = handleLeftTreeData(cloneDeep(props.treeData), state.leftCheckedKey);

    state.emitKeys = state.rightExpandedKey;
  }

  /** 穿梭更改 */
  function onChange(targetKeys: string[], direction: string) {
    if (direction === 'right') {
      state.targetKeys = state.leftCheckedAllKey;
      state.rightCheckedKey = [];
      state.rightTreeData = handleRightTreeData(
        cloneDeep(props.treeData),
        state.leftCheckedAllKey,
        'right',
      );
      state.leftTreeData = handleLeftTreeData(
        cloneDeep(props.treeData),
        state.leftCheckedKey,
        'right',
      );
    } else if (direction === 'left') {
      state.rightTreeData = handleRightTreeData(state.rightTreeData, state.rightCheckedKey, 'left');
      state.leftTreeData = handleLeftTreeData(state.leftTreeData, state.rightCheckedKey, 'left');
      state.leftCheckedKey = state.leftCheckedKey.filter(
        (item) => state.rightCheckedKey.indexOf(item) === -1,
      );
      state.targetKeys = state.targetKeys.filter(
        (item) => state.rightCheckedKey.indexOf(item) === -1,
      );
      state.leftHalfCheckedKeys = state.leftHalfCheckedKeys.filter(
        (item) => state.rightCheckedKey.indexOf(item) === -1,
      );
      state.rightCheckedKey = [];
    }
    state.rightExpandedKey = getTreeKeys(state.rightTreeData);
    state.emitKeys = state.rightExpandedKey;
  }

  /** 左侧选择 */
  function handleLeftChecked(
    _: string[],
    { node, halfCheckedKeys }: any,
    checkedKeys: any,
    itemSelect: (arg0: any, arg1: boolean) => void,
  ): void {
    state.leftCheckedKey = _;
    state.leftHalfCheckedKeys = [...new Set([...state.leftHalfCheckedKeys, ...halfCheckedKeys])];
    state.leftCheckedAllKey = [
      ...new Set([...state.leftHalfCheckedKeys, ...halfCheckedKeys, ..._]),
    ];
    const { eventKey } = node;
    itemSelect(eventKey, !isChecked(checkedKeys, eventKey));
  }

  /** 右侧选择 */
  function handleRightChecked(
    _: string[],
    { node, halfCheckedKeys }: any,
    checkedKeys: any,
    itemSelect: (arg0: any, arg1: boolean) => void,
  ): void {
    state.rightCheckedKey = _;
    state.rightCheckedAllKey = [...halfCheckedKeys, ..._];
    const { eventKey } = node;
    itemSelect(eventKey, isChecked(_, eventKey));
  }

  return {
    state,

    onChange,
    handleLeftChecked,
    handleRightChecked,
  };
}
