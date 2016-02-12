{{ Form::model($webhook, ['route' => ['webhook.update', $lrs->_id, $webhook->_id]]) }}
  <div class="modal-body">
    <div class="form-group">
      {{ Form::label('verb', 'Listen on verb:', ['class' => 'control-label']) }}
      {{ Form::text('verb', $webhook->verb, ['class' => 'form-control']) }}
      <span class="help-block">E.g. http://adlnet.gov/expapi/verbs/completed, http://adlnet.gov/expapi/verbs/passed</span>
    </div>
    <div class="form-group">
      {{ Form::label('req_type', 'Request type:', ['class' => 'control-label']) }}
      {{ Form::select('req_type', ['POST' => 'POST', 'PUT' => 'PUT', 'DELETE' => 'DELETE', 'GET' => 'GET'], $webhook->req_type, ['class' => 'form-control']) }}
    </div>
    <div class="form-group">
      {{ Form::label('req_url', 'URL:', ['class' => 'control-label']) }}
      {{ Form::text('req_url', $webhook->req_url, ['class' => 'form-control']) }}
    </div>
    <div class="form-group">
      {{ Form::label('req_headers', 'Request headers:', ['class' => 'control-label']) }}
      {{ Form::textarea('req_headers', $webhook->req_headers, ['class' => 'form-control', 'rows' => 6]) }}
    </div>
    <div class="form-group">
      {{ Form::label('req_payload', 'Request payload:', ['class' => 'control-label']) }}
      {{ Form::textarea('req_payload', $webhook->req_payload, ['class' => 'form-control', 'rows' => 10]) }}
    </div>
  </div>
  <div class="modal-footer">
    {{ Form::submit('Save', array('class'=>'btn btn-success')) }}
  </div>
{{ Form::close() }}