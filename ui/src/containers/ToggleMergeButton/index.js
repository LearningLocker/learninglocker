import React from 'react';
import { compose, withHandlers } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { IN_PROGRESS, COMPLETED } from 'ui/utils/constants';
import SmallSpinner from 'ui/components/SmallSpinner';
import classNames from 'classnames';

const renderButtonContent = (mergeState) => {
  switch (mergeState) {
    case IN_PROGRESS:
      return <SmallSpinner />;
    case COMPLETED:
      return <i className="icon animated fadeIn ion-checkmark" />;
    default:
      return <i className="ion ion-merge" />;
  }
};

const enhance = compose(
  withModel,
  withHandlers({
    onClick: ({ setMetadata, getMetadata }) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isMergeFormVisible =
        getMetadata('isMergeFormVisible', false) &&
        getMetadata('isExpanded', false);

      if (isMergeFormVisible) {
        setMetadata('isMergeFormVisible', false);
      } else {
        setMetadata('isExpanded', true);
        setMetadata('isMergeFormVisible', true);
      }
    }
  })
);

const render = ({ onClick, getMetadata, model, disabled, white }) => {
  const isDisabled = model.getIn(['errors', 'hasErrors'], disabled);
  const classes = classNames({
    'btn-sm btn': true,
    'btn-inverse': !white,
    'btn-default flat-white flat-btn': white
  });
  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      style={{ width: '33px' }}>
      {renderButtonContent(getMetadata('mergeState'))}
    </button>
  );
};

export default enhance(render);
