<td>{{ $client->authority['name'] }}</td>
<td><a href="#" class="copyable" title="Click to copy">{{ $client->api['basic_key'] }}</a></td>
<td><a href="#" class="copyable" title="Click to copy">{{ $client->api['basic_secret'] }}</a></td>
<td class="text-center">
  <a
    href="{{ URL() }}/lrs/{{ $lrs->_id }}/client/{{ $client->_id }}/edit"
    class="btn btn-info btn-sm"
    title="{{ Lang::get('site.edit') }}"
  >
    <i class="icon-pencil"></i>
  </a>
</td>
<td class="text-center">@include('partials.client.forms.delete')</td>
