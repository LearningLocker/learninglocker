import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'api/auth/passport';
import HttpRoutes from 'api/routes/HttpRoutes';
import logger from 'lib/logger';
import { install } from 'source-map-support';
import WebSocket from 'ws';
import websockets from 'api/websockets';

install();

process.on('SIGINT', () => {
  process.exit(0);
});
const corsMiddleware = cors({ origin: '*', preflightContinue: true });
const app = express();
app.use(corsMiddleware);
app.options('*', corsMiddleware);

app.use(bodyParser.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(HttpRoutes);


if (process.env.API_PORT) {
  const server = app.listen(process.env.API_PORT, (err) => {
    if (err) {
      logger.error(err);
    }
    logger.info(
      '\n --- \n',
      `==> 🌎  API is running on port ${process.env.API_PORT}`,
      '\n',
      `==> 💻  Send requests to http://${process.env.API_HOST}:${process.env.API_PORT}`,
      '\n',
      '--- \n'
    );
    if (process.send) process.send('ready');
  });

  const wss = new WebSocket.Server({
    server
  });
  wss.on('connection', (ws) => {
    websockets.add(ws);
  });
} else {
  logger.error(
    '==>     ERROR: No PORT environment variable has been specified'
  );
}
export default app;
