/// <reference path="./definitions/react.d.ts" />
import React = require('react');
import App = require('./intervals/App');

var app = App();
React.render(app, document.getElementById('app'));
