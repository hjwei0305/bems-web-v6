import React, { PureComponent } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import QueueAnim from 'rc-queue-anim';
import PropTypes from 'prop-types';
import { Button, Popconfirm, Tabs, Result, Empty } from 'antd';
import { ExtIcon, Space } from 'suid';
import empty from '@/assets/not_done.svg';
import Tip from '../../../components/Tip';
import Subject from '../../../components/Dimension/Subject';
import Period from '../../../components/Dimension/Period';
import styles from './index.less';

const { TabPane } = Tabs;

class DimensionSelection extends PureComponent {
  static dimensionData = {};

  static propTypes = {
    headData: PropTypes.object,
    dimensions: PropTypes.array,
    save: PropTypes.func,
    saving: PropTypes.bool,
    show: PropTypes.bool,
    onTriggerBack: PropTypes.func,
  };

  static defaultProps = {
    dimensions: [],
  };

  constructor(props) {
    super(props);
    const { dimensions = [] } = props;
    this.dimensionData = {};
    dimensions.forEach(d => {
      this.dimensionData[d.code] = [];
    });
    this.state = {
      zIndex: -1,
    };
  }

  componentDidUpdate() {
    const { show } = this.props;
    if (show === true) {
      this.setState({
        zIndex: 9,
      });
    }
  }

  handlerSelectChange = (key, items) => {
    this.dimensionData[key] = items;
    this.forceUpdate();
  };

  handlerTriggerBack = () => {
    const { onTriggerBack } = this.props;
    if (onTriggerBack && onTriggerBack instanceof Function) {
      this.dimensionData = {};
      onTriggerBack();
    }
  };

  handlerSave = () => {
    const { save } = this.props;
    if (save && save instanceof Function) {
      save(this.dimensionData, () => {
        this.dimensionData = {};
      });
    }
  };

  handlerEnd = ({ type }) => {
    if (type === 'leave') {
      this.setState({ zIndex: -1 });
    }
  };

  renderDimension = () => {
    const { dimensions, headData } = this.props;
    if (dimensions.length > 0) {
      const subjectId = get(headData, 'subjectId');
      const periodType = get(headData, 'periodType');
      return (
        <Tabs animated={false} className="tab-item-box">
          {dimensions.map(d => {
            const { code, name, uiComponent } = d;
            const dimensionData = this.dimensionData[d.code] || [];
            switch (uiComponent) {
              case 'Subject':
                return (
                  <TabPane tab={`${name}(${dimensionData.length})`} key={code}>
                    <Subject
                      subjectId={subjectId}
                      onSelectChange={items => this.handlerSelectChange(code, items)}
                    />
                  </TabPane>
                );
              case 'Period':
                return (
                  <TabPane tab={`${name}(${dimensionData.length})`} key={code}>
                    <Period
                      subjectId={subjectId}
                      periodType={periodType}
                      onSelectChange={items => this.handlerSelectChange(code, items)}
                    />
                  </TabPane>
                );
              default:
                return (
                  <TabPane tab={name} key={uiComponent}>
                    <div className="blank-empty">
                      <Empty image={empty} description={`未实现【${name}】维度组件`} />
                    </div>
                  </TabPane>
                );
            }
          })}
        </Tabs>
      );
    }
  };

  render() {
    const { zIndex } = this.state;
    const { show, onTriggerBack, dimensions, saving } = this.props;
    return (
      <QueueAnim
        className={cls(styles['container-box'])}
        onEnd={this.handlerEnd}
        style={{ zIndex }}
      >
        {show
          ? [
              <div className="head-box" key="head">
                <div className="title-box">
                  <Popconfirm
                    disabled={saving}
                    title={<Tip topic="确定要返回吗？" description="选择的数据将会丢失!" />}
                    onConfirm={this.handlerTriggerBack}
                  >
                    <ExtIcon type="left" antd className="trigger-back" />
                  </Popconfirm>
                  <span className="title">选择维度要素</span>
                </div>
                <div className="tool-box">
                  <Space>
                    <Popconfirm
                      disabled={saving}
                      title={<Tip topic="确定要返回吗？" description="选择的数据将会丢失!" />}
                      onConfirm={this.handlerTriggerBack}
                    >
                      <Button size="small" disabled={saving}>
                        返回
                      </Button>
                    </Popconfirm>
                    <Button type="primary" size="small" loading={saving} onClick={this.handlerSave}>
                      保存
                    </Button>
                  </Space>
                </div>
              </div>,
              <div className="body-content" key="body">
                {dimensions.length > 0 ? (
                  this.renderDimension()
                ) : (
                  <Result
                    title="当前预算类型未配置预算维度"
                    extra={
                      <Button type="primary" onClick={onTriggerBack}>
                        返回
                      </Button>
                    }
                  />
                )}
              </div>,
            ]
          : null}
      </QueueAnim>
    );
  }
}

export default DimensionSelection;
