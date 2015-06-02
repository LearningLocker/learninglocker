@include('js-localization::head')
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    @section('head')
      <title>
        Learning Locker: an open source learning record store (LRS)
      </title>
      @yield('js-localization.head')
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="token" content="{{ Session::token() }}">
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

    @section('script_bootload')
    <script type="text/javascript">
    window.LL = window.LL || {
      siteroot: "{{ url() }}"
    };
    </script>
    @show

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
          @section('logo')
            @include('system.logo')
          @show
        </div>
        <div class="navbar-collapse collapse">
          @section('navbar')
            @include('system.navbar')
          @show
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
      <script type="text/javascript">
      (function (window, document) {
        var copyables = [].slice.call(document.querySelectorAll('.copyable'));
        var copy = function(event) {
          window.getSelection().removeAllRanges();  
          var range = document.createRange();
          document.createElement
          range.selectNode(event.currentTarget); 
          window.getSelection().addRange(range);  
          document.execCommand('copy');
          window.getSelection().removeAllRanges();
          if (!window.LL.copyalert) {
            window.alert('{{trans("Copied")}}');
            window.LL.copyalert = true;
          }
        };
        copyables.map(function (copyable) {
          copyable.addEventListener('click', copy);
        });
      })(window, document);
      </script>
    @show
    @show
  </body>
</html>
