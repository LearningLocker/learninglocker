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
  structure,
  model,
  disabled
}) =>
  (
    <ScrollSnapper>
      {
        structure.map((columnStructure, name) =>
          (
            <Card key={name} className={styles.card}>
              <HeaderItem
                columnName={name}
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

export default compose(
  withStyles(styles)
)(ColumnHeaderEditor);
