<td>{{ $client->authority['name'] }}</td>
<td>{{ chunk_split($client->api['basic_key'], 40, '') }}</td>
<td>{{ chunk_split($client->api['basic_secret'], 40, '') }}</td>
<td><center>
  <a
    href="{{ URL() }}/lrs/{{ $lrs->_id }}/client/{{ $client->_id }}/edit"
    class="btn btn-info btn-sm"
    title="{{ Lang::get('site.edit') }}"
  >
    <i class="icon-pencil"></i>
  </a>
</center></td>
<td><center>@include('partials.client.forms.delete')</center></td>
