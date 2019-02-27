import React from 'react';
import { compose, withState } from 'recompose';
import FocusGroup from 'ui/components/FocusGroup/FocusGroup';
import TextInputGroup from 'ui/components/TextInputGroup';
import Token from 'ui/components/Token';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

/**
 * Multi Input for query builder without search
 */
const MultiInput = ({
  // props
  options,        // List<string>
  onAddOption,    // (value: string) => void
  onRemoveOption, // (value: string) => void

  // event handlers
  onKeyPress,

  // local states
  hasFocus,
  setFocus
}) => (
  <div onKeyPress={onKeyPress}>
    <FocusGroup
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      hasFocus={hasFocus} >
      <div
        className={styles.inputWrapper} >

        {options.map((option, i) => (
          <Token
            key={i}
            handleRemove={onRemoveOption}
            index={option}
            parse={x => x}
            parseTooltip={x => x}
            value={option} />
        ))}

        {hasFocus &&
          <div className={styles.input}>
            <TextInputGroup
              onSubmit={x => onAddOption(x.value)}
              fields={['value']}
              defaultValues={['']}
              submitIcon="ion-plus-circled"
              cancelIcon={null} />
          </div>
        }
      </div>
    </FocusGroup>
  </div>
);

/**
 * MultiInput
 *
 * onAddValue {}
 */
export default compose(
  withStyles(styles),
  withState('hasFocus', 'setFocus', false)
)(MultiInput);
