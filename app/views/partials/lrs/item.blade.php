<tr>
  <td>
    <a href="{{ URL() }}/lrs/{{ $lrs->_id }}">{{ $lrs->title }}</a>
  </td>
  <td>
    {{ $lrs->description }}
  </td>
  <td>
    {{ count($lrs->users )}}
  </td>
  <td>
    {{ $lrs->created_at }}
  </td>
  <td>
    @if ( \Locker\Helpers\Lrs::lrsEdit($lrs) )
      <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/edit" class="btn btn-xs btn-success btn-space" title="{{ Lang::get('site.edit') }}"><i class="icon-pencil"></i></a>
    @endif
  </td>
  <td>
    @if ( \Locker\Helpers\Lrs::lrsEdit($lrs) )
      @include('partials.lrs.forms.delete')
    @endif
  </td>
</tr>