{{ Form::model($webhook, ['route' => ['webhook.delete', $lrs->_id, $webhook->_id]]) }}
  <div class="modal-body">
    <p>Are you sure you want to delete this webhook?</p>
  </div>
  <div class="modal-footer">
    {{ Form::submit('Delete', array('class'=>'btn btn-danger')) }}
  </div>
{{ Form::close() }}