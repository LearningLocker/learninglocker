import { fix, back } from '../fixTypoLast1Years';

const up = async () => {
  await fix();
};

const down = async () => {
  await back();
};

export default { up, down };
