import Organisation from 'lib/models/organisation';
import ScoringScheme from 'lib/models/scoringscheme';
import Persona from 'lib/models/persona';
import PersonaIdentifier from 'lib/models/personaidentifier';
import ImportCsv from 'lib/models/importcsv';
import ImportData from 'lib/models/importdata';
import async from 'async';

export default class PersonasDBHelper {

  upload =[
    ['username', 'password', 'firstname', 'lastname', 'email', 'phone1', 'institution', 'address', 'city', 'country', 'homepage', 'openid'],
    ['sofia.ab', 'password1!', 'Sofia', 'Abrahams', 'Sofia.Abrahams@email.com', '(844) 718-6610', 'Wal-Mart Stores ', '250 Cinder  Berry  Corner 19614', 'Kabul ', 'AF', 'http://moodle.ht2.co.uk', '1'],
    ['tania.sm', 'password1!', 'Tania', 'Smail', 'Tania.Smail@email.com', '(844) 132-0958', 'Exxon Mobil ', '21 Cinder  Brook  Cove 13820', 'Luanda ', 'AO', 'http://moodle.ht2.co.uk', '2'],
    ['nannie.gl', 'password1!', 'Nannie', 'Glennon', 'Nannie.Glennon@email.com', '(844) 335-2563', 'Chevron ', '111 Clear  Barn  Arbor 11770', 'Buenos Aires ', 'AR', 'http://moodle.ht2.co.uk', '3']
  ];

  uploadSingleMultiIdents = ['sofia.ab', 'password1!', 'Sofia', 'Abrahams', 'Sofia.Abrahams@email.com', '(844) 718-6610', 'Wal-Mart Stores ', '250 Cinder  Berry  Corner 19614', 'Kabul ', 'AF', 'http://moodle.ht2.co.uk', '1'];
  uploadSingleIdent = ['sofia.ab', 'password1!', 'Sofia', 'Abrahams', 'Sofia.Abrahams@email.com', '(844) 718-6610', 'Wal-Mart Stores ', '250 Cinder  Berry  Corner 19614', 'Kabul ', 'AF'];

  orgId = '56fbb868f1ec870140f0f9f8';

  personaIdentifiers = [{ key: 'statement.actor.mbox', value: 'mailto:sofia.abrahams@email.com' }, { key: 'statement.actor.account', value: { name: 'sofia.ab', homePage: 'http://moodle.ht2.co.uk' } }, { key: 'statement.actor.openid', value: '1' }]
  otherIdentifiers = [{ key: 'statement.actor.mbox', value: 'sofia.abrahams@email.com' }, { key: 'statement.actor.name', value: 'sofia abrahams' }, { key: 'statement.actor.account.name', value: 'sofia.ab' }]

  persona = { __v: 0, createdAt: '2016-08-16T12:27:59.281Z', updatedAt: '2016-08-16T12:27:59.281Z', organisation: '56fbb868f1ec870140f0f9f8', name: 'Sofia Abrahams', _id: '57b306cfa5ee852473c65fb3', personStudents: [], personStatements: [], identifiers: [], personaIdentifiers: [] }

  /**
   * Remove all models from an array of schemas
   */
  cleanModels = (models, done, query = {}) => {
    async.forEach(models, (model, doneDeleting) => {
      model.remove(query, doneDeleting);
    }, done);
  }

  getUpload = () => this.upload;
  getUploadSingleMultiIdents = () => this.uploadSingleMultiIdents;
  getUploadSingleIdent = () => this.uploadSingleIdent;
  getOrg = () => this.orgId;

  getPersonaIdentifiers = () => this.personaIdentifiers;
  getOtherIdentifiers = () => this.otherIdentifiers;
  getPersona = () => this.persona;

  prepare = (done) => {
    async.parallel({
      organisation: insertDone => Organisation.create({ _id: this.orgId, name: 'Test org' }, insertDone),
      scoringScheme: insertDone => ScoringScheme.create({ organisation: this.orgId }, insertDone),
      importModel: insertDone => ImportCsv.create({
        _id: '57b2d8479bebf26c6fe4eabb',
        createdAt: '2016-08-16T09:09:27.272Z',
        updatedAt: '2016-08-16T09:09:27.523Z',
        organisation: '57305dc2eeb23d663b742711',
        owner: '5784e842aad0de6447c18fe9',
        uploadStatus: {
          remainingCount: 0,
          totalCount: 0,
          inProgress: false
        },
        matchedIndexes: {
          _id: '57b2d847ce1c5c0d6e58534a',
          homePageIndex: 10,
          nameIndex: -1,
          openIdIndex: 11,
          lastnameIndex: 3,
          firstnameIndex: 2,
          emailIndex: 4,
          usernameIndex: 0
        },
        __v: 0
      }, insertDone),
      importData: insertDone => ImportData.create({
        _id: '57b3216f6d253f2032698867',
        createdAt: '2016-08-16T14:21:35.523Z',
        updatedAt: '2016-08-16T14:21:35.523Z',
        importModel: '57b2d8479bebf26c6fe4eabb',
        data: [
          'darcy.st',
          'password1!',
          'Darcy',
          'Styron',
          'Darcy.Styron@email.com',
          '(833) 856-0063',
          'Cardinal Health ',
          '79 Cinder  Beacon  Bank 11541',
          'Chongqing ',
          'CN',
          'http://moodle.ht2.co.uk',
          '17'
        ],
        __v: 0
      },
        {
          _id: '57b3216f6d253f2032698868',
          createdAt: '2016-08-16T14:21:35.524Z',
          updatedAt: '2016-08-16T14:21:35.524Z',
          importModel: '57b2d8479bebf26c6fe4eabb',
          data: [
            'neil.bu',
            'password1!',
            'Neil',
            'Burkle',
            'Neil.Burkle@email.com',
            '(844) 897-8999',
            'CVS Caremark ',
            '239 Burning  Blossom  Corner 13681',
            'Dongguan ',
            'CN',
            'http://moodle.ht2.co.uk',
            '18'
          ],
          __v: 0
        },
        {
          _id: '57b3216f6d253f2032698869',
          createdAt: '2016-08-16T14:21:35.525Z',
          updatedAt: '2016-08-16T14:21:35.525Z',
          importModel: '57b2d8479bebf26c6fe4eabb',
          data: [
            'margery.ar',
            'password1!',
            'Margery',
            'Armstong',
            'Margery.Armstong@email.com',
            '(855) 465-7837',
            'Wells Fargo ',
            '177 Amber  Apple  Court 14374',
            'Guangzhou ',
            'CN',
            'http://moodle.ht2.co.uk',
            '19'
          ],
          __v: 0
        },
        {
          _id: '57b3216f6d253f203269886a',
          createdAt: '2016-08-16T14:21:35.525Z',
          updatedAt: '2016-08-16T14:21:35.525Z',
          importModel: '57b2d8479bebf26c6fe4eabb',
          data: [
            'jeanie.ka',
            'password1!',
            'Jeanie',
            'Kaczorowski',
            'Jeanie.Kaczorowski@email.com',
            '(899) 490-8205',
            'International Business Machines ',
            '74 Crystal  Autumn  Crest 19353',
            'Guiyang ',
            'CN',
            'http://moodle.ht2.co.uk',
            '20'
          ],
          __v: 0
        }, insertDone),
    }, (err, results) => {
      this.organisation = results.organisation;
      this.importModel = results.importModel;
      this.importData = results.importData;
      done(err);
    });
  }

  cleanUp = (done) => {
    this.cleanModels([Organisation, ScoringScheme, Persona, PersonaIdentifier, ImportCsv, ImportData], done);
  }
}
