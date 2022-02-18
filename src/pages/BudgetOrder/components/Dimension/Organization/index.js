import React, { PureComponent } from 'react';
import { trim, isEqual, uniq, intersectionWith, get, without, uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import { Input, Tree, Checkbox, Button } from 'antd';
import { ScrollBar, ListLoader, utils, ExtIcon, Space } from 'suid';
import { constants, getAllChildIdsByNode } from '@/utils';
import styles from './index.less';

const { Search } = Input;
const { TreeNode } = Tree;
const childFieldKey = 'children';
const hightLightColor = '#f50';
const { request, getFlatTree } = utils;
const { SERVER_PATH } = constants;

class Organization extends PureComponent {
  static allValue = '';

  static data = [];

  static flatData = [];

  static propTypes = {
    subjectId: PropTypes.string,
    onSelectChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      treeData: [],
      expandedKeys: [],
      checkedKeys: [],
      autoExpandParent: true,
    };
  }

  componentDidMount() {
    this.getTreeData();
  }

  componentDidUpdate(preProps) {
    const { subjectId } = this.props;
    if (subjectId && !isEqual(preProps.subjectId, subjectId)) {
      this.getTreeData();
    }
  }

  getTreeData = () => {
    const { subjectId } = this.props;
    if (subjectId) {
      this.setState({ loading: true });
      const url = `${SERVER_PATH}/bems-v6/dimensionComponent/getOrgTree`;
      request({
        url,
        params: {
          subjectId,
        },
      }).then(res => {
        let treeData = [];
        let expandedKeys = [];
        if (res.success) {
          treeData = res.data;
          expandedKeys = treeData.map(p => p.id);
          this.data = [...treeData];
          this.flatData = getFlatTree(this.data, childFieldKey, []);
        }
        this.setState({ treeData, expandedKeys, loading: false });
      });
    }
  };

  filterNodes = (valueKey, tree, expKeys) => {
    const newArr = [];
    tree.forEach(treeNode => {
      const nodeChildren = treeNode[childFieldKey];
      const fieldValue = treeNode.name;
      if (fieldValue.toLowerCase().indexOf(valueKey) > -1) {
        newArr.push(treeNode);
        expKeys.push(treeNode.id);
      } else if (nodeChildren && nodeChildren.length > 0) {
        const ab = this.filterNodes(valueKey, nodeChildren, expKeys);
        const obj = {
          ...treeNode,
          [childFieldKey]: ab,
        };
        if (ab && ab.length > 0) {
          newArr.push(obj);
        }
      }
    });
    return newArr;
  };

  getLocalFilterData = () => {
    const { expandedKeys: expKeys } = this.state;
    let newData = [...this.data];
    const expandedKeys = [...expKeys];
    const searchValue = this.allValue;
    if (searchValue) {
      newData = this.filterNodes(searchValue.toLowerCase(), newData, expandedKeys);
    }
    return { treeData: newData, expandedKeys };
  };

  handlerSearchChange = v => {
    this.allValue = trim(v);
  };

  handlerPressEnter = () => {
    this.handlerSearch(this.allValue);
  };

  handlerSearch = v => {
    this.allValue = trim(v);
    const { treeData, expandedKeys } = this.getLocalFilterData();
    this.setState({
      treeData,
      expandedKeys,
      autoExpandParent: true,
    });
  };

  handlerExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  triggerSelectChange = keys => {
    const { onSelectChange } = this.props;
    const checkedData = intersectionWith(this.flatData, keys, (o, orgId) => o.id === orgId).map(
      it => {
        const { id, name } = it;
        return {
          text: name,
          value: id,
        };
      },
    );
    if (onSelectChange && onSelectChange instanceof Function) {
      onSelectChange(checkedData);
    }
  };

  handlerCheck = (chkKeys, e) => {
    const { checked: nodeChecked } = e;
    const { checked: checkedKeys } = chkKeys;
    const nodeId = get(e, 'node.props.eventKey', null) || null;
    let originCheckedKeys = [...checkedKeys];
    const cids = getAllChildIdsByNode(this.data, nodeId);
    if (nodeChecked) {
      // 选中：所有子节点选中
      originCheckedKeys.push(...cids);
    } else {
      // 取消：父节点状态不变，所有子节点取消选中
      originCheckedKeys = without(originCheckedKeys, [nodeId]);
    }
    const keys = uniqBy([...originCheckedKeys], id => id);
    this.setState({ checkedKeys: uniq(keys) });
    this.triggerSelectChange(keys);
  };

  renderTreeNodes = treeData => {
    const searchValue = this.allValue || '';
    return treeData.map(item => {
      const readerValue = item.name;
      const readerChildren = item[childFieldKey];
      const i = readerValue.toLowerCase().indexOf(searchValue.toLowerCase());
      const beforeStr = readerValue.substr(0, i);
      const afterStr = readerValue.substr(i + searchValue.length);
      const title =
        i > -1 ? (
          <span>
            {beforeStr}
            <span style={{ color: hightLightColor }}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{readerValue}</span>
        );
      if (readerChildren && readerChildren.length > 0) {
        return (
          <TreeNode orgId={item.id} orgName={item.name} title={title} key={item.id}>
            {this.renderTreeNodes(readerChildren)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          orgId={item.id}
          orgName={item.name}
          switcherIcon={<ExtIcon type="dian" style={{ fontSize: 12 }} />}
          title={title}
          key={item.id}
        />
      );
    });
  };

  handlerSelectAll = e => {
    let checkedKeys = [];
    if (e.target.checked) {
      const { treeData } = this.state;
      const allData = getFlatTree(treeData);
      checkedKeys = allData.map(it => it.id);
    } else {
      checkedKeys = [];
    }
    this.setState({ checkedKeys });
    this.triggerSelectChange(checkedKeys);
  };

  handlerOnlySelect = level => {
    let checkedKeys = [];
    const { expandedKeys: expKeys } = this.state;
    const expandedKeys = [...expKeys];
    if (level === 1) {
      checkedKeys = this.data.map(it => it.id);
    }
    if (level === 2) {
      this.data.forEach(root => {
        const rootNodeLevel = get(root, 'nodeLevel');
        const childrenData = get(root, childFieldKey) || [];
        const targetLevel = rootNodeLevel + 1;
        const treeData = getFlatTree(childrenData, childFieldKey, []);
        const keys = treeData.filter(it => it.nodeLevel === targetLevel).map(it => it.id);
        treeData
          .filter(it => it.nodeLevel < targetLevel)
          .forEach(it => {
            expandedKeys.push(it.id);
          });
        checkedKeys = checkedKeys.concat(keys);
      });
    } else if (level === 3) {
      this.data.forEach(root => {
        const rootNodeLevel = get(root, 'nodeLevel');
        const childrenData = get(root, childFieldKey) || [];
        const targetLevel = rootNodeLevel + 2;
        const treeData = getFlatTree(childrenData, childFieldKey, []);
        const keys = treeData.filter(it => it.nodeLevel === targetLevel).map(it => it.id);
        treeData
          .filter(it => it.nodeLevel < targetLevel)
          .forEach(it => {
            expandedKeys.push(it.id);
          });
        checkedKeys = checkedKeys.concat(keys);
      });
    } else if (level === -1) {
      const treeData = getFlatTree(this.data, childFieldKey, []);
      const keys = treeData.filter(it => it[childFieldKey] === null).map(it => it.id);
      treeData
        .filter(it => it[childFieldKey] !== null)
        .forEach(it => {
          expandedKeys.push(it.id);
        });
      checkedKeys = checkedKeys.concat(keys);
    }
    this.setState({ checkedKeys, expandedKeys });
    this.triggerSelectChange(checkedKeys);
  };

  render() {
    const { loading, allValue, treeData, expandedKeys, checkedKeys, autoExpandParent } = this.state;
    const allData = getFlatTree(treeData);
    const indeterminate = checkedKeys.length > 0 && checkedKeys.length < allData.length;
    const checked = checkedKeys.length > 0 && checkedKeys.length === allData.length;
    return (
      <div className={styles['container-box']}>
        <div className="header-tool-box">
          <div className="action-tool">
            <Space>
              <Checkbox
                disabled={allData.length === 0}
                checked={checked}
                indeterminate={indeterminate}
                onChange={this.handlerSelectAll}
              >
                全选
              </Checkbox>
              <Button size="small" onClick={() => this.handlerOnlySelect(1)}>
                仅选一级
              </Button>
              <Button size="small" onClick={() => this.handlerOnlySelect(2)}>
                仅选二级
              </Button>
              <Button size="small" onClick={() => this.handlerOnlySelect(3)}>
                仅选三级
              </Button>
              <Button size="small" onClick={() => this.handlerOnlySelect(-1)}>
                仅选末级
              </Button>
            </Space>
          </div>
          <Search
            allowClear
            placeholder="输入名称关键字查询"
            defaultValue={allValue}
            onChange={e => this.handlerSearchChange(e.target.value)}
            onSearch={this.handlerSearch}
            onPressEnter={this.handlerPressEnter}
            style={{ width: 260 }}
          />
        </div>
        <div className="tree-body">
          <ScrollBar>
            {loading ? (
              <ListLoader />
            ) : (
              <Tree
                checkable
                checkStrictly
                selectable={false}
                blockNode
                autoExpandParent={autoExpandParent}
                checkedKeys={checkedKeys}
                expandedKeys={expandedKeys}
                switcherIcon={<ExtIcon type="down" antd style={{ fontSize: 12 }} />}
                onCheck={this.handlerCheck}
                onExpand={this.handlerExpand}
              >
                {this.renderTreeNodes(treeData)}
              </Tree>
            )}
          </ScrollBar>
        </div>
      </div>
    );
  }
}

export default Organization;
