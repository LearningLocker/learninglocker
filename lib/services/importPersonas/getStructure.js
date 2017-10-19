import PersonasImport from 'lib/models/personasImport';
import { fromJS } from 'immutable';

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

const getMatchingStructures = ({
  csvHeaders,
  filter
}) =>
  PersonasImport.aggregate([
    {
      $match: {
        csvHeaders: {
          $not: { // csvHeaders is a super set.
            $elemMatch: {
              $nin: csvHeaders
            }
          }
        },
        ...filter
      }
    },
    {
      $project: {
        structure: 1,
        updatedAt: 1,
        csvHeadersSize: {
          $size: '$csvHeaders'
        }
      }
    },
    {
      $sort: {
        csvHeadersSize: -1,
        updatedAt: -1,
      }
    }, {
      $limit: 1
    }
  ]);

export default async ({
  csvHeaders,
  filter
}) => {
  const matches = await getMatchingStructures({
    csvHeaders,
    filter
  });
  const firstMatch = matches[0];

  const structure = (firstMatch && firstMatch.structure) || {};

  return generateStructure({
    csvHeaders: fromJS(csvHeaders),
    structure: fromJS(structure)
  }).toJS();
};
