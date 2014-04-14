<?php

/**
 * A rough hack to migrate statements for pre-v1.0 installs. This will be removed for v1.0 stable.
 *
 **/

class MigrateController extends BaseController {

  private $lrs;

  public function __construct(){
    $this->lrs = Lrs::all();
  }

  public function runMigration(){
    return View::make('migrate.index', array('lrs' => $this->lrs));
  }

  public function convertStatements($lrs){
      
    $statements     = OldStatement::where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $lrs)->get();
    $new_statements = array(); //new stdClass();
    
    $this-> loopStatements( $statements );

    $count = Statement::where('lrs._id', $lrs)->count();
    return Response::json(array('success' => true, 'count' => $count));

  }

  public function loopStatements( $statements ){
    //build new statements
    foreach( $statements as $s ){

      if( isset($s->context['extensions']['http://learninglocker&46;net/extensions/lrs'][1]) ){

        $setlrs = $s->context['extensions']['http://learninglocker&46;net/extensions/lrs'][1];

      }elseif( isset($s->context['extensions']['http://learninglocker&46;net/extensions/lrs'][0]) ) {

        $setlrs = $s->context['extensions']['http://learninglocker&46;net/extensions/lrs'][0];

      }elseif( isset($s->context['extensions']['http://learninglocker&46;net/extensions/lrs']) ) {

        $setlrs = $s->context['extensions']['http://learninglocker&46;net/extensions/lrs'];

      }else{

        $setlrs = $s->context['extensions']['http://learninglocker.net/extensions/lrs'];

      }

      //set statement
      if( isset($s->id) ){
        $set_statement['id'] = $s->id;

      }
      if( isset($s->actor) ){
        $set_statement['actor'] = $s->actor;
      }
      if( isset($s->verb) ){
        $set_statement['verb'] = $s->verb;
      }
      if( isset($s->object) ){
        $set_statement['object'] = $s->object;
      }
      if( isset($s->stored) ){
        $set_statement['stored'] = $s->stored;
      }

      if( isset($s->context) ){
        $context = $s->context;
        unset($context['extensions']['http://learninglocker&46;net/extensions/lrs']);
        unset($context['extensions']['http://learninglocker&46;net/extensions/category']);
        if( empty($context['extensions']) ){
          unset($context['extensions']);
        }
        if( !empty($context)){
          $set_statement['context'] = $context;
        }
      }
      if( isset($s->result) ){
        $set_statement['result'] = $s->result;
      }
      if( isset($s->timestamp) ){
        $set_statement['timestamp'] = $s->timestamp;
      }else{
        $set_statement['timestamp'] = $s->stored;
      }
      if( isset($s->version) ){
        $set_statement['version'] = $s->version;
      }
      if( isset($s->attachments) ){
        $set_statement['attachments'] = $s->attachments;
      }

      //insert record to our new collection
      $statement = new Statement;
      $statement->lrs = (object) $setlrs;
      $statement->statement = $set_statement;
      $statement->created_at = $s->created_at;
      $statement->updated_at = $s->updated_at;
      $statement->save();
       
    }
  }
}