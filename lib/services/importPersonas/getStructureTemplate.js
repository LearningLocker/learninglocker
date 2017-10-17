import PersonasImport from 'lib/models/personasImport';

const getMatchingStructures = csvHeaders =>
  PersonasImport.aggregate([{
    $match: {
      csvHeaders: {
        $not: { // csvHeaders is a super set.
          $elemMatch: {
            $nin: csvHeaders
          }
        }
      }
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

export default async (csvHeaders) => {
  const matches = await getMatchingStructures(csvHeaders);
  const firstMatch = matches[0];

  return firstMatch && firstMatch.structure;
};
