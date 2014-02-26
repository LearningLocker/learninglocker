<!-- Edit role -->
<div class="edit-role-form">
  {{ Form::model($listed_user, array('route' => array('users.role', $listed_user->_id), 
  'method' => 'PUT')) }}
  <div class="form-group">
    {{ Form::radio('role', 'super') }} Super Admin (can access, and do, everything) <br />
    {{ Form::radio('role', 'admin') }} Admin (can administer LRSs) <br />
    {{ Form::radio('role', 'observer') }} Observer
  </div>
  {{ Form::submit('Submit', array('class'=>'btn btn-primary btn-xs')) }}
  {{ Form::close() }}
</div>