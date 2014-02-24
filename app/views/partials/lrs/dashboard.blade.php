@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')
  
  <div class="row">
    <div class="col-xs-12 col-sm-12 col-lg-12">
      <div class="statement-graph clearfix">
        <h3>{{ Lang::get('statements.statements') }} <span>{{ $stats['statement_count'] }}</span></h3>
        <p class="averages">
          Your daily average is 
          <span style="color:#00cc00;"> {{ $stats['statement_avg'] }} {{ lcfirst(Lang::get('statements.statements')) }}</span> with 
          <span style="color:#b85e80">{{ $stats['learner_avg'] }} learners</span> participating.
        </p>
        <div class="panel panel-default">
          <div class="panel-body">
            @include('partials.graphs.view.dashboard')
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="row">

    <div class="col-xs-12 col-sm-4 col-lg-4">
       <div class="panel panel-default">
          <div class="panel-heading">
            Popular verbs
          </div>
          <div class="panel-body">
            @include('partials.analytics.data.popular_verbs', array('verbs' => $data['verbs']['result'], 'total' => $data['verbs']['total'], 'lrs' => $lrs))
          </div>
        </div>
    </div>

    <div class="col-xs-12 col-sm-4 col-lg-4">
      <div class="panel panel-default">
        <div class="panel-heading">
          Popular activities
        </div>
        <div class="panel-body">
          <div class="list-group">
          @foreach( $data['activities']['result'] as $a )
            <a href="{{ URL() }}/lrs/{{$lrs->_id}}/statements/activity/{{ rawurlencode($a['_id']) }}" class="list-group-item">
              <span class="badge" title="Number of statements">{{ $a['count'] }}</span>
              {{ reset($a['name'][0]) }}<br />
            </a>
          @endforeach
          </div>
        </div>
      </div>
    </div>

    <div class="col-xs-12 col-sm-4 col-lg-4">
      <div class="panel panel-default">
        <div class="panel-heading">
          Popular courses
        </div>
        <div class="panel-body">
          <div class="list-group">
          @foreach( $data['courses']['result'] as $c )
            @if( !is_null( $c['_id'] ) )
              @if( is_array($c['_id']) )
                @foreach( $c['_id'] as $key=>$id )


                <a href="{{ URL() }}/lrs/{{$lrs->_id}}/statements/course/{{ rawurlencode($id) }}" class="list-group-item">
                  <span class="badge" title="Number of statements">{{ $c['count'] }}</span>
                  {{ reset($c['name'][0][$key]) }}<br />
                </a>

                @endforeach
              @else 
                <a href="{{ URL() }}/lrs/{{$lrs->_id}}/statements/course/{{ rawurlencode($c['_id']) }}" class="list-group-item">
                  <span class="badge" title="Number of statements">{{ $c['count'] }}</span>
                  {{ reset($c['name'][0]) }}<br />
                </a>
              @endif
            @endif
          @endforeach
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="row">
    <div class="col-xs-12 col-sm-12 col-lg-12">
      <div class="panel panel-default">
        <div class="panel-heading">
          Top badges earned 
        </div>
        <div class="panel-body">
          <?php //var_dump( $badges );exit; ?>
          <div id='badges'></div>
          <div class="assertions">
            @foreach( $data['badges']['result'] as $b )
            <div data-url="{{ $b['_id'] }}" data-count="{{ $b['count'] }}" class='badge-assertion'>An assertion</div>
            @endforeach
          </div>
        </div>
      </div>
    </div>
  </div>

@stop

@section('footer')
  @parent
  @include('partials.graphs.js.morris')
  @include('partials.graphs.data.dashboard')
  @include('partials.graphs.js.easypiechart')
  {{ HTML::script('js/grabber.js') }}
  {{ HTML::script('js/main_grabber.js') }}
@stop