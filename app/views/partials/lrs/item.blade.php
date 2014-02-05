<div class="lrs-list-item clearfix">
	@if ( app\locker\helpers\Lrs::lrsEdit($lrs) )
		<span class="lrs-list-item-edit pull-right">
			@include('partials.lrs.forms.delete')
			<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/edit" class="btn btn-sm btn-default btn-space">{{ Lang::get('site.edit') }}</a>
		</span>
	@endif
	<i class="icon icon-bar-chart pull-left item-img"></i>
	<div class="lrs-list-details">
		<b><a href="{{ URL() }}/lrs/{{ $lrs->_id }}">{{ $lrs->title }}</a></b>
		<div>{{ $lrs->description }}</div>
	</div>
</div>