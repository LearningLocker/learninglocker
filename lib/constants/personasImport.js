export const STAGE_UPLOAD = 'STAGE_UPLOAD';
export const STAGE_CONFIGURE_FIELDS = 'STAGE_CONFIGURE_FIELDS';
export const STAGE_IMPORTED = 'STAGE_IMPORTED';

export const COLUMN_NAME = 'COLUMN_NAME'; // personas name
export const COLUMN_MBOX = 'COLUMN_MBOX';
export const COLUMN_MBOXSHA1SUM = 'COLUMN_MBOXSHA1SUM';
export const COLUMN_OPENID = 'COLUMN_OPENID';
export const COLUMN_ACCOUNT_KEY = 'COLUMN_ACCOUNT_KEY';
export const COLUMN_ACCOUNT_VALUE = 'COLUMN_ACCOUNT_VALUE';

export const COLUMN_ATTRIBUTE_DATA = 'COLUMN_ATTRIBUTE_DATA';

export const COLUMN_TYPES = [
  COLUMN_NAME,

  COLUMN_MBOX,
  COLUMN_MBOXSHA1SUM,
  COLUMN_OPENID,
  COLUMN_ACCOUNT_KEY,
  COLUMN_ACCOUNT_VALUE,
  COLUMN_ATTRIBUTE_DATA,
];

export const COLUMN_TYPE_LABELS = {
  [COLUMN_NAME]: 'Persona name',

  [COLUMN_MBOX]: 'Identifier mbox',
  [COLUMN_MBOXSHA1SUM]: 'Identifier mbox sha1sum',
  [COLUMN_OPENID]: 'Identifier open id',
  [COLUMN_ACCOUNT_KEY]: 'Account home page',
  [COLUMN_ACCOUNT_VALUE]: 'Account name',

  [COLUMN_ATTRIBUTE_DATA]: 'Attribute value',
  // [COLUMN_ATTRIBUTE_DATA_KEY]: 'Attribute key',

  // [COLUMN_IFI_KEY]: 'Identifier key',
  // [COLUMN_IFI_VALUE]: 'Identifier value',
};

export const RELATED_COLUMN_MAP = {
  [COLUMN_ACCOUNT_KEY]: {
    related: [COLUMN_ACCOUNT_VALUE]
  },
};

export const IDENTIFIER_KEYS = [
  COLUMN_MBOX,
  COLUMN_MBOXSHA1SUM,
  COLUMN_OPENID,
  COLUMN_ACCOUNT_KEY
];
