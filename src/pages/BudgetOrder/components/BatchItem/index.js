import React, { useState, useMemo, useCallback, useRef } from 'react';
import cls from 'classnames';
import { Button, Empty } from 'antd';
import { ExtModal, Space, message, utils } from 'suid';
import empty from '@/assets/data_import.svg';
import { constants } from '@/utils';
import styles from './index.less';

const { request } = utils;
const { SERVER_PATH } = constants;

const BatchItem = ({ headData, closeBatchImport, showBatch, completeImport }) => {
  const btnFileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importData, setImportData] = useState({});
  const [importDisabled, setImportDisabled] = useState(true);

  const willUnmount = useCallback(() => {
    setImportData({});
    setImportDisabled(true);
  }, []);

  const handlerCloseImport = useCallback(() => {
    if (closeBatchImport) {
      closeBatchImport();
      willUnmount();
    }
  }, [closeBatchImport, willUnmount]);

  const handlerImportExcel = useCallback(() => {
    setImporting(true);
    request({
      method: 'POST',
      url: `${SERVER_PATH}/bems-v6/order/import`,
      data: importData,
    })
      .then(res => {
        if (res.success) {
          completeImport(res.data);
        } else {
          message.destroy();
          message.error(res.message);
        }
      })
      .finally(() => {
        setImporting(false);
      });
  }, [completeImport, importData]);

  const handlerSelectFile = useCallback(() => {
    if (btnFileRef) {
      btnFileRef.current.click();
      btnFileRef.current.value = '';
    }
  }, []);

  const handlerReadFile = useCallback(
    file => {
      message.destroy();
      const { files } = file.target;
      const fileData = files[0];
      const formData = new FormData();
      formData.append('file', fileData);
      const order = JSON.stringify(headData);
      formData.append('order', new Blob([order], { type: 'application/json' }));
      setImportDisabled(false);
      setImportData(formData);
    },
    [headData],
  );

  const renderContent = useMemo(() => {
    return (
      <Space direction="vertical" size={32} style={{ width: '100%', marginTop: 64 }}>
        <Empty
          key="data-empty"
          className="data-empty"
          image={empty}
          description="选择模板电子表格文件(.xlsx, .xls)"
        >
          <Space>
            <Button type="primary" ghost size="small" onClick={handlerSelectFile}>
              选择文件
              <input
                style={{ display: 'none' }}
                ref={btnFileRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handlerReadFile}
              />
            </Button>
            <Button
              type="primary"
              loading={importing}
              disabled={importDisabled}
              size="small"
              onClick={handlerImportExcel}
            >
              开始导入
            </Button>
          </Space>
        </Empty>
      </Space>
    );
  }, [handlerSelectFile, handlerReadFile, importing, importDisabled, handlerImportExcel]);

  const getExtModalProps = useCallback(() => {
    const modalProps = {
      wrapClassName: cls(styles['batch-import-box']),
      destroyOnClose: true,
      maskClosable: false,
      keyboard: false,
      visible: showBatch,
      centered: true,
      footer: null,
      closable: true,
      bodyStyle: { padding: 0, height: 420 },
      title: '批量导入',
      onCancel: handlerCloseImport,
    };
    return modalProps;
  }, [showBatch, handlerCloseImport]);

  return <ExtModal {...getExtModalProps()}>{renderContent}</ExtModal>;
};

export default BatchItem;
