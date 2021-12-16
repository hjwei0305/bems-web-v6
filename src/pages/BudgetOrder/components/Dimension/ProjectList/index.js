import React, { useCallback, useMemo, useState } from 'react';
import { Button } from 'antd';
import { ListCard } from 'suid';
import ProjectSelect from './ProjectSelect';
import styles from './index.less';

const ProjectList = ({ subjectId, onSelectChange }) => {
  const [selectedProject, setSelectedProject] = useState([]);
  const [showSelect, setShowSelect] = useState(false);

  const handerSelectChange = useCallback(
    items => {
      if (onSelectChange && onSelectChange instanceof Function) {
        const data = items.map(it => {
          return {
            text: `${it.name}(${it.code})`,
            value: it.id,
          };
        });
        onSelectChange(data);
      }
    },
    [onSelectChange],
  );

  const handlerShowSelect = useCallback(() => {
    setShowSelect(true);
  }, []);

  const handlerCloseSelect = useCallback(() => {
    setShowSelect(false);
  }, []);

  const renderCustomTool = useCallback(
    ({ total }) => {
      return (
        <>
          <Button type="primary" ghost onClick={handlerShowSelect}>
            添加
          </Button>
          <span style={{ marginLeft: 8 }}>{`共 ${total} 项`}</span>
        </>
      );
    },
    [handlerShowSelect],
  );

  const handlerRemove = useCallback(
    (e, item) => {
      if (e) e.stopPropagation();
      const selData = selectedProject.filter(it => it.id !== item.id);
      setSelectedProject(selData);
    },
    [selectedProject],
  );

  const listCardProps = useMemo(() => {
    return {
      dataSource: selectedProject,
      showArrow: false,
      showSearch: false,
      itemField: {
        title: item => `${item.name}(${item.code})`,
        extra: item => (
          <Button ghost type="primary" size="small" onClick={e => handlerRemove(e, item)}>
            移除
          </Button>
        ),
      },
      customTool: renderCustomTool,
    };
  }, [selectedProject, renderCustomTool, handlerRemove]);

  const handlerAssign = useCallback(
    it => {
      const selData = [...selectedProject, it];
      setSelectedProject(selData);
      handerSelectChange(selData);
    },
    [handerSelectChange, selectedProject],
  );

  const projectSelectProps = useMemo(() => {
    const excludeIds = selectedProject.map(sel => sel.id);
    const projectProps = {
      subjectId,
      showAssign: showSelect,
      closeAssign: handlerCloseSelect,
      assign: handlerAssign,
      excludeIds,
    };
    return projectProps;
  }, [handlerCloseSelect, handlerAssign, selectedProject, showSelect, subjectId]);

  return (
    <div className={styles['container-box']}>
      <ListCard {...listCardProps} />
      <ProjectSelect {...projectSelectProps} />
    </div>
  );
};

export default ProjectList;
