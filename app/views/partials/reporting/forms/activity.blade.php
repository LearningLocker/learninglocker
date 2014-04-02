<div class="reporting-segment">
  <div class="row">
    <div class="col-xs-12 col-sm-12">
      <div class="panel panel-default">
        <div class="panel-heading">
          Find activity
        </div>
        <div class="panel-body">

            <span id="activity-list">
              <input type="text" class="form-control typeahead" placeholder="Search for activities" />
            </span>
    
            <div id="activities-selected">
              
            </div>

        </div>
      </div>
    </div>
    <div class="col-xs-12 col-sm-12">
     
        <div class="panel panel-default">
          <div class="panel-heading">
            Activity type
          </div>
          <div class="panel-body">
            @if( $activity_type )
              @foreach( $activity_type as $value )
                @foreach( $value as $v )
                  <div class="col-xs-12 col-sm-6">
                    <div class="checkbox">
                      <label class="form-tooltip" data-toggle="tooltip" data-placement="top" title="{{ $v }}">
                        <?php
                          $id = $v;
                          if(filter_var($v, FILTER_VALIDATE_URL)){
                            $v = substr( $v, strrpos( $v, '/' )+1 );
                          }
                        ?>
                        <input type="checkbox" value="{{ $id }}" data-type="activity_type" 
                          data-display="{{ $v }}"> {{ $v }}
                      </label>
                    </div>
                  </div>
                @endforeach
              @endforeach
            @else
              <p>There are no activity types to show.</p>
            @endif
          </div>
        </div>
      
    </div>
  </div>
</div>