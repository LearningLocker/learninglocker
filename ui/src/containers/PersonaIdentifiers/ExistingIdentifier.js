import React, { PropTypes } from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import DebounceInput from 'react-debounce-input';
import { compose, setPropTypes, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import SaveIconButton from 'ui/components/IconButton/SaveIconButton';
import DeleteIconButton from 'ui/components/IconButton/DeleteIconButton';
import styles from './styles.css';
import ChangingIdentifier from './ChangingIdentifier';
import SavedIdentifier from './SavedIdentifier';

const enhanceExistingIdentifier = compose(
  withProps({ schema: 'personaIdentifier' }),
  withModel
);

const renderExistingIdentifier = ({ id, getMetadata, setMetadata }) => {
  const isChanging = getMetadata('isChanging', false);
  return isChanging ? <ChangingIdentifier id={id} /> : <SavedIdentifier id={id} />;
};

export default enhanceExistingIdentifier(renderExistingIdentifier);