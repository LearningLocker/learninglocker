<?php
/**
 * Used to handle an LRSs 3 document APIs.
 *
 **/

use Jenssegers\Mongodb\Model as Eloquent;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Locker\Repository\Document\FileTypes;

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
   * Returns true if an array is associative 
   * @param  Array  $arr 
   * @return boolean      
   */
  private function isAssoc($arr)
  {
    return array_keys($arr) !== range(0, count($arr) - 1);
  }


  /**
   * Handle content storage
   * @param Mixed $content          The content passed in the request
   */
  public function setContent( $content_info, $method){
    $content      = $content_info['content'];
    $contentType  = $content_info['contentType'];

    $contentTypeArr = explode(";", $contentType);
    if( sizeof($contentTypeArr) >= 1 ){
      $mimeType = $contentTypeArr[0];
    } else {
      $mimeType = $contentType;
    }

    switch( $mimeType ){
      case "application/json":

        $request_content = json_decode($content, TRUE);

        if( !$this->exists ){ //if we are adding a new piece of content...
          $this->content      = $request_content;
        } else { //if existing content, check that it is also JSON
          switch( $method ){
            case 'PUT': //overwrite content
              if( is_null( $request_content ) ){
                \App::abort(400, 'JSON is invalid.');
              }
              $this->content = $request_content;
            break;
            case 'POST': //merge variables
              if(!(is_array($request_content) && $this->isAssoc( $request_content ))) {
                \App::abort(400, 'JSON must contain an object at the top level.');
              } else if ($this->contentType !== $mimeType) {
                \App::abort(400, 'JSON document content may not be merged with that of another type');
              }
              $this->content = array_merge( $this->content, $request_content );
            break;
            default:
              \App::abort( 400, 'Only PUT AND POST methods may amend content');
            break;
          }
        }
      break;

      case "text/plain":
        if( !$this->exists ){
          $this->content = $content;
        } else {
          if ($method === 'PUT') {
            $this->content = $content;
          } else {
            \App::abort(400, sprintf('Cannot amend existing %s document with a string', $this->contentType) );
          }
        }
      break;

      default:
        if( !$this->exists ){ // check we are adding a new document
          //HANDLE FILE SAVES???
          $dir = $this->getContentDir();

          if( $content instanceof UploadedFile ){

            $origname = $content->getClientOriginalName();
            $parts = pathinfo($origname);
            $filename = Str::slug(Str::lower($parts['filename'])).'-'.time().'.'.$parts['extension'];
            $content->move($dir, $filename);

          } else {
            $ext = array_search( $mimeType, FileTypes::getMap() );
            if( $ext === false ){
              \App::abort(400, 'This file type cannot be supported');
            }

            // @todo check for allowed filetypes?
            
            $filename = time() . "." . $ext;
            $size = file_put_contents( $dir.$filename, $content );

            if( $size === false ){
              \App::abort( 400, 'There was an issue saving the content');
            }

          } 

          $this->content = $filename;

        } else {
          \App::abort(400, sprintf('Cannot amend existing %s document with a file', $this->contentType) );
        }
      break;
    }
    
    $this->contentType  = $mimeType;

  }

  public function getContentDir(){
    $dir = base_path().'/uploads/'.$this->lrs.'/documents/';
    if( !file_exists($dir) ){
      mkdir( $dir, 0774, true );
    }

    return $dir;
  }

  public function getFilePath(){
    return $this->getContentDir() . $this->content;
  }

}