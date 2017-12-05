import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Map } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps, setPropTypes, withState } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import AddTextIconButton from 'ui/components/TextIconButton/AddTextIconButton';
import styles from './styles.css';
import NewAttribute from './NewAttribute';
import ExistingAttribute from './ExistingAttribute';

const enhancePersonaAttributes = compose(
  setPropTypes({
    personaId: PropTypes.string.isRequired,
  }),
  withProps(({ personaId }) => ({
    filter: new Map({ personaId }),
    schema: 'personaAttribute',
    first: 100,
    sort: new Map({ _id: -1 }),
  })),
  withModels,
  withState('isNewAttributeVisible', 'changeNewAttributeVisibility', false),
  withStyles(styles)
);

const renderPersonaAttributes = ({
  personaId,
  models,
  isNewAttributeVisible,
  changeNewAttributeVisibility,
  addModel,
}) => {
  return (
    <div>
      <div className={styles.buttons}>
        <AddTextIconButton text="Add Attribute" onClick={() => changeNewAttributeVisibility(true)} />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.td}>Key</th>
            <th className={styles.td}>Value</th>
            <th className={classNames(styles.td, styles.actions)}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!isNewAttributeVisible ? null : (
            <NewAttribute
              onAdd={(key, value) => {
                const props = new Map({ key, value, personaId });
                addModel({ props });
              }}
              onCancel={() => {
                changeNewAttributeVisibility(false)
              }} />
          )}
          {models.map((model) => {
            return <ExistingAttribute id={model.get('_id')} />;
          }).valueSeq()}
        </tbody>
      </table>
    </div>
  );
};

export default enhancePersonaAttributes(renderPersonaAttributes);
