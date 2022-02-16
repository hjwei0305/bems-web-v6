import * as XLSX from 'xlsx';
import constants from './constants';
import * as userUtils from './user';
import wsocket from './websocket';

const downFile = (blob, fileName) => {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, fileName);
  } else {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }, 50);
  }
};

const exportXls = (fileTitle, cols, data) => {
  const header = [];
  cols.forEach(t => {
    header.push(t);
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header]);
  XLSX.utils.sheet_add_json(ws, data, { skipHeader: true, origin: 'A2' });
  ws['!cols'] = [];
  header.forEach(() => ws['!cols'].push({ wpx: 150 }));
  XLSX.utils.book_append_sheet(wb, ws, fileTitle);
  XLSX.writeFile(wb, `${fileTitle}.xlsx`);
};

const getAllNodeKeys = treeData => {
  const ids = [];
  const getKeys = (tree, idKeys) => {
    for (const data of tree) {
      idKeys.push(data.id);
      if (data.children) {
        getKeys(data.children, idKeys);
      }
    }
  };
  getKeys(treeData, ids);
  return ids;
};

const getAllParentIdsByNode = (treeData, nodeId) => {
  const treeFindPath = (tree, func, path = []) => {
    if (!tree) return [];
    for (const data of tree) {
      path.push(data.id);
      if (func(data)) {
        path.pop();
        return path;
      }
      if (data.children) {
        const findChildren = treeFindPath(data.children, func, path);
        if (findChildren.length) return findChildren;
      }
      path.pop();
    }
    return [];
  };
  const ids = treeFindPath(treeData, data => data.id === nodeId);
  return ids;
};

const getAllChildIdsByNode = (treeData, nodeId) => {
  const childNodesDeep = (nodes, arr) => {
    if (nodes)
      nodes.forEach(ele => {
        arr.push(ele.id);
        if (ele.children) {
          childNodesDeep(ele.children, arr);
        }
      });
  };
  const getChild = (nodes, id, arr) => {
    for (const el of nodes) {
      if (el.id === id && el.children) {
        childNodesDeep(el.children, arr);
      } else if (el.children) {
        getChild(el.children, id, arr);
      }
    }
    return arr;
  };
  const ids = [];
  getChild(treeData, nodeId, ids);
  return ids;
};

export {
  constants,
  userUtils,
  wsocket,
  exportXls,
  getAllParentIdsByNode,
  getAllChildIdsByNode,
  getAllNodeKeys,
  downFile,
};
