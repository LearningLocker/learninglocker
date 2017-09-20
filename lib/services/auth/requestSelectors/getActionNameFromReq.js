export default (req) => {
  if (req.method === 'GET') return 'view';
  if (req.method === 'DELETE') return 'delete';
  if (req.method === 'POST' && !req.params.id) return 'create';
  return 'edit';
};
