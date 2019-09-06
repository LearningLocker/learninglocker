import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { StyledVisualiseIconWithTitle } from 'ui/components/VisualiseIcon';
import {
  LEADERBOARD,
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE,
} from 'lib/constants/visualise';
import { default as CustomBarChartCard } from 'ui/containers/Visualisations/CustomBarChart/Card';
import { default as CustomColumnChartCard } from 'ui/containers/Visualisations/CustomColumnChart/Card';

const getText = (type) => {
  switch (type) {
    case LEADERBOARD: return 'Use the bar graph (people) to benchmark your users against each other, answering the question, which users have done the most?';
    case XVSY: return 'Use the Correlation graph to compare people against two variables. Use it to answer the question, is there any relationship between X and Y?';
    case STATEMENTS: return 'Use the Column Graph to show statements over time. Use it to answer the question, how much activity has there been?';
    case FREQUENCY: return 'Use the Frequency graph to show statements over time in multiple series. Up to 5 series can be shown. Use it to answer the question, how does the activity of X compare to the activity of Y?';
    case COUNTER: return 'Use the Counter visualisation to show a single number (e.g. total number of users)';
    case PIE: return 'Use the Pie chart to show how your statements are divided (e.g. number of statements per course)';
    default: return '';
  }
};

const TypeEditor = ({
  model,
  saveModel,
}) => {
  const id = model.get('_id');
  const [typeState, setTypeState] = useState(undefined);

  const setLEADERBOARD = useCallback(() => setTypeState(LEADERBOARD), [id]);
  const setXVSY = useCallback(() => setTypeState(XVSY), [id]);
  const setSTATEMENTS = useCallback(() => setTypeState(STATEMENTS), [id]);
  const setFREQUENCY = useCallback(() => setTypeState(FREQUENCY), [id]);
  const setCOUNTER = useCallback(() => setTypeState(COUNTER), [id]);
  const setPIE = useCallback(() => setTypeState(PIE), [id]);

  const onSubmit = useCallback(
    () => saveModel({
      attrs: model.set('type', typeState),
    }),
    [id, typeState]
  );

  return (
    <div id="new-visualisation-custom">
      <div style={{ maxHeight: '500px', padding: '0px', overflow: 'auto' }}>
        {/* [Refactor] Replace StyledVisualiseIconWithTitle with "Card" component
            https://github.com/LearningLocker/enterprise/issues/991
          */}
        <CustomBarChartCard
          active={typeState === LEADERBOARD}
          onClick={setLEADERBOARD} />

        <StyledVisualiseIconWithTitle
          type={XVSY}
          active={typeState === XVSY}
          onClick={setXVSY} />

        <CustomColumnChartCard
          active={typeState === STATEMENTS}
          onClick={setSTATEMENTS} />

        <StyledVisualiseIconWithTitle
          type={FREQUENCY}
          active={typeState === FREQUENCY}
          onClick={setFREQUENCY} />

        <StyledVisualiseIconWithTitle
          type={COUNTER}
          active={typeState === COUNTER}
          onClick={setCOUNTER} />

        <StyledVisualiseIconWithTitle
          type={PIE}
          active={typeState === PIE}
          onClick={setPIE} />
      </div>

      {typeState && (
        <div className="row">
          <div className="col-xs-10 text-left">
            <p>{getText(typeState)}</p>
          </div>

          <div className="col-xs-2 text-right">
            <a onClick={onSubmit} className="btn btn-primary btn-sm">
              <i className="icon ion-checkmark" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

TypeEditor.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  saveModel: PropTypes.func.isRequired,
};

const areEqual = (prev, next) => prev.model._id === next.model._id;

export default React.memo(TypeEditor, areEqual);
