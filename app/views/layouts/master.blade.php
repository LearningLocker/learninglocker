
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    @section('head')
      <title>
        Learning Locker: an open source learning record store (LRS)
      </title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      {{ HTML::style('assets/css/bootstrap.min.css')}}
      {{ HTML::style('assets/css/font-awesome.min.css')}}

      @if(Auth::check())
        {{ HTML::style('assets/css/morris.min.css')}}
        {{ HTML::style('assets/css/dashboard_layout.css')}}
        {{ HTML::style('assets/css/app.css')}}
      @else
        {{ HTML::style('assets/css/walledgarden.css')}}
      @endif

      <!--[if lt IE 9]>
      <script src="{{ URL() }}vendors/html5shiv.js"></script>
      <![endif]-->
    @show
    
  </head>

  <body>

    <!-- navbar -->
    <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container-fluid">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="{{ URL() }}">
            @if( isset($site->name) )
              {{ $site->name }}
            @else
              Learning Locker
            @endif
          </a>
        </div>
        <div class="navbar-collapse collapse">
          <ul class="nav navbar-nav navbar-right">
            @if ( \app\locker\helpers\Access::isRole('super') )
              <li><a href="{{ URL() }}"><i class="icon icon-dashboard"></i> Admin dashboard</a></li>
            @endif
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon icon-list"></i> LRS List <b class="caret"></b></a>
              <ul class="dropdown-menu">
                @if( isset( $list ) )
                  @foreach( $list as $lrs )
                    <li><a href="{{ URL() }}/lrs/{{ $lrs->_id }}"><i class='icon icon-bar-chart'></i> {{ $lrs->title }}</a></li>
                  @endforeach
                @else
                  <li><a href="#">No LRSs available</a></li>
                @endif
                <li class="divider"></li>
                <li class="dropdown-header">Other</li>
                <li><a href="{{ URL() }}/lrs">LRS home</a></li>
                @if( app\locker\helpers\Lrs::lrsCanCreate() )
                  <li><a href="#">Create a new LRS</a></li>
                @endif
              </ul>
            </li>
            <li><a href="{{ URL() }}/users/{{ Auth::user()->_id }}/edit"><i class="icon icon-cog"></i> Settings</a></li>
            <li><a href="{{ URL() }}/logout">Logout</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- sidebar and main content area -->
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-3 col-md-2 sidebar">
          @section('sidebar')
          @show
        </div>
        <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
            <!-- system messages -->
            @include('system.messages')
            <!-- show main content -->
            @yield('content')
        </div>
      </div>
    </div>

    @section('footer')

    <!-- required scripts -->
    @section('scripts')
      {{ HTML::script('assets/js/libs/jquery/jquery.1.10.2.js') }}
      {{ HTML::script('assets/js/libs/bootstrap/bootstrap.min.js') }}
      {{ HTML::script('assets/js/respond.min.js') }}
      {{ HTML::script('assets/js/placeholder.js') }}
    @show

    @show
  </body>
</html>
