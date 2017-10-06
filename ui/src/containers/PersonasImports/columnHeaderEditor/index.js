import React from 'react';
import { fromJS } from 'immutable';
import HeaderItem from './HeaderItem';

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
  model
}) => {
  const renderStructure = generateStructure({
    csvHeaders,
    structure
  });

  return (<div>{
    renderStructure.map((columnStructure, name) => {
      return (
        <HeaderItem
          columnName={name}
          columnStructure={columnStructure}
          model={model} />
      );
    }).toList().toJS()
  }</div>);
};

export default render;
