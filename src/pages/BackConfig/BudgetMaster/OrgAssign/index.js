import React, { PureComponent } from 'react';
import { trim, intersectionWith } from 'lodash';
import PropTypes from 'prop-types';
import { Input, Tree, Empty, Button, Popover } from 'antd';
import { ScrollBar, ListLoader, utils, ExtIcon, message } from 'suid';
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

  static loaded = false;

  static propTypes = {
    corpCode: PropTypes.string,
    onSelectChange: PropTypes.func,
    orgList: PropTypes.array,
    onOrgRef: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.loaded = false;
    const { orgList } = props;
    this.state = {
      orgShow: false,
      loading: false,
      treeData: [],
      expandedKeys: [],
      checkedKeys: orgList.map(it => it.id),
      autoExpandParent: true,
    };
  }

  componentDidMount() {
    const { onOrgRef } = this.props;
    onOrgRef(this);
  }

  componentDidUpdate() {
    const { corpCode } = this.props;
    const { orgShow, loading } = this.state;
    if (corpCode && orgShow && this.loaded === false && loading === false) {
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
    const { corpCode } = this.props;
    this.setState({ loading: true });
    const url = `${SERVER_PATH}/bems-v6/subject/findOrgTreeByCorpCode`;
    request({
      url,
      params: {
        corpCode,
      },
    })
      .then(res => {
        this.loaded = true;
        let treeData = [];
        let expandedKeys = [];
        message.destroy();
        if (res.success) {
          treeData = [res.data];
          expandedKeys = treeData.map(p => p.id);
          this.data = [...treeData];
          this.flatData = getFlatTree(this.data, childFieldKey, []);
        } else {
          message.error(res.message);
        }
        this.setState({ treeData, expandedKeys });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
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
        const { id, name, namePath } = it;
        return {
          name,
          namePath,
          id,
        };
      },
    );
    if (onSelectChange && onSelectChange instanceof Function) {
      onSelectChange(checkedData);
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

  renderTreeContent = () => {
    const { loading, treeData, expandedKeys, checkedKeys, autoExpandParent } = this.state;
    if (loading) {
      return <ListLoader />;
    }
    if (treeData.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    return (
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
    );
  };

  onVisibleChange = v => {
    this.setState({
      orgShow: v,
    });
    if (v === false) {
      this.loaded = false;
    }
  };

  renderOrgContent = () => {
    const { allValue } = this.state;
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
          <ScrollBar>{this.renderTreeContent()}</ScrollBar>
        </div>
      </div>
    );
  };

  render() {
    return (
      <Popover
        trigger="click"
        placement="rightTop"
        key="list-popover-box"
        destroyTooltipOnHide
        title="添加部门"
        onVisibleChange={this.onVisibleChange}
        overlayClassName={styles['list-popover-box']}
        content={this.renderOrgContent()}
      >
        <Button icon="plus" type="link">
          添加部门
        </Button>
      </Popover>
    );
  }
}

export default Organization;
