<?php namespace app\locker\data\reporting;

class getVerbs {
  
  public function __construct(){}

  public function getVerbs( $lrs ){
    $verbs = \Statement::where('lrs._id', $lrs)
             ->select('statement.verb')
             ->distinct()
             ->remember(15)
             ->get()->toArray();

    return $verbs;

  }

} 
