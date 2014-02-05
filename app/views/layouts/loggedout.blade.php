@include('system.header')

@section('body')

<div class="row">
    <div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 col-lg-offset-4 col-md-offset-3">
      	<div class="logo">
            <a href="{{ URL() }}">
                <img src="{{ URL() }}/img/logo-sm.png" alt="Logo" />
            </a>
        </div>
      	<div class="wrapper">

      		@if($errors->any())
			<ul class="alert alert-danger">
				{{ implode('', $errors->all('<li>:message</li>'))}}
			</ul>
			@endif
	
			@yield('content')

		</div>

		<div class="links">
			Powered by <a href="http://learninglocker.net">Learning Locker</a>
		</div>
  	</div>
</div>

@show

@include('system.footer')