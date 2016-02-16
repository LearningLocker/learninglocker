{{ Form::open(['route' => ['webhook.create', $lrs->_id]]) }}
  <div class="modal-body">
  <div class="form-group">
    {{ Form::label('verb', 'Listen on verb:', ['class' => 'control-label']) }}
    {{ Form::text('verb', '', ['class' => 'form-control']) }}
    <span class="help-block">E.g. http://adlnet.gov/expapi/verbs/completed, http://adlnet.gov/expapi/verbs/passed</span>
  </div>
  <div class="form-group">
    {{ Form::label('req_type', 'Request type:', ['class' => 'control-label']) }}
    {{ Form::select('req_type', ['POST' => 'POST', 'PUT' => 'PUT', 'DELETE' => 'DELETE', 'GET' => 'GET'], NULL, ['class' => 'form-control']) }}
  </div>
  <div class="form-group">
    {{ Form::label('req_url', 'URL:', ['class' => 'control-label']) }}
    {{ Form::text('req_url', '', ['class' => 'form-control']) }}
  </div>
  <div class="form-group">
    {{ Form::label('req_headers', 'Request headers:', ['class' => 'control-label']) }}
    {{ Form::textarea('req_headers', 'Content-Type: application/json', ['class' => 'form-control', 'rows' => 4]) }}
  </div>
  <div class="form-group">
    {{ Form::label('tokens', 'Assign tokens (use dot notation to access to statement array):', ['class' => 'control-label']) }}
    {{ Form::textarea('tokens', '', ['class' => 'form-control', 'rows' => 6]) }}
    <span class="help-block">E.g. <pre>foo=statement.verb.id<br/>bar=statement.context.registration</pre></span>
  </div>
  <div class="form-group">
    {{ Form::label('req_payload', 'Request payload:', ['class' => 'control-label']) }}
    {{ Form::textarea('req_payload', '{foo:"@foo", bar:"@bar"}', ['class' => 'form-control', 'rows' => 10]) }}
    <span class="help-block">Tokens can be injected with prefix <strong>@</strong>, unavailable tokens will be ignored.</span>
  </div>
</div>
<div class="modal-footer">
  {{ Form::submit('Save', array('class'=>'btn btn-success')) }}
</div>
{{ Form::close() }}
