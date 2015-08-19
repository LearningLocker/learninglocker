<?php
/**
 * Used to handle an LRSs 3 document APIs.
 *
 **/

use Jenssegers\Mongodb\Model as Eloquent;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Locker\Repository\Document\FileTypes;
use Locker\Helpers\Helpers as Helpers;
use Locker\Helpers\Exceptions as Exceptions;
use Locker\Repository\File\Factory as FileFactory;

class DocumentAPI extends Eloquent {
  protected $collection = 'documentapi';
  protected $hidden = ['_id', 'created_at', 'updated_at', 'lrs_id', 'apitype'];

  /**
   * Returns true if $array is associative.
   * @param Array $array
   * @return boolean
   */
  private function isJSON($array) {
    return is_array($array) && array_keys($array) !== range(0, count($array) - 1);
  }

  private function putContent($content, $contentType) {
    switch ($contentType) {
      case 'application/json':
        $encoded_content = gettype($content) === 'string' ? $content : json_encode($content);
        $this->setSha($encoded_content);
        $this->overwriteContent(json_decode($encoded_content, true));
        break;
      case 'text/plain':
        $this->setSha($content);
        $this->overwriteContent($content);
        break;
      default: $this->saveDocument($content, $contentType);
    }
  }

  private function postContent($content, $contentType) {

    if( $this->exists ){
      $decoded_content = json_decode($content, true);
      //Check existing content type and incoming content type are both application/json
      if ( $this->contentType !== 'application/json' || $contentType !== 'application/json' ) {
        throw new Exceptions\Exception('Both existing content type and incoming content type must be application/json');
      }
      //Check existing content and incoming content are both JSON
      if ( !$this->isJSON($this->content) || !$this->isJSON($decoded_content)  ) {
        throw new Exceptions\Exception('Both existing content and incoming content must be parsable as JSON in order to use POST');
      }

      //Merge JSON
      $this->mergeJSONContent($decoded_content, $contentType);
    } else {
      //If document does not already exist, treat as PUT
      $this->putContent($content, $contentType );
    }
  }

  private function setSha($content) {
    $this->sha = strtoupper(sha1($content));
  }

  private function mergeJSONContent($content, $contentType) {
    if (!$this->isJSON($content)) {
      throw new Exceptions\Exception(
        'JSON must contain an object at the top level.'
      );
    } else if ($this->contentType !== $contentType) {
      throw new Exceptions\Exception(
        'JSON document content may not be merged with that of another type'
      );
    }
    $this->content = array_merge($this->content, $content);
    $this->setSha(json_encode($this->content));
  }

  private function overwriteContent($content) {
    $this->content = $content;
  }

  private function saveDocument($content, $contentType) {
    $dir = $this->getContentDir();

    if ($content instanceof UploadedFile) {
      $origname = $content->getClientOriginalName();
      $parts = pathinfo($origname);
      $filename = Str::slug(Str::lower($parts['filename'])).'-'.time().'.'.$parts['extension'];

      // Stores the file in a temporary location before writing it to the FileRepository.
      $tmp_location = __DIR__.'/../../uploads/tmp';
      $content->move($tmp_location, $filename);
      $data = file_get_contents($tmp_location.'/'.$filename);
      FileFactory::create()->update($dir.$filename, ['content' => $data], []);
      unlink($tmp_location.'/'.$filename);
    } else {
      $ext = array_search($contentType, FileTypes::getMap());

      $filename = time().'_'.mt_rand(0,1000).($ext !== false ? '.'.$ext : '');

      $size = FileFactory::create()->update($dir.$filename, ['content' => $content], []);

      if ($size === false) throw new Exceptions\Exception('There was an issue saving the content');
    }

    $this->content = $filename;
    $this->setSha($content);
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

    if ($method === 'PUT') {
      $this->putContent($content, $mimeType);
    } else if ($method === 'POST') {
      $this->postContent($content, $mimeType);
    }

    $this->contentType = $mimeType;

  }

  public function getContentDir(){
    return $this->lrs_id.'/documents/';
  }

  public function getFilePath(){
    return $this->getContentDir() . $this->content;
  }

}
