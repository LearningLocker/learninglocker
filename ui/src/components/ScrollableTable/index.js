import React, { useEffect, useState, createRef } from 'react';
import _ from 'lodash';
import styled, { css } from 'styled-components';

const TableContainer = styled.div`
  height: 100%;
  overflow-x: scroll;
  overflow-y: scroll;
`;

const Table = styled.table`
  border-collapse: separate;
  margin: 0;
  border: 0;

  > thead > tr > th,
  > thead > tr > td,
  > tbody > tr > th,
  > tbody > tr > td,
  > tfoot > tr > th,
  > tfoot > tr > td {
    border: 0;
  }

  > thead > tr > th,
  > thead > tr > td,
  > tfoot > tr > th,
  > tfoot > tr > td {
    border-top: 1px solid #ddd !important;
    border-left: 1px solid #ddd !important;
  }

  > thead > tr:last-child > th,
  > thead > tr:last-child > td,
  > tfoot > tr:last-child > th,
  > tfoot > tr:last-child > td {
    border-bottom: 1px solid #ddd !important;
  }

  > thead > tr > th:last-child,
  > thead > tr > td:last-child,
  > tfoot > tr > th:last-child,
  > tfoot > tr > td:last-child {
    border-right: 1px solid #ddd !important;
  }

  > tbody > tr > th,
  > tbody > tr > td {
    border-left: 1px solid #ddd !important;
    border-bottom: 1px solid #ddd !important;
  }

  > tbody > tr:last-child > th,
  > tbody > tr:last-child > td {
    border-left: 1px solid #ddd !important;
  }

  > tbody > tr > th:last-child,
  > tbody > tr > td:last-child {
    border-right: 1px solid #ddd !important;
  }
`;

const tableSectionStylesMixin = css`
  > tr:nth-child(odd) {
    > th,
    > td {
      background-color: ${props => props.isWhiteStartingStripe && '#ffffff' || '#f9f9f9'};
    }
  }

  > tr:nth-child(even) {
    > th,
    > td {
      background-color: ${props => props.isWhiteStartingStripe && '#f9f9f9' || '#ffffff'};
    }
  }
`;

const TableHead = styled.thead`${tableSectionStylesMixin}`;
const TableBody = styled.tbody`${tableSectionStylesMixin}`;
const TableFooter = styled(TableHead)``;

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

const renderHead = ({
  tHead,
  trsInTHead,
  fixTHead,
  tHeadTrsRefs,
  tHeadTrsTops,
  isWhiteStartingStripe
}) => {
  if (!tHead) {
    return null;
  }

  return (
    <TableHead isWhiteStartingStripe={isWhiteStartingStripe}>
      {
        trsInTHead.map((tr, i) => {
          const childStyle = (fixTHead && _.isNumber(tHeadTrsTops[i]))
            ? {
              position: 'sticky',
              top: tHeadTrsTops[i]
            }
            : {};

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
    </TableHead>
  );
};

const renderBody = ({ tBody, trsInTBody, isWhiteStartingStripe }) => {
  if (!tBody) {
    return null;
  }

  return (
    <TableBody isWhiteStartingStripe={isWhiteStartingStripe}>
      {trsInTBody}
    </TableBody>
  );
};

const renderFooter = ({
  tFoot,
  trsInTFoot,
  fixTFoot,
  tFootTrsBottoms,
  tFootTrsRefs,
  isWhiteStartingStripe
}) => {
  if (!tFoot) {
    return null;
  }

  return (
    <TableFooter isWhiteStartingStripe={isWhiteStartingStripe}>
      {
        trsInTFoot
          .flat()
          .map((tr, i) => {
            const childStyle = (fixTFoot && _.isNumber(tFootTrsBottoms[i + 1]))
              ? {
                position: 'sticky',
                bottom: tFootTrsBottoms[i + 1]
              }
              : {};

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
    </TableFooter>
  );
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

  const tHeadTrsTops = tHeadTrsHeights
    .reduce(
      (acc, height) => {
        const previousTop = acc[acc.length - 1];

        if (previousTop === null || height === null) {
          return [...acc, null];
        }

        return [...acc, previousTop + height];
      },
      [0]
    );

  const tFootTrsBottoms = [...tFootTrsHeights]
    .reverse()
    .reduce(
      (acc, height) => {
        const previousBottom = acc[0];

        if (previousBottom === null || height === null) {
          return [null, ...acc];
        }

        return [previousBottom + height, ...acc];
      },
      [0]
    );

  const tHeadIsWhiteStartingStripe = false;
  const tBodyIsWhiteStartingStripe = (trsInTHead.length % 2 === 0);
  const tFootIsWhiteStartingStripe = ((trsInTHead.length + trsInTBody.length) % 2 === 0);

  return (
    <TableContainer>
      <Table className={'table table-bordered table-striped'}>
        {renderHead({ tHead, trsInTHead, fixTHead, tHeadTrsRefs, tHeadTrsTops, tHeadIsWhiteStartingStripe })}

        {renderBody({ tBody, trsInTBody, tBodyIsWhiteStartingStripe })}

        {renderFooter({ tFoot, trsInTFoot, fixTFoot, tFootTrsRefs, tFootTrsBottoms, tFootIsWhiteStartingStripe })}
      </Table>
    </TableContainer>
  );
};

export default ScrollableTable;
