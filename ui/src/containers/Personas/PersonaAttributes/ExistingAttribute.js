import React, { PropTypes } from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import DebounceInput from 'react-debounce-input';
import { compose, setPropTypes, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import SaveIconButton from 'ui/components/IconButton/SaveIconButton';
import DeleteIconButton from 'ui/components/IconButton/DeleteIconButton';
import styles from './styles.css';
import ChangingAttribute from './ChangingAttribute';
import SavedAttribute from './SavedAttribute';

const enhanceExistingAttribute = compose(
  withProps({ schema: 'personaAttribute' }),
  withModel
);

const renderExistingAttribute = ({ id, getMetadata, setMetadata }) => {
  const isChanging = getMetadata('isChanging', false);
  return isChanging ? <ChangingAttribute id={id} /> : <SavedAttribute id={id} />;
};

export default enhanceExistingAttribute(renderExistingAttribute);