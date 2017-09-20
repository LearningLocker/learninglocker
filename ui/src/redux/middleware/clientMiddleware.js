export default function clientMiddleware(llClient) {
  return () => next => action => next({ ...action, llClient });
}
