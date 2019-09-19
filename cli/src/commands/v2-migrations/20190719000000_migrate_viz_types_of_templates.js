import {
  removeTemplateIdAndTemplateStage,
  addTemplateIdAndTemplateStage,
} from '../migrateVizTypesOfTemplates';

const up = async () => {
  await removeTemplateIdAndTemplateStage();
};

const down = async () => {
  await addTemplateIdAndTemplateStage();
};

export default { up, down };
