import * as scopes from 'lib/constants/scopes';
import {
  forEach,
  isString,
} from 'lodash';
import orgScopes from 'lib/constants/orgScopes';

const generateScopes = () => {
  forEach(scopes, (description, key) => {
    if (isString(description)) {
      process.stdout.write(`${key} | | ${description}.\n`);
    } else {
      forEach(description, (description2, key2) => {
        process.stdout.write(`${key} | ${key2} | ${description2}.\n`);
      });
    }
  });
};

const generateOrgScopes = () => {
  forEach(orgScopes, (scope) => {
    process.stdout.write(
      `${scope} |\n`
    );
  });
};

export default function ({ type }) {
  if (type === 'scopes') {
    generateScopes();
  } else if (type === 'orgScopes') {
    generateOrgScopes();
  }

  process.exit();
}
