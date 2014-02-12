<!-- Modal -->
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h4 class="modal-title" id="myModalLabel">Change role</h4>
    </div>
    <div class="modal-body clearfix">
    {{ Form::model($listed_user, array('route' => array('users.role', $listed_user->_id), 
      'method' => 'PUT')) }}
      <div class="form-group">
        {{ Form::radio('role', 'super') }} Super Admin (can access, and do, everything) <br />
        {{ Form::radio('role', 'admin') }} Admin (can administer LRSs) <br />
        {{ Form::radio('role', 'observer') }} Observer
      </div>
      {{ Form::submit('Submit', array('class'=>'btn btn-primary')) }}
    {{ Form::close() }}
    </div>
    <div class="modal-footer">
    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
    </div>
  </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->