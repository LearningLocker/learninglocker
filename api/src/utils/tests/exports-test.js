/* eslint-disable no-unused-expressions */
import chai from 'chai';
import chaiFs from 'chai-fs';
import path from 'path';
import stream from 'stream';
import ExportDBHelper from 'api/utils/tests/exportsDBHelper';
import { streamToCsv, groupStreams } from 'api/utils/exports';
import { getConnection } from 'lib/connections/mongoose';
import highland from 'highland';
import _ from 'lodash';

const connection = getConnection();

chai.use(chaiFs);
const { expect } = chai;
const exportDBHelper = new ExportDBHelper();

describe('Export helper tests', () => {
  before((done) => {
    if (connection.readyState !== 1) {
      connection.then(() => { done(); });
    } else {
      done();
    }
  });

  beforeEach('Set up statements for testing', (done) => {
    try {
      exportDBHelper.prepare(done);
    } catch (e) {
      console.error(e);
    }
  });

  afterEach('Clear db collections', (done) => {
    exportDBHelper.cleanUp(done);
  });

  describe('groupStreams', () => {
    it('should take 2 streams and output a single stream with length 3', (done) => {
      const xStream = highland(exportDBHelper.xStream);
      const yStream = highland(exportDBHelper.yStream);
      const singleStream = groupStreams([xStream, yStream]);

      singleStream.toArray((res) => {
        expect(res).to.deep.equal(exportDBHelper.singleStream);
        done();
      });
    });
  });

  describe('streamToCsv', () => {
    const testPath = path.join(__dirname, 'testcsv.csv');
    //
    // afterEach(() => {
    //   fs.unlinkSync(testPath);
    // });

    it('should take a stream and store it to a file', (done) => {
      const testStream = highland(_.values(exportDBHelper.statements));
      streamToCsv(['_id'], testStream, testPath).then((csvStream) => {
        expect(csvStream).to.not.be.null;
        expect(csvStream).to.be.instanceOf(stream.Readable);
        done();
      });
    });

    it('should zip 3 streams and store them to a file', (done) => {
      const testStream1 = highland(_.map(exportDBHelper.statements, statement => statement.toObject()));
      const testStream2 = highland(_.map(exportDBHelper.statements, statement => statement.toObject()));
      const testStream3 = highland(_.map(exportDBHelper.statements, statement => statement.toObject()));
      const singleStream = groupStreams([testStream1, testStream2, testStream3]);
      streamToCsv(['_id'], singleStream, testPath).then((csvStream) => {
        expect(csvStream).to.not.be.null;
        expect(csvStream).to.be.instanceOf(stream.Readable);
        done();
      });
    });
  });
});
