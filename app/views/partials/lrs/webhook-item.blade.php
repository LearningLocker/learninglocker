<td>{{ $webhook->verb }}</td>
<td>{{ $webhook->req_type }}</td>
<td>{{ $webhook->req_url }}</td>
<td class="text-center">
  <button type="button" class="btn btn-info btn-sm" data-toggle="modal" data-target="#webhook-edit-{{$webhook->_id}}">
    <i class="icon-pencil"></i>
  </button>
</td>
<td class="text-center">
  <button type="button" class="btn btn-danger btn-sm" data-toggle="modal" data-target="#webhook-delete-{{$webhook->_id}}">
    <i class="icon-trash"></i>
  </button>
</td>
<!-- Modal -->
<div class="modal fade" id="webhook-edit-{{$webhook->_id}}">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myModalLabel">Edit</h4>
      </div>
      @include('partials.lrs.forms.webhook-edit')
    </div>
  </div>
</div>
<div class="modal fade" id="webhook-delete-{{$webhook->_id}}">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myModalLabel">Delete</h4>
      </div>
      @include('partials.lrs.forms.webhook-delete')
    </div>
  </div>
</div>