import React from 'react';
import { requestAppAccess } from 'ui/redux/modules/requestAppAccess';
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
        appName={appName}
        requestAppAccessAction={{ requestAppAccess }} />
    </div>
  );
};

export default Demo;
