import React from 'react';
import RequestAppAccessForm from '../RequestAppAccessForm';

const SalesDemo = () => {
  const appName = 'Sales Demo';
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

export default SalesDemo;
