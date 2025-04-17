import type { TreeDataItem } from '@/types';

/**
 * 深拷贝
 * @param data
 */
export function cloneDeep<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * 树转数组
 * @param tree
 * @param hasChildren
 */
export function treeToList(tree: TreeDataItem[], hasChildren = false): TreeDataItem[] {
  let queen: TreeDataItem[] = [];
  const out: TreeDataItem[] = [];
  queen = queen.concat(JSON.parse(JSON.stringify(tree)));
  while (queen.length) {
    const first = queen.shift() as TreeDataItem;
    if (first?.children) {
      queen = queen.concat(first.children);
      if (!hasChildren) delete first.children;
    }
    out.push(first);
  }
  return out;
}

/**
 * 数组转树
 * @param list
 * @param tree
 * @param parent
 * @param key
 */
export function listToTree(
  list: TreeDataItem[],
  tree: TreeDataItem[],
  parent = 0,
  key = 'parent',
): TreeDataItem[] {
  list.forEach((item) => {
    if (item[key] === parent) {
      const child: TreeDataItem = {
        ...item,
        children: [],
      };
      listToTree(list, child.children as TreeDataItem[], item.id, key);
      if (!child.children?.length) delete child.children;
      tree.push(child);
    }
  });
  return tree;
}

/**
 * 获取树节点 key 列表
 * @param treeData
 */
export function getTreeKeys(treeData: TreeDataItem[]): string[] {
  const list = treeToList(treeData);
  return list.map((item) => item.key);
}

/**
 * 循环遍历出最深层子节点，存放在一个数组中
 * @param deepList
 * @param treeData
 */
export function getDeepList(deepList: string[], treeData: TreeDataItem[]): string[] {
  treeData?.forEach((item) => {
    if (item?.children?.length) {
      getDeepList(deepList, item.children);
    } else {
      deepList.push(item.key);
    }
  });
  return deepList;
}

/**
 * 将后台返回的含有父节点的数组和第一步骤遍历的数组做比较,如果有相同值，将相同值取出来，push到一个新数组中
 * @param uniqueArr
 * @param arr
 */
export function uniqueTree(uniqueArr: string[], arr: string[]): string[] {
  const uniqueChild = [];
  for (const i in arr) {
    for (const k in uniqueArr) {
      if (uniqueArr[k] === arr[i]) {
        uniqueChild.push(uniqueArr[k]);
      }
    }
  }
  return uniqueChild;
}

/**
 * 是否选中
 * @param selectedKeys
 * @param eventKey
 */
export function isChecked(selectedKeys: string[], eventKey: string): boolean {
  return selectedKeys.indexOf(eventKey) !== -1;
}

/**
 * 处理左侧树数据
 * @param data
 * @param targetKeys
 * @param direction
 */
export function handleLeftTreeData(
  data: TreeDataItem[],
  targetKeys: string[],
  direction = 'right',
): TreeDataItem[] {
  if (direction === 'right') {
    // 递归处理每个节点
    function processNode(node: TreeDataItem): boolean {
      if (!node.children || node.children.length === 0) {
        // 叶子节点：如果在 targetKeys 中，则禁用并返回 true
        const isSelected = targetKeys.includes(node.key);
        node.disabled = isSelected;
        return isSelected;
      }

      // 非叶子节点：检查所有子节点
      const childResults = node.children.map(processNode);
      const allChildrenSelected = childResults.every(Boolean);

      // 只有当所有子节点都被选中时，才禁用父节点
      // 当部分子节点被选中时，父节点保持半选状态并可操作
      node.disabled = allChildrenSelected;

      return allChildrenSelected;
    }

    data.forEach(processNode);
  } else if (direction === 'left') {
    // 获取包含所有父节点的完整 key 列表
    const allRelatedKeys = findAllRelatedKeys(data, targetKeys);

    function enableNodes(node: TreeDataItem) {
      if (node.disabled && allRelatedKeys.includes(node.key)) {
        node.disabled = false;
      }

      if (node.children) {
        node.children.forEach(enableNodes);
      }
    }

    data.forEach(enableNodes);
  }

  return data;
}
/**
 * 处理右侧树数据
 * @param data
 * @param targetKeys
 * @param direction
 */
export function handleRightTreeData(
  data: TreeDataItem[],
  targetKeys: string[],
  direction = 'right',
): TreeDataItem[] {
  // 获取包含所有父节点的完整 key 列表
  const allRelatedKeys = findAllRelatedKeys(data, targetKeys);

  const list = treeToList(data);
  const arr: TreeDataItem[] = [];
  const tree: TreeDataItem[] = [];

  list.forEach((item) => {
    if (direction === 'right') {
      // 使用完整的 key 列表检查节点是否应该包含
      if (allRelatedKeys.includes(item.key)) {
        const content = { ...item };
        if (content.children) delete content.children;
        arr.push({ ...content });
      }
    } else if (direction === 'left') {
      if (!allRelatedKeys.includes(item.key)) {
        const content = { ...item };
        if (content.children) delete content.children;
        arr.push({ ...content });
      }
    }
  });

  listToTree(arr, tree, 0);
  return tree;
}
/**
 * 树数据展平
 * @param list
 * @param dataSource
 */
export function flatten(list: TreeDataItem[], dataSource: TreeDataItem[]): TreeDataItem[] {
  list.forEach((item) => {
    dataSource.push(item);
    if (item.children) flatten(item.children, dataSource);
  });
  return dataSource;
}

/**
 * 查找所有父节点 key
 * @param data 树数据
 * @param leafKeys 叶子节点 key 数组
 * @returns 所有相关节点 key (包括叶子节点和它们的所有父节点)
 */
export function findAllRelatedKeys(data: TreeDataItem[], leafKeys: string[]): string[] {
  // 构建父节点映射
  const parentMap = new Map<string, string>();

  function buildParentMap(nodes: TreeDataItem[], parentKey?: string) {
    for (const node of nodes) {
      if (parentKey) {
        parentMap.set(node.key, parentKey);
      }
      if (node.children?.length) {
        buildParentMap(node.children, node.key);
      }
    }
  }

  buildParentMap(data);

  // 收集所有相关节点
  const allKeys = new Set<string>(leafKeys);

  for (const key of leafKeys) {
    let currentKey = key;
    while (parentMap.has(currentKey)) {
      const parentKey = parentMap.get(currentKey)!;
      allKeys.add(parentKey);
      currentKey = parentKey;
    }
  }

  return Array.from(allKeys);
}
