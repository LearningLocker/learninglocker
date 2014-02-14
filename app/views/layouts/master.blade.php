@include('system.header')

@section('body')

  <!-- navbar -->
  <div class="navbar navbar-fixed-top">
      <div class="navbar-header">
          <button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".sidebar-nav">
            <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
      </button>
      <div class="logo">
              <a href="{{ URL() }}" ><img src="{{ URL() }}/img/logo-small.png" alt="Logo" class="pull-left" /></a>
          </div>
      </div>
  </div>
  <!-- end navbar -->

  <div id="wrap">

    <div id="sidebar">
      <div class="navbar-collapse collapse sidebar-nav">
        @section('sidebar')
                
            @show
      </div>
      </div>

      <!-- main content -->
      <div id="main">
        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
              <!-- system messages -->
            @include('system.messages')
            <!-- show main content -->
            @yield('content')
          </div>
        </div>
    </div>

  </div><!-- /close page contents wrap -->

@show

@include('system.footer')