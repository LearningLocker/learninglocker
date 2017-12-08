import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import { compose, setPropTypes, defaultProps } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Input from 'ui/components/Input/Input';
import styles from '../styles.css';

const enhance = compose(
  setPropTypes({
    value: PropTypes.instanceOf(Map),
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    refHomePageInput: PropTypes.func,
    refNameInput: PropTypes.func,
  }),
  defaultProps({
    refHomePageInput: () => { },
    refNameInput: () => { },
  }),
  withStyles(styles)
);

const render = ({
  value,
  onChange,
  onSave,
  refHomePageInput,
  refNameInput,
}) => {
  const homePage = value.get('homePage');
  const name = value.get('name');
  const handleHomePageChange = (homePage) => onChange(value.set('homePage', homePage));
  const handleNameChange = (name) => onChange(value.set('name', name));
  return (
    <div>
      <Input
        value={homePage}
        placeholder="Home Page"
        onChange={handleHomePageChange}
        onSubmit={onSave}
        inputRef={refHomePageInput} />
      <Input
        value={name}
        placeholder="Name"
        onChange={handleNameChange}
        onSubmit={onSave}
        inputRef={refNameInput} />
    </div>
  );
};

export default enhance(render);
