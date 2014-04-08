<?php namespace app\locker\data\reporting;

class getActivities {
  
  public function __construct(){}

  public function getActivities( $lrs ){

    return \Statement::where('lrs._id', $lrs)
                  ->where('statement.object.objectType', 'Activity')
                  ->select('statement.object.definition.type')
                  ->distinct()
                  ->remember(15)
                  ->get()->toArray();

    return array('activities' => $activities, 'types' => $activity_types);
    
  }

} 
