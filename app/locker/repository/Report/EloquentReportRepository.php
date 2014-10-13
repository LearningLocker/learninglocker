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

    $report = new Report;
    $report->lrs = $data['lrs'];
    $report->query = $data['query'];

    // Adds defaults.
    $report->name  = $data['name'] ?: 'New report';
    $report->description = $data['description'] ?: 'New description';
    
    if( $report->save() ){
      return $report;
    }

    return false;

  }

  public function update($id, $data){

  }

  public function delete($id){
    $report = $this->find($id);
    return $report->delete();
  }

  public function getActors($lrs, $query){
    return \Statement::select('statement.actor')
               ->where('lrs._id', $lrs)
               ->where('statement.actor.name', 'like', '%'.$query.'%')
               ->distinct()
               ->take(6)
               ->get();
  }

  public function setQuery($lrs, $query, $field, $wheres){
    return \Statement::select($field)
               ->where('lrs._id', $lrs)
               ->where($wheres, 'like', '%'.$query.'%')
               ->take(6)
               ->get();
  }

}