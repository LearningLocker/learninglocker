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
    @if ( app\locker\helpers\Lrs::lrsEdit($lrs) )
      <a href="{{ URL() }}/lrs/<%= _id %>/edit" class="btn btn-xs btn-success btn-space" title="{{ Lang::get('site.edit') }}"><i class="icon-pencil"></i></a>
    @endif
  </td>
  <td>
    @if ( app\locker\helpers\Lrs::lrsEdit($lrs) )
      <button class="btn btn-danger btn-xs delete" title="{{ Lang::get('site.delete') }}"><i class="icon-trash"></i></button>
    @endif
  </td>
</tr>