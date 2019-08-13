import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { OrderedMap } from 'immutable';
import SourceResults from 'ui/containers/VisualiseResults/SourceResults';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { VISUALISATION_COLORS } from 'ui/utils/constants';
import BiaxialBarChart from 'ui/components/Charts/BiaxialBarChart';
import { displayAuto } from 'ui/redux/modules/queryBuilder';
import { trimName } from 'ui/redux/modules/visualise';

const MINIMUM_ATTEMPTS = 10;

const ChartResults = withStatementsVisualisation(({
  results,
}) => {
  /**
   * @type {ResultItems} resultItems
   *
   * type ResultItem = immutable.Map<string, any>({
   *   _id: string,
   *   attempts: number,
   *   avgScaledScore: number,
   *   model: any,
   * })
   *
   * type ResultItems = immutable.OrderedMap<string, ResultItem>>
   */
  const resultItems = results.getIn([0, 0], new OrderedMap());

  /**
   * @type {{
   *   y: string,
   *   x1: number,
   *   x2: number,
   * }[]}
   */
  const data =
    resultItems
      .toList()
      .filter(r => r.get('attempts') >= MINIMUM_ATTEMPTS)
      .map(r => ({
        y: r.get('_id'),
        x1: r.get('attempts'),
        x2: r.get('avgScaledScore') * 100,
      }))
      .take(10)
      .toJS();

  return (
    <BiaxialBarChart
      data={data}
      topXBarColor="#adadad"
      bottomXBarColor={VISUALISATION_COLORS[0]}
      topXLabel={'Attempts'}
      bottomXLabel={'Success Rate'}
      yLabel={'Questions'}
      bottomXBarTickFormatter={x => `${x}%`}
      yTickFormatter={id => trimName(displayAuto(resultItems.getIn([id, 'model'], id)))}
      topXFormatter={x => x}
      bottomXFormatter={x => `${_.round(x, 2)}%`}
      yFormatter={id => displayAuto(resultItems.getIn([id, 'model'], id))} />
  );
});

 /**
 * @param {string} props.visualisationId
 * @param {boolean} props.showSourceView
 */
const Viewer = ({
  visualisationId,
  showSourceView,
}) => {
  if (showSourceView) {
    return <SourceResults id={visualisationId} />;
  }
  return <ChartResults id={visualisationId} />;
};

Viewer.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  showSourceView: PropTypes.bool.isRequired,
};

export default React.memo(Viewer);
