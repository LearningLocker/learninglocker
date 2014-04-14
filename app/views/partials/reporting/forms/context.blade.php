<div class="reporting-segment">
  <div class="row">
    <div class="col-xs-12 col-sm-12">

      <div class="panel panel-default">
        <div class="panel-heading">
          Parent Activities
        </div>
        <div class="panel-body">
          <span id="parents-list">
            <input type="text" class="form-control typeahead" placeholder="Search for parent activities" />
          </span>
          <div class="row">
            <div id="parents-selected">
              
            </div>
          </div>
        </div>
      </div>

      <div class="panel panel-default">
        <div class="panel-heading">
          Grouping Activities
        </div>
        <div class="panel-body">
          <span id="grouping-list">
            <input type="text" class="form-control typeahead" placeholder="Search for parent activities" />
          </span>
          <div class="row">
            <div id="grouping-selected"></div>
          </div>
        </div>
      </div>

    </div>

    <div class="col-xs-12 col-sm-6">

      <div class="panel panel-default">
        <div class="panel-heading">
          Platforms
        </div>
        <div class="panel-body">
          @if( isset( $platforms ) )
            @foreach( $platforms as $p )
              @foreach( $p as $value )
                <div class="checkbox">
                  <label>
                    <input type="checkbox" value="{{ $value }}" data-type="context.platform" 
                      data-display="{{ $value }}"> {{ $value }}
                  </label>
                </div>
              @endforeach
            @endforeach
          @else
            <p>There are no platforms to include.</p>
          @endif
        </div>
      </div>

      <div class="panel panel-default">
        <div class="panel-heading">
          Languages
        </div>
        <div class="panel-body">
          @if( isset( $languages[0] ) )
            @foreach( $languages[0] as $value )
              <div class="checkbox">
                <label>
                  <input type="checkbox" value="{{ $value }}" data-type="context.language" 
                    data-display="{{ $value }}"> {{ $value }}
                </label>
              </div>
            @endforeach
          @else
            <p>There are no languages available.</p>
          @endif
        </div>
      </div>

    </div>

    <div class="col-xs-12 col-sm-6">

      <div class="panel panel-default">
        <div class="panel-heading">
          Instructors
        </div>
        <div class="panel-body">
          @if( isset( $instructors[0] ) )
            @foreach( $instructors[0] as $value )
              <div class="checkbox">
                <label>
                  <input type="checkbox" value="{{ $value }}" data-type="context.instructor" 
                    data-display="{{ $value }}"> {{ $value }}
                </label>
              </div>
            @endforeach
          @else
            <p>There are no instructors available.</p>
          @endif
        </div>
      </div>

    </div>

  </div>
</div>