import React, { useCallback, useEffect, useMemo, useState } from 'react';
import cls from 'classnames';
import { findIndex } from 'lodash';
import { Dropdown, Menu } from 'antd';
import { ExtIcon } from 'suid';
import styles from './index.less';

const stepData = [
  { t: '25%', v: 0.25 },
  { t: '50%', v: 0.5 },
  { t: '75%', v: 0.75 },
  { t: '100%', v: 1 },
  { t: '125%', v: 1.25 },
  { t: '150%', v: 1.5 },
  { t: '175%', v: 1.75 },
  { t: '自适应', v: 100 },
];
const OrderSlider = props => {
  const { onChange = () => {}, defaultWidth = 1000 } = props;
  const [sliderIndex, setSliderIndex] = useState(3);

  useEffect(() => {
    const step = stepData[sliderIndex];
    const width = defaultWidth * Number(step.v);
    onChange(width);
  }, [defaultWidth, onChange, sliderIndex]);

  const handleMenuClick = useCallback(
    e => {
      const idx = findIndex(stepData, s => Number(s.v) === Number(e.key));
      if (Number(e.key) === 100) {
        onChange('100%');
      } else {
        const width = defaultWidth * Number(e.key);
        onChange(width);
      }
      setSliderIndex(idx);
    },
    [defaultWidth, onChange],
  );

  const sliderOptions = useMemo(
    () => (
      <Menu onClick={handleMenuClick}>
        {stepData.map(st => {
          const { t, v } = st;
          return <Menu.Item key={v}>{t}</Menu.Item>;
        })}
      </Menu>
    ),
    [handleMenuClick],
  );

  const zoomIn = useCallback(
    e => {
      e.stopPropagation();
      const newIndex = sliderIndex - 1;
      if (newIndex < 0) {
        return false;
      }
      const step = stepData[newIndex];
      const width = defaultWidth * Number(step.v);
      setSliderIndex(newIndex);
      onChange(width);
    },
    [defaultWidth, onChange, sliderIndex],
  );

  const zoomOut = useCallback(
    e => {
      e.stopPropagation();
      const newIndex = sliderIndex + 1;
      if (newIndex > stepData.length - 1) {
        return false;
      }
      const step = stepData[newIndex];
      if (Number(step.v) === 100) {
        onChange('100%');
      } else {
        const width = defaultWidth * Number(step.v);
        onChange(width);
      }
      setSliderIndex(newIndex);
    },
    [defaultWidth, onChange, sliderIndex],
  );

  const sliderLabelText = useMemo(() => {
    const step = stepData[sliderIndex];
    return step.t;
  }, [sliderIndex]);

  return (
    <div className={cls('suid-order-wdith-slider', styles['order-slider-box'])}>
      <span className="order-slider">
        <ExtIcon onClick={zoomIn} className="zoom-in btn" type="minus-circle" theme="filled" antd />
        <Dropdown
          overlayClassName={styles['slider-menu-box']}
          overlay={sliderOptions}
          placement="bottomCenter"
          trigger={['click']}
        >
          <span className="zoom">{sliderLabelText}</span>
        </Dropdown>
        <ExtIcon
          onClick={zoomOut}
          className="zoom-out btn"
          type="plus-circle"
          theme="filled"
          antd
        />
      </span>
    </div>
  );
};

export default OrderSlider;
