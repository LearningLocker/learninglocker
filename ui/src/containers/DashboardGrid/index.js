import React, { PropTypes } from 'react';
import { List, Map } from 'immutable';
import {
  compose,
  withHandlers,
  shouldUpdate,
  setPropTypes,
  defaultProps
} from 'recompose';
import ReactGridLayout from 'react-grid-layout';
import map from 'lodash/map';
import pick from 'lodash/pick';
import size from 'lodash/size';
import dimensions from 'react-dimensions';
import Widget from 'ui/containers/Widget';

const enhance = compose(
  setPropTypes({
    widgets: PropTypes.instanceOf(List).isRequired,
    onChange: PropTypes.func,
    onChangeTitle: PropTypes.func,
    onChangeVisualisation: PropTypes.func,
    editable: PropTypes.bool
  }),
  defaultProps({
    editable: true,
    onChange: () => null,
    onChangeTitle: () => null,
    onChangeVisualisation: () => null
  }),
  withHandlers({
    onDelete: ({ onChange, widgets }) => (selectedModel) => {
      const newWidgets = widgets
        .filter(model => model.get('_id') !== selectedModel.get('_id'))
        .toList();
      onChange(newWidgets, true);
    },
    onLayoutChange: ({ widgets, onChange }) => (newLayout) => {
      try {
        const groupedWidgets = widgets.toMap().mapKeys((k, v) => v.get('_id'));
        const newWidgets = new List(
          map(newLayout, (layout) => {
            const widget = groupedWidgets.get(layout.i);
            const newDimensions = new Map(pick(layout, ['x', 'y', 'h', 'w']));
            const newWidget = widget.merge(newDimensions);
            return newWidget;
          })
        );

        if (size(newWidgets) > 0) {
          onChange(newWidgets);
          // if (window) window.dispatchEvent(new Event('resize'));
          if (window) {
            const evt = document.createEvent('UIEvents');
            evt.initUIEvent('resize', true, false, window, 0);
            window.dispatchEvent(evt);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }),
  dimensions(),
  shouldUpdate((props, nextProps) =>
    !nextProps.widgets.equals(props.widgets)
  )
);

const getLayout = widgets =>
  widgets.map((widget) => {
    const _id = widget.get('_id', Math.random().toString());
    return {
      i: _id,
      x: widget.get('x', 0),
      y: widget.get('y', 0),
      w: widget.get('w', 4),
      h: widget.get('h', 4),
      minW: 2,
      minH: 4
    };
  });

const render = ({
  containerWidth,
  widgets,
  editable,
  onDelete,
  onLayoutChange,
  onChangeTitle,
  onChangeVisualisation
}) => {
  const sortedWidgets = widgets.sortBy(widget => widget.get('y', 0));
  const layout = getLayout(sortedWidgets);
  const divItems = sortedWidgets
    .map((widget, index) => (
      <div key={widget.get('_id')}>
        <Widget
          model={widget}
          editable={editable}
          onDelete={onDelete.bind(null, widget)}
          onChangeTitle={onChangeTitle.bind(null, index)}
          onChangeVisualisation={onChangeVisualisation.bind(null, index)} />
      </div>
    ))
    .valueSeq();

  return (
    <ReactGridLayout
      className="layout"
      isDraggable={editable}
      isResizable={editable}
      layout={layout.toJS()}
      cols={12}
      rowHeight={30}
      width={containerWidth}
      onLayoutChange={onLayoutChange}
      draggableHandle=".react-drag-handle">
      {divItems}
    </ReactGridLayout>
  );
};

export default enhance(render);
