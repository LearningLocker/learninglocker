<?php namespace app\locker\data\reporting;

class getActivities {
  
  public function __construct(){}

  public function getActivities( $lrs ){

    return \Statement::where(SPECIFIC_LRS, $lrs)
                  ->where('object.objectType', 'Activity')
                  ->select('object.definition.type')
                  ->distinct()
                  ->remember(15)
                  ->get()->toArray();

    return array('activities' => $activities, 'types' => $activity_types);
    
  }

} 
