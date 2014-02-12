@section('footer')

<!-- required scripts -->
@section('scripts')
  {{ HTML::script('js/jquery.1.10.2.js') }}
    {{ HTML::script('bootstrap/js/bootstrap.min.js') }}
  {{ HTML::script('js/custom.js') }}
  {{ HTML::script('js/respond.min.js') }}
  {{ HTML::script('js/placeholder.js') }}
@show

@show
</body>
</html>