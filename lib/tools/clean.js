import path from 'path';
import { cleanDir } from './fs';

/**
 * Cleans up the output (build) directory.
 */
function clean({ rootDir }) {
  return Promise.all([
    cleanDir(path.join(rootDir, 'build/*'), {
      nosort: true,
      dot: true,
      ignore: [
        path.join(rootDir, 'build/.git'),
        path.join(rootDir, 'build/public')
      ],
    }),

    cleanDir(path.join(rootDir, 'build/public/*'), {
      nosort: true,
      dot: true,
      ignore: [
        path.join(rootDir, 'build/public/.git')
      ],
    }),
  ]);
}

export default clean;
