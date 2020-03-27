import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import {
  LEADERBOARD,
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE,
} from 'lib/constants/visualise';
import CustomBarChartCard from 'ui/containers/Visualisations/CustomBarChart/Card';
import CustomColumnChartCard from 'ui/containers/Visualisations/CustomColumnChart/Card';
import CustomCounterCard from 'ui/containers/Visualisations/CustomCounter/Card';
import CustomLineChartCard from 'ui/containers/Visualisations/CustomLineChart/Card';
import CustomPieChartCard from 'ui/containers/Visualisations/CustomPieChart/Card';
import CustomXvsYChartCard from 'ui/containers/Visualisations/CustomXvsYChart/Card';

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
        <CustomBarChartCard
          active={typeState === LEADERBOARD}
          onClick={setLEADERBOARD} />

        <CustomXvsYChartCard
          active={typeState === XVSY}
          onClick={setXVSY} />

        <CustomColumnChartCard
          active={typeState === STATEMENTS}
          onClick={setSTATEMENTS} />

        <CustomLineChartCard
          active={typeState === FREQUENCY}
          onClick={setFREQUENCY} />

        <CustomCounterCard
          active={typeState === COUNTER}
          onClick={setCOUNTER} />

        <CustomPieChartCard
          active={typeState === PIE}
          onClick={setPIE} />
      </div>

      {typeState && (
        <div className="row">
          <div className="col-xs-10 text-left">
            <p style={{ padding: 8 }}>{getText(typeState)}</p>
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
