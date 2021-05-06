import React from 'react';

const Tip = ({ topic, description }) => {
  return (
    <>
      <div style={{ color: 'rgba(0,0,0,0.85)' }}>{topic}</div>
      <div>{description}</div>
    </>
  );
};

export default Tip;
