import React from 'react';
import RequestAppAccessForm from '../RequestAppAccessForm';

const Demo = () => {
  const appName = 'Demo Sales Data';
  return (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          {appName}
        </div>
      </header>
      <RequestAppAccessForm
        appName={appName} />
    </div>
  );
};

export default Demo;
