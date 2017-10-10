import React from 'react';
import { fromJS } from 'immutable';
import {
  compose,
  withHandlers
} from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Card } from 'react-toolbox/lib/Card';
import {
  reduce,
  debounce
} from 'lodash';
import styles from './styles.css';
import HeaderItem from './HeaderItem';
import ScrollSnapper from './ScrollSnapper';

export const generateStructure = ({
  csvHeaders,
  structure
}) => {
  const structureMap = structure;

  const structureMapKeys = structureMap.keySeq().toSet();
  const csvHeadersSet = csvHeaders.toSet();
  const missingHeaderKeys = csvHeadersSet.subtract(structureMapKeys);

  const missingStructure = missingHeaderKeys
    .toMap()
    .mapKeys((key, value) => value)
    .map((value, key) => (fromJS({
      columnName: key,
      columnType: '',
      relatedColumn: null,
      primary: null,
    })));

  const allStructureMap = structureMap.merge(missingStructure);

  const out = allStructureMap
    .sortBy(
      (value, key) => key,
      (keyA, keyB) => {
        const keyAIndex = csvHeaders.indexOf(keyA);
        const keyBIndex = csvHeaders.indexOf(keyB);
        if (keyAIndex > keyBIndex) {
          return 1;
        }
        return -1;
      }
    );

  return out;
};

const render = ({
  csvHeaders,
  structure,
  model,
}) => {
  const renderStructure = generateStructure({
    csvHeaders,
    structure
  });

  return (
    <ScrollSnapper>
      {
        renderStructure.map((columnStructure, name) =>
          (
            <Card className={styles.card}>
              <HeaderItem
                columnName={name}
                columnStructure={columnStructure}
                model={model} />
            </Card>
          )
        ).toList().toJS()
      }
    </ScrollSnapper>
  );
};

export default compose(
  withStyles(styles)
)(render);
