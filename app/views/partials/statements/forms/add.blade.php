<?php $lang = \Site::first()->lang; ?>
{{ Form::open(array('route' => 'statements.store', 'class' => 'form-horizontal')) }}
  <div class="bordered">
    <h4><i class="icon icon-check"></i> Learner (actor)</h4>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('actor_objectType', 'ObjectType', array('class' => 'col-sm-4 control-label' )) }}
          <div class="col-sm-8">
             {{ Form::select("actor[objectType]", array('Agent' => 'Agent' ), '', array('class' => 'form-control')) }}
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('actor_name', 'Name', array('class' => 'col-sm-4 control-label' )) }}
          <div class="col-sm-8">
            {{ Form::text("actor[name]", '',array('class' => 'form-control')) }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('actor_identifier', 'Funcitonal Identifier', array('class' => 'col-sm-4 control-label' )) }}
          <div class="col-sm-8">
            {{ Form::select("", array('mbox' => 'mbox (email)' ), '', array('class' => 'form-control', 'required' => true)) }}
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('actor_identifierValue', 'Email', array('class' => 'col-sm-4 control-label' )) }}
          <div class="col-sm-8">
            {{ Form::text("actor[mbox]", '',array('class' => 'form-control', 'required' => true)) }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bordered clearfix">
    <h4><i class="icon icon-check"></i> Verb</h4>

      <div class="row">
        <div class="col-xs-12 col-sm-6 col-lg-6">
          <div class="form-group">
            {{ Form::label('verb_id', 'ID', array('class' => 'col-sm-2 control-label' )) }}
            <div class="col-sm-10">
              {{ Form::text("verb[id]", '',array('class' => 'form-control', 'placeholder' => 'Verb Uri')) }}
              <span class="help-block">Here is a list of verbs 
                <a href="https://registry.tincanapi.com/#home/verbs" target="_blank">Verb registry</a>.
              </span>
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-sm-6 col-lg-6">
          <div class="form-group">
            {{ Form::label('verb_display', 'Display', array('class' => 'col-sm-2 control-label' )) }}
            <div class="col-sm-10">
              {{ Form::text("verb[display][$lang]", '',array('class' => 'form-control')) }}
              <span class="help-block">The verb display to be used.</span>
            </div>
          </div>
        </div>
      </div>
    
  </div>

  <div class="bordered clearfix">
    <h4><i class="icon icon-check"></i> Activity (object)</h4>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('object_objectType', 'ObjectType', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text("object[objectType]", 'Activity',array('class' => 'form-control')) }}
            <span class="help-block">For now it is only objectType Activity that is available.</span>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('activity_id', 'ID', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text("object[id]", '',array('class' => 'form-control', 'required' => true)) }}
            <span class="help-block">AN IRI e.g. http://example.com/activities/solo-hang-gliding</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('activity_name', 'Name', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text("object[definition][name][$lang]", '',array('class' => 'form-control')) }}
            <span class="help-block">The name of the activity. E.g. 'Solo Hang Gliding'</span>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-lg-6">
        <div class="form-group">
          {{ Form::label('activity_description', 'Description', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text("object[definition][description][$lang]", '',array('class' => 'form-control')) }}
            <span class="help-block">A description of the activity. E.g. 'The 'Solo Hang Gliding' course provided by The Hang Glider's Club'</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <hr>

  <button type="submit" class="btn btn-primary">Generate</button>
  <input type="hidden" name="_token" value="{{ csrf_token() }}" />
  <input type="hidden" name="lrs" value="{{ $lrs->_id }}" />
</form>
     