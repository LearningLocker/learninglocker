<?php
/**
 * Used to handle an LRSs 3 document APIs.
 *
 **/

use Jenssegers\Mongodb\Model as Eloquent;

class DocumentAPI extends Eloquent {

  /**
   * Our MongoDB collection used by the model.
   *
   * @var string
   */
  protected $collection = 'documentapi';

  /**
   * Hidden values we don't return
   *
   * @var array
   *
   **/
  protected $hidden = array('_id', 'created_at', 'updated_at', 'lrs', 'apitype');


  /**
   * Handle content storage
   * @param Mixed $content          The content passed in the request
   */
  public function setContent( $content, $method){

    if( is_object( json_decode($content ) ) ){ //save json as an object
      $request_content = json_decode($content, TRUE);

      if( !$this->exists ){ //if we are adding a new piece of content...
        $this->contentType  = 'application/json';
        $this->content      = $request_content;
      } else if( $this->contentType === 'application/json' ){ //if existing content, check that it is also JSON
        switch( $method ){
          case 'PUT': //overwrite content
            $this->content = $request_content;
          break;
          case 'POST': //merge variables
            $this->content = array_merge( $this->content, $request_content );
          break;
          default:
            \App::abort( 400, 'Only PUT AND POST methods may amend content');
          break;
        }
      } else { //reject updating with non JSON content
        \App::abort(400, 'JSON document content may not be overwritten with that of another type');
      }
      

    } else if( is_string($content) ){ //save text as raw text
      if( !$this->exists ){
        $this->contentType  = 'text/plain';
        $this->content      = $content;
      } else {
        \App::abort(400, sprintf('Cannot amend existing %s document with a string', $this->contentType) );
      }
    } else {
      if( !$this->exists ){
        //@todo - save file content and reference through file path     
        //Need to actually check this is a binary file still 
        $this->contentType  = 'file/mimetype'; //use this value to return an actual file when requesting the document - may want to use mimetype here?
        $this->content      = "..path/to/file/to.do"; 
      } else {
        \App::abort(400, sprintf('Cannot amend existing %s document with a file', $this->contentType) );
      }

    } 

  }

}