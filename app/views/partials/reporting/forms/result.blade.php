<div class="reporting-segment">
  <div class="row">
    <div class="col-xs-12 col-sm-4">
      <div class="panel panel-default">
        <div class="panel-heading">
          Scaled
        </div>
        <div class="panel-body">
        
          <div class="form-group scaled">
            <div class="pull-right">
              <input type="text" id="scaled_from" style="width:50px;" disabled="" /> 
              to <input type="text" id="scaled_to" style="width:50px;" disabled="" />
              <span class="btn btn-primary btn-xs" id="scaled_values" data-type="result" 
              style="display:none;"><i class='icon icon-plus'></i></span>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" id="scaled" value="true" data-type="result.scaled" data-display="Include Scaled"> Scaled
              </label>
            </div>
          </div>

          <div class="form-group scaled">
            <div class="pull-right">
              <input type="text" id="raw_from" style="width:50px;" disabled="" /> to 
              <input type="text" id="raw_to" style="width:50px;" disabled="" />
              <span class="btn btn-primary btn-xs" id="raw_values" data-type="result"  
              style="display:none;"><i class='icon icon-plus'></i></span>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" id="raw" value="true" data-type="result.raw" data-display="Include Raw"> Raw
              </label>
            </div>
          </div>

          <div class="form-group scaled">
            <div class="pull-right">
              <input type="text" id="min_from" style="width:50px;" disabled="" /> to 
              <input type="text" id="min_to" style="width:50px;" disabled="" />
              <span class="btn btn-primary btn-xs" id="min_values" data-type="result" 
              style="display:none;"><i class='icon icon-plus'></i></span>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" id="min" value="true" data-type="result.min" data-display="Include Min"> Min
              </label>
            </div>
          </div>

          <div class="form-group scaled">
            <div class="pull-right">
              <input type="text" id="max_from" style="width:50px;" disabled="" /> to 
              <input type="text" id="max_to" style="width:50px;" disabled="" />
              <span class="btn btn-primary btn-xs" id="max_values" data-type="result" 
              style="display:none;"><i class='icon icon-plus'></i></span>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" id="max" value="true" data-type="result.max" data-display="Include Max"> Max
              </label>
            </div>
          </div>
          
        </div>
      </div>
    </div>
    <div class="col-xs-12 col-sm-4">

      <div class="panel panel-default">
        <div class="panel-heading">
          Success / Complete
        </div>
        <div class="panel-body">

          <div class="form-group scaled">
            <div class="checkbox">
              <label>
                <input type="checkbox" name="success" value="true" data-type="result.success" data-display="result: success is true"> Success - true
              </label>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" name="success" value="false" data-type="result.success" data-display="result: success is false"> Success - false
              </label>
            </div>
          </div>

          <div class="form-group scaled">
            <div class="checkbox">
              <label>
                <input type="checkbox" name="completion" value="true" data-type="result.completion" data-display="result: completed"> Completion - true
              </label>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" name="completion" value="false" data-type="result.completion" data-display="result: not completed"> Completion - false
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-xs-12 col-sm-4">

      <div class="panel panel-default">
        <div class="panel-heading">
          Additional
        </div>
        <div class="panel-body">

          <div class="form-group scaled">
            <div class="checkbox">
              <label>
                <input type="checkbox" name="response" value="result.response: true" data-type="result.response" data-display="Include written response"> Has written response
              </label>
            </div>
          </div>

          <div class="form-group scaled">
            <div class="checkbox">
              <label>
                <input type="checkbox" name="attachment" value="result.attachments: true" data-type="result.attachments" data-display="Include attachments"> Has attachments
              </label>
            </div>
          </div>

          <div class="form-group scaled">
            <label>Signed by</label>
            <select class="form-control pull-right" id="signed" data-type="result.signed" data-display="Include attachments" name="signed_by">
              <option></option>
              <option>Your mum</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>