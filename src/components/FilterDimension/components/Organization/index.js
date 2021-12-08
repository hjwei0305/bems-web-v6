import React, { PureComponent } from 'react';
import { trim, isEqual, intersectionWith } from 'lodash';
import PropTypes from 'prop-types';
import { Input, Tree } from 'antd';
import { ScrollBar, ListLoader, utils, ExtIcon } from 'suid';
import { constants } from '@/utils';
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
    orgRef: PropTypes.object,
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
    const { orgRef } = this.props;
    orgRef.current = this;
    this.getTreeData();
  }

  componentDidUpdate(preProps) {
    const { subjectId } = this.props;
    if (subjectId && !isEqual(preProps.subjectId, subjectId)) {
      this.getTreeData();
    }
  }

  clearData = () => {
    const { onSelectChange } = this.props;
    if (onSelectChange && onSelectChange instanceof Function) {
      onSelectChange([]);
    }
    this.setState({ checkedKeys: [] });
  };

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

  handlerCheck = checkedKeys => {
    const { onSelectChange } = this.props;
    this.setState({ checkedKeys });
    const { checked } = checkedKeys;
    const checkedData = intersectionWith(this.flatData, checked, (o, orgId) => o.id === orgId).map(
      it => {
        const { id, name } = it;
        return {
          text: name,
          value: id,
        };
      },
    );
    if (onSelectChange && onSelectChange instanceof Function) {
      onSelectChange(checkedData.map(it => it.value));
    }
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

  render() {
    const { loading, allValue, treeData, expandedKeys, checkedKeys, autoExpandParent } = this.state;
    return (
      <div className={styles['container-box']}>
        <div className="header-tool-box">
          <Search
            allowClear
            placeholder="输入名称关键字查询"
            defaultValue={allValue}
            onChange={e => this.handlerSearchChange(e.target.value)}
            onSearch={this.handlerSearch}
            onPressEnter={this.handlerPressEnter}
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
