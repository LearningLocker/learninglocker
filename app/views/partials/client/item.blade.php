<tr>
  <td>{{ $client->authority['name'] }}</td>
  <td>{{ chunk_split($client->api['basic_key'], 20, '</br>') }}</td>
  <td>{{ chunk_split($client->api['basic_secret'], 20, '</br>') }}</td>
  <td>
    <a
      href="{{ URL() }}/lrs/{{ $lrs->_id }}/client/{{ $client->_id }}/edit"
      class="btn btn-success btn-sm"
      title="{{ Lang::get('site.edit') }}"
    >
      <i class="icon-pencil"></i>
    </a>
  </td>
  <td>@include('partials.client.forms.delete')</td>
</tr>
<a name="{{ $client->_id }}"></a>
