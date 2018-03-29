// @ts-check
import React from 'react';
import Viewer from './Viewer';

export default ({ model }) => {
  return (
    <div style={{ height: 400, width: 400 }}>
      <Viewer model={model} />
    </div>
  );
};
