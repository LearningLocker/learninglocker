import program from 'commander';

const cli = () => {
  const ClearUDD = require('./ClearUDD');

  program.version('0.0.1');

  program
  .command('ClearUDD')
  .action(ClearUDD);

  program.parse(process.argv);
};
cli();
