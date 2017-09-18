export const PERSON_UPLOAD_QUEUE = 'PERSON_UPLOAD_QUEUE';
export const PARSE_CSV_QUEUE = 'PARSE_CSV_QUEUE';

export const VALID_ROW_HEADERS = {
  username: ['username', 'account'],
  email: ['email'],
  firstname: ['fname', 'first name', 'firstname', 'given name'],
  lastname: ['lname', 'last name', 'lastname', 'surname'],
  openid: ['openid'],
  name: ['name', 'full name'],
  homePage: ['homepage', 'home page', 'platform']
};

export const PERSONA_ALLOWED_FILE_TYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel'
];
export const PERSONA_ALLOWED_FILE_EXT = ['.csv'];

export const LOGO_ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/bmp'
];
export const LOGO_ALLOWED_FILE_EXT = ['.png', '.jpg', '.jpeg', '.bmp'];

export const ERROR_MESSAGE = 'The file you have uploaded is not a supported file type!';
