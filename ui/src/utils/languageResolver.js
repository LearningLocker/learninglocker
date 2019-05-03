import { map, isNull } from 'lodash';

const getLabel = (name) => {
  const navLangs = (navigator && navigator.languages) || [];

  const allLanguages = name;

  const outLangs = map(navLangs, lang => allLanguages.get(lang, null))
    .filter(item2 => !isNull(item2));

  if (outLangs.length === 0) {
    return allLanguages.first();
  }

  return outLangs[0];
};

export default getLabel;
