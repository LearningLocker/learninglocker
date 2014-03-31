<?php namespace app\locker\data\reporting;

class getVerbs {
  
  public function __construct(){}

  public function getVerbs( $lrs ){
    $verbs = \Statement::where(SPECIFIC_LRS, $lrs)
             ->select('verb')
             ->distinct()
             ->remember(15)
             ->get()->toArray();

    return $verbs;

  }

} 
