import React from 'react';
import {
  compose,
} from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Card } from 'react-toolbox/lib/card';
import styles from './styles.css';
import HeaderItem from './HeaderItem';
import ScrollSnapper from './ScrollSnapper';

export const ColumnHeaderEditor = ({
  model, // personasImports model
  disabled
}) => {
  const structure = model.get('structure', new Map());
  return (
    <ScrollSnapper>
      {
        structure.map((columnStructure, columnName) =>
          (
            <Card key={columnName} className={styles.card}>
              <HeaderItem
                columnName={columnName}
                columnStructure={columnStructure}
                structure={structure}
                model={model}
                disabled={disabled} />
            </Card>
          )
        ).toList().toJS()
      }
    </ScrollSnapper>
  );
};

export default compose(
  withStyles(styles)
)(ColumnHeaderEditor);
