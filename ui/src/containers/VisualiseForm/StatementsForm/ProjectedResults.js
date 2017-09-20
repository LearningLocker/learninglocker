import React from 'react';
import { Map, List } from 'immutable';
import { withVisualisationResults } from 'ui/utils/hocs';
import { getResultsData } from 'ui/components/Charts/Chart';
import { Table } from 'ui/components';

export default withVisualisationResults(({ visualisation, results }) => {
  const filters = visualisation.get('filters', new List());
  const labels = filters.map(filter => filter.get('label'));
  const entries = getResultsData(results)(labels).toList();
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Table
        headings={entries.get(0, new Map()).keySeq().toList()}
        entries={entries}
        columnWidth={100}
        overscanColumnCount={0}
        overscanRowCount={4}
        rowHeight={40} />
    </div>
  );
});
