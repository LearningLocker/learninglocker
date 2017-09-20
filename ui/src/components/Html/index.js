/* eslint-disable react/no-danger */
import React, { PropTypes } from 'react';
import serialize from 'serialize-javascript';
import Helmet from 'react-helmet';
import config from 'ui/config';

const html = ({
  protocol, // http or https
  style, // raw styles to be embedded directly into the document
  scripts, // scripts to be linked in the document body
  state, // initial state of the client side store
  children, // output of server side route render
}) => {
  const head = Helmet.rewind();

  return (
    <html className="no-js" lang="en">
      <head>
        {head.base.toComponent()}
        {head.title.toComponent()}
        {head.meta.toComponent()}
        {head.link.toComponent()}
        {head.script.toComponent()}
        <link rel="shortcut icon" href={`${config.assetPath}static/favicon.ico`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href={`${config.assetPath}static/core.css`} />
        {style && <style id="css" dangerouslySetInnerHTML={{ __html: style }} />}
      </head>
      <body>
        <div id="content" dangerouslySetInnerHTML={{ __html: children }} />
        {state && (
          <script
            dangerouslySetInnerHTML={{ __html: `
              window.__data=${serialize(state)};
              window.rootUrl='${protocol}://${config.host}:${config.port}';
            ` }}
            charSet="UTF-8" />
        )}
        {scripts && scripts.map(script => <script key={script} src={script} />)}
      </body>
    </html>
  );
};

html.propTypes = {
  protocol: PropTypes.string,
  style: PropTypes.string,
  scripts: PropTypes.arrayOf(PropTypes.string.isRequired),
  state: PropTypes.object,
  children: PropTypes.string,
};

export default html;
