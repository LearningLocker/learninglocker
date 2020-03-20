import React from 'react';
import { List, Map, Set } from 'immutable';
import { Bar, Legend, Tooltip } from 'recharts';
import { isNull, isNumber, isString, map, memoize } from 'lodash';
import { trimName } from 'ui/redux/modules/visualise';
import { withStateHandlers } from 'recompose';
import { displayAuto } from 'ui/redux/modules/queryBuilder';
import CustomTooltip from './CustomTooltip';

const getAxisSize = (axis) => {
  if (!axis.find(axes => axes.get('count') > 0)) {
    return 0;
  }

  return Map.isMap(axis) ? axis.size : 0;
};

const getLargestAxisSize = axes => axes.map(getAxisSize).max();

const getLargestSeriesSize = results => results.map(getLargestAxisSize).max();

const getId = entryId => entryModel => (isNumber(entryId) ? entryId : entryModel);

export const getLabel = (entryId) => {
  if (!entryId) {
    return '';
  }

  if (!entryId.map) {
    return JSON.stringify(entryId);
  }

  if (entryId.get('name')) {
    return entryId.get('name');
  }

  if (entryId.get('id')) {
    return entryId.get('id');
  }

  if (!entryId.getIn([0, 'definition'])) {
    return entryId;
  }

  const navLangs = (navigator && navigator.languages) || [];

  return entryId.map(
    (item) => {
      if (!item.getIn) {
        return item;
      }

      const allLanguages = item.getIn(['definition', 'name']);

      const outLangs = map(navLangs, lang => allLanguages.get(lang, null))
        .filter(item2 => !isNull(item2));

      if (outLangs.length === 0) {
        return allLanguages.first();
      }

      return outLangs[0];
    }
  );
};

const getEntryData = i => (entry) => {
  const entryId = entry.get('_id');
  const entryModel = displayAuto(entry.get('model'));
  const entryCount = entry.get('count', 0);

  return new Map({
    cellId: isString(entryId) || isNumber(entryId) ? entryId : getLabel(entryId),
    id: getId(entryId)(entryModel),
    model: entryModel,
    [`Series ${i}`]: entryCount,
    total: entryCount,
  });
};

const getEntriesData = i => entries => entries.map(getEntryData(i)).mapKeys((k, data) => data.get('cellId'));

const getSeriesData = series => i => getEntriesData(i + 1)(series.get(0, new Map()));

const mergeEntryData = (prev, next) => prev.merge(next).set('total', next.get('total') + prev.get('total'));

const mergeSeriesData = (data, series, i) => data.mergeWith(mergeEntryData, getSeriesData(series)(i));

const getGroupModel = data => group =>
  data.getIn([group, 'model'], group);

const getMinAndMax = counts =>
  [0, counts.max()];

const getTotal = entry =>
  entry.get('total', 0);

const renderBar = index => stacked => label => color => (
  <Bar
    key={index}
    dataKey={`Series ${index + 1}`}
    fill={color}
    name={label}
    stackId={stacked ? 1 : index} />
);

const reduceResults = results => results.reduce(mergeSeriesData, new Map());

const addSeries = (entry, l, i) => entry.set(`Series ${i + 1}`, entry.get(`Series ${i + 1}`, 0));

const formatEntry = labels => entry => labels.reduce(addSeries, entry);

const mapEntries = entries => labels => entries.map(formatEntry(labels));

export const getDomain = data => getMinAndMax(data.map(getTotal));

export const getResultsData = results => labels => mapEntries(reduceResults(results))(labels);

export const getLongModel = memoize(
  data => memoize(
    group => (
      getGroupModel(data)(group)
    )
  ),
  iterable => iterable.hashCode()
);

export const getShortModel = data => group => trimName(getLongModel(data)(group));

export const getChartData = (data, hiddenSeries = new Set()) => data
    .map(item => item.filter((item2, key) => !hiddenSeries.includes(key)))
    .valueSeq()
    .toJS();

export const hasData = results => getLargestSeriesSize(results) > 0;

export const renderBars = (colors = new List()) => labels => stacked => labels
  .map((label, i) => renderBar(i)(stacked)(label)(colors.get(i)))
  .valueSeq();

const onLegendClick = toggleHiddenSeries => (bar) => {
  toggleHiddenSeries(bar.dataKey);
};

export const renderLegend = (labels, toggleHiddenSeries) => (
  labels.size > 1
    ? (
      <Legend
        wrapperStyle={{ marginLeft: '20px', paddingBottom: '20px' }}
        verticalAlign={'top'}
        align="center"
        onClick={toggleHiddenSeries ? onLegendClick(toggleHiddenSeries) : null} />
    )
    : <noscript />
);

export const renderTooltips = (data, hiddenSeries, colors = ['grey']) => (
  <Tooltip
    cursor={{ fill: colors[0], fillOpacity: 0.1 }}
    content={<CustomTooltip display={getLongModel(data, hiddenSeries)} />} />
);

export const hiddenSeriesState = withStateHandlers(
  {
    hiddenSeries: new Set()
  },
  {
    toggleHiddenSeries: ({ hiddenSeries }) => (value) => {
      if (hiddenSeries.includes(value)) {
        return {
          hiddenSeries: hiddenSeries.delete(value)
        };
      }

      return {
        hiddenSeries: hiddenSeries.add(value)
      };
    }
  }
);
