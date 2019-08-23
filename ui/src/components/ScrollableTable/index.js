import React, { useEffect, useState, createRef } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import _ from 'lodash';
import styles from './styles.css';

/**
 * @param {React.RefObject} ref
 * @returns {number|null}
 */
const refToClientHeight = (ref) => {
  if (ref && ref.current && ref.current.clientHeight) {
    return ref.current.clientHeight;
  }
  return null;
};

/**
 * @param {(number|null)[]} hs1
 * @param {(number|null)[]} hs2
 * @returns {boolean}
 */
const areSameHeights = (hs1, hs2) =>
  hs1.length === hs2.length && hs1.every((h, i) => h === hs2[i]);

/**
 * @param {boolean} fixTHead - default is false
 * @param {boolean} fixTFoot - default is false
 * @param {array} children
 *   1 or 0 thead
 *   1 or 0 tbody
 *   1 or 0 tfoot
 *
 * Children of <thead/>, <tbody/>, and <tfoot/> should be <tr/> or an array of <tr/>
 * Children of <tr/> should be <th/>, <td/>, or an array of <th/> or <td/>
 */
const ScrollableTable = ({
  fixTHead = false,
  fixTFoot = false,
  children = [],
}) => {
  const tHead = children.find(c => c.type === 'thead');
  const tBody = children.find(c => c.type === 'tbody');
  const tFoot = children.find(c => c.type === 'tfoot');

  const trsInTHead = tHead ? (tHead.props.children || []).flat().filter(c => c.type === 'tr') : [];
  const trsInTBody = tBody ? (tBody.props.children || []).flat().filter(c => c.type === 'tr') : [];
  const trsInTFoot = tFoot ? (tFoot.props.children || []).flat().filter(c => c.type === 'tr') : [];

  const tHeadTrsRefs = trsInTHead.map(() => createRef());
  const tFootTrsRefs = trsInTFoot.map(() => createRef());

  const [tHeadTrsHeights, updateTHeadTrsHeights] = useState([]);
  const [tFootTrsHeights, updateTFootTrsHeights] = useState([]);

  useEffect(() => {
    const tHeadTrsHeightsFromRefs = tHeadTrsRefs.map(refToClientHeight);
    if (!areSameHeights(tHeadTrsHeights, tHeadTrsHeightsFromRefs)) {
      updateTHeadTrsHeights(tHeadTrsHeightsFromRefs);
    }

    const tFootTrsHeightsFromRefs = tFootTrsRefs.map(refToClientHeight);
    if (!areSameHeights(tFootTrsHeights, tFootTrsHeightsFromRefs)) {
      updateTFootTrsHeights(tFootTrsHeightsFromRefs);
    }
  });

  const tHeadTrsTops = tHeadTrsHeights.reduce((acc, height) => {
    const previousTop = acc[acc.length - 1];
    if (previousTop === null || height === null) {
      return [...acc, null];
    }
    return [...acc, previousTop + height];
  }, [0]);

  const tFootTrsBottoms = [...tFootTrsHeights].reverse().reduce((acc, height) => {
    const previousBottom = acc[0];
    if (previousBottom === null || height === null) {
      return [null, ...acc];
    }
    return [previousBottom + height, ...acc];
  }, [0]);

  const tHeadClass = styles.greyStartingStripe;
  const tBodyClass = (trsInTHead.length % 2 === 0) ? styles.greyStartingStripe : styles.whiteStartingStripe;
  const tFootClass = ((trsInTHead.length + trsInTBody.length) % 2 === 0) ? styles.greyStartingStripe : styles.whiteStartingStripe;

  return (
    <div className={styles.tableContainer}>
      <table className={`${styles.table} table table-bordered table-striped`}>
        {tHead && (
          <thead className={tHeadClass}>
            {
              trsInTHead.map((tr, i) => {
                const childStyle = (fixTHead && _.isNumber(tHeadTrsTops[i])) ? { position: 'sticky', top: tHeadTrsTops[i] } : {};
                return (
                  <tr
                    key={tr.key || i}
                    ref={tHeadTrsRefs[i]}>
                    {
                      tr.props.children
                        .flat()
                        .filter(cell => ['td', 'th'].some(t => t === cell.type))
                        .map((cell, j) => React.createElement(
                          cell.type,
                          {
                            ...cell.props,
                            key: cell.key || `thead-tr-c-${i}-${j}`,
                            style: childStyle
                          },
                        ))
                    }
                  </tr>
                );
              })
            }
          </thead>
        )}

        {tBody && (
          <tbody className={tBodyClass}>
            {trsInTBody}
          </tbody>
        )}

        {tFoot && (
          <thead className={tFootClass}>
            {
              trsInTFoot.flat().map((tr, i) => {
                const childStyle = (fixTFoot && _.isNumber(tFootTrsBottoms[i + 1])) ? { position: 'sticky', bottom: tFootTrsBottoms[i + 1] } : {};
                return (
                  <tr
                    key={tr.key || i}
                    ref={tFootTrsRefs[i]}>
                    {
                      tr.props.children
                        .flat()
                        .filter(cell => ['td', 'th'].some(t => t === cell.type))
                        .map((cell, j) => React.createElement(
                          cell.type,
                          {
                            ...cell.props,
                            key: cell.key || `tfoot-tr-c-${i}-${j}`,
                            style: childStyle
                          },
                        ))
                    }
                  </tr>
                );
              })
            }
          </thead>
        )}
      </table>
    </div>
  );
};

export default withStyles(styles)(ScrollableTable);
