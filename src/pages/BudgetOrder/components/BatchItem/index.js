import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import * as XLSX from 'xlsx';
import { Button, Empty, Dropdown, Menu } from 'antd';
import { ExtModal, Space, message, utils, ExtIcon, ListLoader } from 'suid';
import empty from '@/assets/data_import.svg';
import { constants } from '@/utils';
import styles from './index.less';

const { request } = utils;
const { SERVER_PATH } = constants;

const BatchItem = ({ headData, closeBatchImport, showBatch, completeImport }) => {
  const btnFileRef = useRef(null);
  const [templateDownloding, setTemplateDownloding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dimensionData, setDimensionData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importData, setImportData] = useState({});
  const [importDisabled, setImportDisabled] = useState(true);

  const willUnmount = useCallback(() => {
    setImportData({});
    setImportDisabled(true);
  }, []);

  const getDimensionData = useCallback(() => {
    const budgetTypeId = get(headData, 'categoryId');
    setLoading(true);
    request({
      url: `${SERVER_PATH}/bems-v6/category/getAssigned`,
      params: { categoryId: budgetTypeId },
    })
      .then(res => {
        if (res.success) {
          setDimensionData(res.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [headData]);

  useEffect(() => {
    if (showBatch) {
      getDimensionData();
    }
    return willUnmount;
  }, [getDimensionData, showBatch, willUnmount]);

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

  const downloadTFile = useCallback((fileTitle, head = [], data = []) => {
    if (head.length > 0) {
      const header = [...head];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([header]);
      XLSX.utils.sheet_add_json(ws, data, { skipHeader: true, origin: 'A2' });
      ws['!cols'] = [];
      header.forEach(() => ws['!cols'].push({ wpx: 260 }));
      XLSX.utils.book_append_sheet(wb, ws, fileTitle);
      XLSX.writeFile(wb, `${fileTitle}.xlsx`);
    } else {
      message.destroy();
      message.warning(`模板或数据导出失败`);
    }
  }, []);

  const downloadTemplate = useCallback(() => {
    const fileTitle = get(headData, 'categoryName');
    const budgetTypeId = get(headData, 'categoryId');
    setTemplateDownloding(true);
    request({
      url: `${SERVER_PATH}/bems-v6/order/getBudgetTemplate`,
      params: { categoryId: budgetTypeId },
    })
      .then(res => {
        if (res.success) {
          downloadTFile(`${fileTitle}导入模板`, res.data);
        }
      })
      .finally(() => {
        setTemplateDownloding(false);
      });
  }, [downloadTFile, headData]);

  const exportMasterData = useCallback(
    dimensionCode => {
      const subjectId = get(headData, 'subjectId');
      setLoading(true);
      request({
        url: `${SERVER_PATH}/bems-v6/order/getDimensionValues`,
        params: { dimCode: dimensionCode, subjectId },
      })
        .then(res => {
          if (res.success) {
            const { head, data } = res.data;
            const [dimension] = dimensionData.filter(d => d.code === dimensionCode);
            const title = get(dimension, 'name');
            downloadTFile(`${title}主数据`, head, data);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [dimensionData, downloadTFile, headData],
  );

  const handlerDownloadDataClick = useCallback(
    e => {
      e.domEvent.stopPropagation();
      exportMasterData(e.key);
    },
    [exportMasterData],
  );

  const renderDownloadDataItem = useMemo(
    () => (
      <Menu onClick={handlerDownloadDataClick}>
        {dimensionData.map(d => {
          return <Menu.Item key={d.code}>{d.name}</Menu.Item>;
        })}
      </Menu>
    ),
    [handlerDownloadDataClick, dimensionData],
  );

  const renderContent = useMemo(() => {
    if (loading) {
      return <ListLoader />;
    }
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
  }, [loading, handlerSelectFile, handlerReadFile, importing, importDisabled, handlerImportExcel]);

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

  const renderToolBox = useMemo(() => {
    return (
      <div className="tool-box">
        <Space>
          <Button size="small" onClick={downloadTemplate} loading={templateDownloding} type="link">
            导入模板下载
          </Button>
          <Dropdown overlay={renderDownloadDataItem}>
            <Button size="small" type="link">
              其它下载
              <ExtIcon type="down" antd />
            </Button>
          </Dropdown>
        </Space>
      </div>
    );
  }, [downloadTemplate, renderDownloadDataItem, templateDownloding]);

  return (
    <ExtModal {...getExtModalProps()}>
      {renderContent}
      {renderToolBox}
    </ExtModal>
  );
};

export default BatchItem;
