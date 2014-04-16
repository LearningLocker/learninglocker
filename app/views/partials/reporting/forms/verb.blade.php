<div class="reporting-segment clearfix">
  <div class="panel panel-default">
    <div class="panel-heading">
      Verbs
    </div>
    <div class="panel-body">
  
      @foreach( $verbs as $v )
      <?php
        if( isset($v['display']) ){
          $display = reset( $v['display'] );
        }else{
          $display = $v['id'];
        }
        //if the display is the verb URI, truncate for display
        if(filter_var($display, FILTER_VALIDATE_URL)){
          $display = substr( $display, strrpos( $display, '/' )+1 );
        }
      ?>
      <div class="col-xs-6 col-sm-4 col-md-4 col-lg-3">
        <div class="checkbox">
          <label class='form-tooltip' data-toggle="tooltip" data-placement="top" title="{{ $v['id'] }}">
            <input type="checkbox" value='{{ $v['id'] }}' data-type="verb" data-display="{{ $display }}"> {{ $display }}
          </label>
        </div>
      </div>
      @endforeach

    </div>
  </div>    
</div>