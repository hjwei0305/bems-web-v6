import React, { Component } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { BarCode } from 'suid';
import { OrderSlider } from '@/components';
import { userUtils, constants } from '@/utils';
import RequestViewState from '../../../components/RequestViewState';
import Action from './Action';
import styles from './index.less';

const { getCurrentUser } = userUtils;
const { REQUEST_ORDER_ACTION } = constants;

class Banner extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    headData: PropTypes.object,
    actionProps: PropTypes.object,
    onSliderChange: PropTypes.func,
  };

  renderStatus = () => {
    const { headData } = this.props;
    if (headData) {
      return <RequestViewState enumName={get(headData, 'status')} />;
    }
    return null;
  };

  handlerSliderChange = v => {
    const { onSliderChange } = this.props;
    onSliderChange(v);
  };

  render() {
    const { title, headData, actionProps } = this.props;
    const { action } = actionProps;
    const user = getCurrentUser();
    return (
      <div className={cls('suid-banner', styles['banner-box'], 'horizontal')}>
        {action === REQUEST_ORDER_ACTION.ADD ||
        action === REQUEST_ORDER_ACTION.EDIT ||
        action === REQUEST_ORDER_ACTION.VIEW ? (
          <OrderSlider onChange={this.handlerSliderChange} />
        ) : null}
        <div className="banner-content row-start horizontal">
          <BarCode
            text={get(headData, 'code') || 'No.-'}
            textAlign="left"
            height={42}
            width={0.92}
            wrapperClassName="bar-code"
          />
          <div className="banner-detail vertical">
            <div className="title">
              {title}
              <span className="status">{this.renderStatus()}</span>
            </div>
            <div className="sub-title">
              <span className="title-item">
                <span className="label">制单人</span>
                <span className="creator">
                  {get(headData, 'creatorName') || get(user, 'userName')}
                </span>
              </span>
              <span className="title-item">
                <span className="label">制单时间</span>
                <span className="creator-datetime">{get(headData, 'createdDate', '-')}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="banner-action">
          <Action headData={headData} {...actionProps} />
        </div>
      </div>
    );
  }
}

export default Banner;
