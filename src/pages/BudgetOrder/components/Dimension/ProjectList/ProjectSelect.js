import React, { Component } from 'react';
import cls from 'classnames';
import { trim } from 'lodash';
import PropTypes from 'prop-types';
import { Button, Input, Drawer } from 'antd';
import { ListCard } from 'suid';
import { constants } from '@/utils';
import styles from './ProjectSelect.less';

const { SERVER_PATH } = constants;
const { Search } = Input;

class ProjectSelect extends Component {
  static listCardRef;

  static searchValue;

  static propTypes = {
    subjectId: PropTypes.string,
    showAssign: PropTypes.bool,
    closeAssign: PropTypes.func,
    assign: PropTypes.func,
    excludeIds: PropTypes.array,
  };

  handlerAssign = (e, item) => {
    if (e) e.stopPropagation();
    const { assign } = this.props;
    if (assign) {
      assign(item);
    }
  };

  handlerClose = () => {
    const { closeAssign } = this.props;
    if (closeAssign) {
      closeAssign();
    }
  };

  reloadData = () => {
    if (this.listCardRef) {
      this.listCardRef.remoteDataRefresh();
    }
  };

  handlerSearchChange = v => {
    this.searchValue = trim(v);
  };

  handlerPressEnter = () => {
    this.reloadData();
  };

  handlerSearch = v => {
    this.searchValue = trim(v);
    this.reloadData();
  };

  renderCustomTool = () => {
    return (
      <>
        <Search
          placeholder="输入代码、名称关键字查询"
          onChange={e => this.handlerSearchChange(e.target.value)}
          onSearch={this.handlerSearch}
          onPressEnter={this.handlerPressEnter}
          style={{ width: '100%' }}
        />
      </>
    );
  };

  render() {
    const { showAssign, subjectId, excludeIds } = this.props;
    const listCardProps = {
      showSearch: false,
      showArrow: false,
      itemField: {
        title: item => item.name,
        description: item => item.code,
        extra: item => (
          <Button ghost type="primary" size="small" onClick={e => this.handlerAssign(e, item)}>
            添加
          </Button>
        ),
      },
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/bems-v6/dimensionComponent/getProjects`,
      },
      cascadeParams: {
        subjectId,
        searchValue: this.searchValue,
        excludeIds,
      },
      onListCardRef: ref => (this.listCardRef = ref),
      customTool: this.renderCustomTool,
    };
    return (
      <Drawer
        width={460}
        destroyOnClose
        getContainer={false}
        placement="right"
        visible={showAssign}
        title="项目列表"
        className={cls(styles['list-box'])}
        onClose={this.handlerClose}
        style={{ position: 'absolute' }}
      >
        <ListCard {...listCardProps} />
      </Drawer>
    );
  }
}

export default ProjectSelect;
