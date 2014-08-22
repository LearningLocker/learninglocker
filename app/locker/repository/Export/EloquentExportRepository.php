<?php namespace Locker\Repository\Export;

use Export;

class EloquentExportRepository implements ExportRepository {

  private $keys = ['lrs', 'fields', 'report', 'name', 'description'];

  public function all($lrs){
    return Export::where('lrs', $lrs)->get();
  }

  public function find($id){
    return Export::find($id);
  }

  public function setProperties($export, $data, $overwrite = false) {
    foreach ($this->keys as $key) {
      if (isset($data[$key]) && !is_null($data[$key])) {
        $export[$key] = $data[$key];
      } else if (!$overwrite)  {
        \App::abort(404, $key . " is not defined.");
      }
    }

    return $export;
  }

  public function create( $data ){
    $export = new Export;
    $this->setProperties($export, $data);
    return $export->save() ? $export->_id : false;
  }

  public function update($id, $data){
    $export = $this->find($id);
    
    // Create a new export.
    if (!$export['exists']) {
      $export = new Export;
      $export->_id = $id;
    }

    $export = $this->setProperties($export, $data, true);
    return $export->save() ? $export->_id : false;
  }

  public function delete($export){
    if ($export['exists']) {
      $export->delete();
      return true;
    } else {
      return false; 
    }
  }

}