<div class="row">
  <div class="col-xs-12 col-sm-12 col-lg-12">
    <div class="mini_list clearfix">

      @include('partials.statements.category')

      <a href="{{ $statement['object']['id'] }}">{{{ $statement['object']['definition']['name']['en-US'] }}}</a>

      @if ( !empty($statement['result']['duration']) )
      <span class="label label-default pull-right tooltips" data-toggle="tooltip" title="The time spent on this item.">
        {{ round( $statement['result']['duration'] / 60) }} mins
      </span>
      @endif

    </div>
  </div>
</div>