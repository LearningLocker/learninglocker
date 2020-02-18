import WebSocket from 'ws';
import Request from 'popsicle/dist/request';
import Response from 'popsicle/dist/response';

declare module 'll' {
  export interface WS extends WebSocket {}

  export interface PopsicleRequest extends Request {}

  export interface PopsicleResponse extends Response {}
}
