import React from 'react';
import { Map, Set, List } from 'immutable';
import { Bar, Tooltip, Legend } from 'recharts';
import { isNumber, isString, memoize, map, isNull } from 'lodash';
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

const getLargestAxisSize = axes =>
  axes.map(getAxisSize).max();

const getLargestSeriesSize = results =>
  results.map(getLargestAxisSize).max();

const getId = entryId => entryModel =>
  (isNumber(entryId) ? entryId : entryModel);

export const getLabel = (entryId) => {
  if (!entryId) {
    return '';
  }
  if (!entryId || !entryId.map) {
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

  const out = entryId.map(
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

  return out;
};

const getEntryData = i => (entry) => {
  const entryId = entry.get('_id');
  const entryModel = displayAuto(entry.get('model'));
  const entryCount = entry.get('count', 0);
  // console.log('entry', entry, i)
  return new Map({
    cellId: isString(entryId) || isNumber(entryId) ? entryId : getLabel(entryId),
    id: getId(entryId)(entryModel),
    model: entryModel,
    [`Series ${i}`]: entryCount,
    total: entryCount,
  });
};

const getStackEntryData = (i, labels) => (entry) => {
  // console.log('entry s', entry, i)
  const entryId = entry.get('_id');
  const entryModel = displayAuto(entry.get('model'));
  const entryCount = entry.get('count', 0);

  const out = new Map({
    cellId: isString(entryId) || isNumber(entryId) ? entryId : getLabel(entryId),
    id: getId(entryId)(entryModel),
    model: entryModel,
    [labels.get(i) || `Series ${i}`]: entryCount,
    total: entryCount,
  });
  // console.log('out', out)
  return out;
};

const getEntriesData = i => entries => entries.map(getEntryData(i)).mapKeys((k, data) => data.get('cellId'));

const getStackEntriesData = i => entries => labels => entries.map(getStackEntryData(i, labels)).mapKeys((k, data) => data.get('cellId'));

const getSeriesData = series => i =>
  getEntriesData(i + 1)(series.get(0, new Map()));

const getStackSeriesData = series => i => labels =>
  getStackEntriesData(i + 1)(series.get(0, new Map()))(labels);

const mergeEntryData = (prev, next) => prev.merge(next).set('total', next.get('total') + prev.get('total'));

const mergeSeriesData = (data, series, i) =>
  data.mergeWith(mergeEntryData, getSeriesData(series)(i));

const mergeStackSeriesData = labels => (data, series, i) => {
  // console.log('yo', data.mergeWith(mergeEntryData, getStackSeriesData(series)(i)(labels)))
  return data.mergeWith(mergeEntryData, getStackSeriesData(series)(i)(labels));
}
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

const reduceResults = results => {
  console.log('stack res ', results)
  return results.reduce(mergeSeriesData, new Map());
}

const reduceStackResults = results => labels => {
  console.log('red stack res ', results)
  return results.reduce(mergeStackSeriesData(labels), new Map());
}
// const reduceStackResults = results => labels => results.reduce(mergeStackSeriesData(labels), new Map());

const addSeries = (entry, l, i) =>
  entry.set(`Series ${i + 1}`, entry.get(`Series ${i + 1}`, 0));

const formatEntry = labels => entry =>
  labels.reduce(addSeries, entry);

const mapEntries = entries => labels =>
  entries.map(formatEntry(labels));

const addSeriesWithLabels = (entry, l, i, labels) =>
entry.set(labels[i] || `Series ${i + 1}`, entry.get(`Serie~s ${i + 1}`, 0));

export const getDomain = data =>
  getMinAndMax(data.map(getTotal));

export const getResultsData = results => labels => mapEntries(reduceResults(results))(labels);

export const getStackResultsData = results => (labels) => {
  console.log('yoyo', mapEntries(reduceStackResults(results)(labels))(labels));
  return mapEntries(reduceStackResults(results)(labels))(labels)
}

export const getLongModel = memoize(data => memoize(group => (
  getGroupModel(data)(group)
)), iterable => iterable.hashCode());

export const getShortModel = data => group => trimName(getLongModel(data)(group));

export const getChartData = (data, hiddenSeries = new Set()) => {
  const filteredData = data.map((item) => {
    const out = item.filter((item2, key) => {
      if (hiddenSeries.includes(key)) {
        return false;
      }
      return true;
    });
    return out;
  });

  return filteredData.valueSeq().toJS();
};

export const getSeriesLabels = labels => labels.toJS().map((label, i) => label || `Series ${i}`);

export const hasData = results =>
  getLargestSeriesSize(results) > 0;

export const renderBars = (colors = new List()) => labels => stacked => labels.map((label, i) =>
  renderBar(i)(stacked)(label)(colors.get(i))
).valueSeq();

const onLegendClick = toggleHiddenSeries => (bar) => {
  toggleHiddenSeries(bar.dataKey);
};

export const renderLegend = (labels, toggleHiddenSeries) => (labels.size > 1 ?
  <Legend
    verticalAlign={'top'} align="center" height={30} onClick={toggleHiddenSeries ? onLegendClick(toggleHiddenSeries) : null} /> : <noscript />
  );

export const renderTooltips = (data, hiddenSeries, colors = ['grey']) =>
  <Tooltip cursor={{ fill: colors[0], fillOpacity: 0.1 }} content={<CustomTooltip display={getLongModel(data, hiddenSeries)} />} />;


export const hiddenSeriesState = withStateHandlers({
  hiddenSeries: new Set()
}, {
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
});
