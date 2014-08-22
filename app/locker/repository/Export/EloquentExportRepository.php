<?php namespace Locker\Repository\Export;

use Export;

class EloquentExportRepository implements ExportRepository {

  public function all($lrs){
    return Export::where('lrs', $lrs)->get();
  }

  public function find($id){
    return Export::find($id);
  }

  public function create( $data ){
    $export = new Export;
    $export->lrs = $data['lrs'];
    $export->fields = $data['fields'];
    $export->report = $data['report'];
    $export->name  = $data['name'];
    $export->description = $data['description'];
    
    if( $export->save() ){
      return $export->id;
    }

    return false;

  }

  public function update($id, $data){

  }

  public function delete($id){
    $export = $this->find($id);
    return $export->delete();
  }

}