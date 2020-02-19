import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import logger from 'lib/logger';
import {
  COUNTER,
  FREQUENCY,
  LEADERBOARD,
  STATEMENTS,
  TEMPLATE_ACTIVITY_OVER_TIME,
  TEMPLATE_LAST_7_DAYS_STATEMENTS,
  TEMPLATE_MOST_ACTIVE_PEOPLE,
  TEMPLATE_MOST_POPULAR_ACTIVITIES,
  TEMPLATE_MOST_POPULAR_VERBS,
  TEMPLATE_WEEKDAYS_ACTIVITY,
  TEMPLATE_LEARNING_EXPERIENCE_TYPE,
} from 'lib/constants/visualise';

// Define visualisation model
// because templateId and templateStage have been removed from lib/models/visualisation
const schema = new mongoose.Schema({
  type: { type: String },
  templateId: { type: String },
  templateStage: { type: String },
});

const Visualisation = getConnection().model(
  'VisualisationForMigration',
  schema,
  'visualisations'
);

export const removeTemplateIdAndTemplateStage = async () => {
  try {
    const visualisations = await Visualisation.find();

    for (const visualisation of visualisations) {
      try {
        if (visualisation.templateStage !== undefined) {
          visualisation.templateStage = undefined;
        }

        if (visualisation.templateId !== undefined) {
          switch (visualisation.templateId) {
            case '1':
              visualisation.type = TEMPLATE_LAST_7_DAYS_STATEMENTS;
              break;
            case '2':
              visualisation.type = TEMPLATE_ACTIVITY_OVER_TIME;
              break;
            case '3':
              visualisation.type = TEMPLATE_MOST_POPULAR_VERBS;
              break;
            case '4':
              visualisation.type = TEMPLATE_MOST_POPULAR_ACTIVITIES;
              break;
            case '5':
              visualisation.type = TEMPLATE_MOST_ACTIVE_PEOPLE;
              break;
            case '6':
              visualisation.type = TEMPLATE_WEEKDAYS_ACTIVITY;
              break;
            case '7':
              visualisation.type = TEMPLATE_LEARNING_EXPERIENCE_TYPE;
              break;
            default:
              throw new Error(`templateId ${visualisation.templateId} is invalid`);
          }
          visualisation.templateId = undefined;
        }

        await visualisation.save();
      } catch (err) {
        logger.error(`Error (visualisation._id ${visualisation.get('_id')})`, err);
      }
    }
  } catch (error) {
    logger.error(error);
  }
};


export const addTemplateIdAndTemplateStage = async () => {
  try {
    const visualisations = await Visualisation.find();

    for (const visualisation of visualisations) {
      try {
        switch (visualisation.type) {
          case TEMPLATE_LAST_7_DAYS_STATEMENTS:
            visualisation.type = COUNTER;
            visualisation.templateId = '1';
            visualisation.templateStage = 'completed';
            break;
          case TEMPLATE_ACTIVITY_OVER_TIME:
            visualisation.type = FREQUENCY;
            visualisation.templateId = '2';
            visualisation.templateStage = 'completed';
            break;
          case TEMPLATE_MOST_POPULAR_VERBS:
            visualisation.type = LEADERBOARD;
            visualisation.templateId = '3';
            visualisation.templateStage = 'completed';
            break;
          case TEMPLATE_MOST_POPULAR_ACTIVITIES:
            visualisation.type = LEADERBOARD;
            visualisation.templateId = '4';
            visualisation.templateStage = 'completed';
            break;
          case TEMPLATE_MOST_ACTIVE_PEOPLE:
            visualisation.type = LEADERBOARD;
            visualisation.templateId = '5';
            visualisation.templateStage = 'completed';
            break;
          case TEMPLATE_WEEKDAYS_ACTIVITY:
            visualisation.type = STATEMENTS;
            visualisation.templateId = '6';
            visualisation.templateStage = 'completed';
            break;
          case TEMPLATE_LEARNING_EXPERIENCE_TYPE:
            visualisation.type = LEADERBOARD;
            visualisation.templateId = '7';
            visualisation.templateStage = 'completed';
            break;
          default:
            visualisation.templateId = undefined;
            visualisation.templateStage = undefined;
        }

        await visualisation.save();
      } catch (err) {
        logger.error(`Error (visualisation._id ${visualisation.get('_id')})`, err);
      }
    }
  } catch (error) {
    logger.error(error);
  }
};
