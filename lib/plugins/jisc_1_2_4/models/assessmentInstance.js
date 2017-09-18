import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import softDeletePlugin from 'lib/models/plugins/softDelete';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_4/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import async from 'async';
import * as scopes from 'lib/constants/scopes';
import {
  updateForeignSingular,
  updateForeignMultiple,
  updateLocalSingular,
  updateLocalMultiple
} from 'lib/plugins/jisc_1_2_4/utils/relations';

const schema = new mongoose.Schema({
  MOD_INSTANCE_ID: {
    type: String,
    required: true,
    maxLength: 255,
    readAccess: [
      scopes.ALL,
      scopes.UDD_READ,
      scopes.TRIBAL_INSIGHT,
      scopes.LAP,
      scopes.SSP
    ]
  },
  ASSESS_INSTANCE_ID: {
    type: String,
    required: true,
    maxLength: 255,
    readAccess: [
      scopes.ALL,
      scopes.UDD_READ,
      scopes.TRIBAL_INSIGHT,
      scopes.LAP,
      scopes.SSP
    ]
  },
  ASSESS_TYPE_ID: {
    type: String,
    required: true,
    maxLength: 255,
    readAccess: [
      scopes.ALL,
      scopes.UDD_READ,
      scopes.TRIBAL_INSIGHT,
      scopes.LAP,
      scopes.SSP
    ]
  },
  ASSESS_TYPE_NAME: {
    type: String,
    required: true,
    maxLength: 255,
    readAccess: [
      scopes.ALL,
      scopes.UDD_READ,
      scopes.TRIBAL_INSIGHT,
      scopes.LAP,
      scopes.SSP
    ]
  },
  ASSESS_DETAIL: {
    type: String,
    required: true,
    maxLength: 255,
    readAccess: [
      scopes.ALL,
      scopes.UDD_READ,
      scopes.TRIBAL_INSIGHT,
      scopes.LAP,
      scopes.SSP
    ]
  },
  ASSESS_WEIGHT: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    readAccess: [
      scopes.ALL,
      scopes.UDD_READ,
      scopes.TRIBAL_INSIGHT,
      scopes.LAP,
      scopes.SSP
    ]
  },

  /**
  * Relations
  */
  moduleInstance: {
    type: mongoose.Schema.ObjectId,
    ref: 'ModuleInstance',
    readAccess: [
      scopes.ALL,
      scopes.UDD_READ,
      scopes.TRIBAL_INSIGHT,
      scopes.LAP,
      scopes.SSP
    ]
  },
  studentAssessmentInstances: {
    type: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'StudentAssessmentInstance' }
    ],
    readAccess: [
      scopes.ALL,
      scopes.UDD_READ,
      scopes.TRIBAL_INSIGHT,
      scopes.LAP,
      scopes.SSP
    ]
  },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' }
});
schema.index({ organisation: 1, ASSESS_INSTANCE_ID: 1 }, { unique: true });
const baseScopes = [scopes.ALL, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});

schema.plugin(softDeletePlugin, {
  flush: {
    keep: ['organisation', 'ASSESS_INSTANCE_ID']
  }
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

const updateForeignRelations = (model, next) => {
  const StudentAssessmentInstance = getConnection('JISC_1_2_4').model(
    'StudentAssessmentInstance'
  );
  const ModuleInstance = getConnection('JISC_1_2_4').model('ModuleInstance');

  async.parallel(
    [
      // 'StudentAssessmentInstance.assessmentInstance'
      done =>
        updateForeignSingular(
          StudentAssessmentInstance,
          model,
          {
            ASSESS_INSTANCE_ID: model.ASSESS_INSTANCE_ID,
            organisation: model.organisation
          },
          'assessmentInstance',
          done
        ),

      // 'ModuleInstance.assessmentInstances'
      done =>
        updateForeignMultiple(
          ModuleInstance,
          model,
          {
            MOD_INSTANCE_ID: model.MOD_INSTANCE_ID,
            organisation: model.organisation
          },
          'assessmentInstances',
          done
        )
    ],
    next
  );
};

const updateLocalRelations = (model, next) => {
  const StudentAssessmentInstance = getConnection('JISC_1_2_4').model(
    'StudentAssessmentInstance'
  );
  const ModuleInstance = getConnection('JISC_1_2_4').model('ModuleInstance');

  async.parallel(
    [
      // this.studentAssessmentInstances
      done =>
        updateLocalMultiple(
          StudentAssessmentInstance,
          model,
          {
            ASSESS_INSTANCE_ID: model.ASSESS_INSTANCE_ID,
            organisation: model.organisation
          },
          'studentAssessmentInstances',
          done
        ),

      // this.moduleInstance
      done =>
        updateLocalSingular(
          ModuleInstance,
          model,
          {
            MOD_INSTANCE_ID: model.MOD_INSTANCE_ID,
            organisation: model.organisation
          },
          'moduleInstance',
          done
        )
    ],
    next
  );
};

schema.pre('save', function preSave(next) {
  const model = this;
  async.parallel(
    [
      updateForeignRelations.bind(null, model),
      updateLocalRelations.bind(null, model)
    ],
    next
  );
});

schema.set('toObject', { virtuals: true });

export default getConnection('JISC_1_2_4').model(
  'AssessmentInstance',
  schema,
  'jiscAssessmentInstances'
);
