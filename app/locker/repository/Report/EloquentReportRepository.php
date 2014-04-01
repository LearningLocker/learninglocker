<?php namespace Locker\Repository\Report;

use Report;

class EloquentReportRepository implements ReportRepository {

  public function all($lrs){
    return Report::where('lrs', $lrs)->get();
  }

  public function find($id){
    return Report::find($id);
  }

  public function create( $data ){

    //check site has not already been set

    $report = new Report;
    $report->lrs = $data['lrs'];
    $report->query = $data['query'];
    $report->name  = $data['name'];
    $report->description = $data['description'];
    
    if( $report->save() ){
      return true;
    }

    return false;

  }

  public function update($id, $data){

  }

  public function delete($id){
    $report = $this->find($id);
    return $report->delete();
  }

}