import AWS from 'aws-sdk';
import sqsConsumer from 'sqs-consumer';
import Promise, { promisify } from 'bluebird';

AWS.config.update({
  region: process.env.AWS_SQS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SQS_SECRET_ACCESS_KEY
});

export const sqs = new AWS.SQS();

export default async function ({
  to,
  from,
  no
}) {
  const toQueueUrl = (await promisify(sqs.getQueueUrl.bind(sqs))({ QueueName: to })).QueueUrl;

  const fromQueueUrl = (await promisify(sqs.getQueueUrl.bind(sqs))({ QueueName: from })).QueueUrl;

  let noProcessed = 0;

  const consumer = sqsConsumer.create({
    queueUrl: fromQueueUrl,
    handleMessage: (message, done) => {
      sqs.sendMessage({
        QueueUrl: toQueueUrl,
        MessageBody: message.Body,
      }, (err) => {
        if (err) {
          console.error('001 Error: ', err);
          process.exit();
        }
        done();
      });
    },
    sqs
  }).on('error', (err) => {
    console.error('002 Error: ', err);
    process.exit();
  }).on('message_processed', () => {
    noProcessed += 1;

    if (noProcessed % 100 === 0) {
      console.log(`processed ${noProcessed}`);
    }

    if (noProcessed >= no) {
      process.exit();
    }
  });
  console.log('102');

  consumer.start();
}

