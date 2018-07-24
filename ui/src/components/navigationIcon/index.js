import React, { Component, PropTypes } from 'react';
import uuid from 'uuid';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { getMetadataSelector, setInMetadata } from 'ui/redux/modules/metadata';