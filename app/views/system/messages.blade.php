  @if(Session::has('success'))
  
    <div class="clearfix">
      <div class="alert alert-info">
        <a href="#" class="close" data-dismiss="alert">&times;</a>
        {{ Session::get('success') }}
      </div>
    </div>
  
  @endif
  
  @if(Session::has('error'))
  
    <div class="clearfix">
      <div class="alert alert-danger">
        <a href="#" class="close" data-dismiss="alert">&times;</a>
        {{ Session::get('error') }}
      </div>
    </div>
  
  @endif