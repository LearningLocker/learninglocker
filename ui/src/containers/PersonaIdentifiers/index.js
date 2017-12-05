import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Map } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps, setPropTypes, withState } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import AddTextIconButton from 'ui/components/TextIconButton/AddTextIconButton';
import styles from './styles.css';
import NewIdentifier from './NewIdentifier';
import ExistingIdentifier from './ExistingIdentifier';

const enhancePersonaIdentifiers = compose(
  setPropTypes({
    personaId: PropTypes.string.isRequired,
  }),
  withProps(({ personaId }) => ({
    filter: new Map({ persona: personaId }),
    schema: 'personaIdentifier',
    first: 100,
    sort: new Map({ _id: -1 }),
  })),
  withModels,
  withState('isNewIdentifierVisible', 'changeNewIdentifierVisibility', false),
  withStyles(styles)
);

const renderPersonaIdentifiers = ({
  personaId,
  models,
  isNewIdentifierVisible,
  changeNewIdentifierVisibility,
  addModel,
}) => {
  return (
    <div>
      <div className={styles.buttons}>
        <AddTextIconButton
          text="Add Identifier"
          onClick={() => changeNewIdentifierVisibility(true)} />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.td}>Type</th>
            <th className={styles.td}>Value</th>
            <th className={classNames(styles.td, styles.actions)}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!isNewIdentifierVisible ? null : (
            <NewIdentifier
              onAdd={(key, value) => {
                const props = new Map({
                  ifi: new Map({ key, value }),
                  persona: personaId,
                });
                addModel({ props });
              }}
              onCancel={() => {
                changeNewIdentifierVisibility(false)
              }} />
          )}
          {models.map((model) => {
            return <ExistingIdentifier id={model.get('_id')} />;
          }).valueSeq()}
        </tbody>
      </table>
    </div>
  );
};

export default enhancePersonaIdentifiers(renderPersonaIdentifiers);
