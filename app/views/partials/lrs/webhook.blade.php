@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop


@section('content')

  @if($errors->any())
  <ul class="alert alert-danger">
    {{ implode('', $errors->all('<li>:message</li>'))}}
  </ul>
  @endif

  @include('partials.site.elements.page_title', array('page' => trans('lrs.webhook')))
  
  <div class="row">
    <div class="col-xs-12 col-sm-12 col-lg-12">
      @if ( isset($webhooks) && !empty($webhooks) )
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>{{trans('lrs.webhook.verb')}}</th>
            <th>{{trans('lrs.webhook.req_type')}}</th>
            <th>{{trans('lrs.webhook.req_url')}}</th>
            <th class="text-center">{{trans('lrs.webhook.edit')}}</th>
            <th class="text-center">{{trans('lrs.webhook.delete')}}</th>
          <tr>
        </thead>
        <tbody>
          @foreach( $webhooks as $index => $webhook )
          <tr class="{{ Session::get('success') === trans('lrs.webhook.created_success') && $index === ($webhooks->count() - 1) ? 'flash' : '' }}">
            @include('partials.lrs.webhook-item', array( 'webhook' => $webhook ))
          </tr>
          @endforeach
        </tr>
        </tbody>
      </table>
      {{$webhooks->links()}}
      @endif
      @if ( count($webhooks) == 0 )
        <div class="alert alert-warning" role="alert">{{trans('lrs.webhook.none')}}</div>
      @endif
      <!-- Button trigger modal -->
      <button type="button" class="btn btn-success" data-toggle="modal" data-target="#webhook-create">
        <i class="icon icon-plus"></i> Create webhook
      </button>

      <!-- Modal -->
      <div class="modal fade" id="webhook-create" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h4 class="modal-title" id="myModalLabel">Create a webhook</h4>
            </div>
            @include('partials.lrs.forms.webhook-create')
          </div>
        </div>
      </div>
    </div>
  </div>

@stop