<?php namespace app\locker\data\reporting;

class getContext {
  
  public function __construct(){}

  public function getContextPlatforms( $lrs ){
    return $this->setSelect( $lrs, "statement.context.platform" )->toArray();
  }

  public function getContextLanguages( $lrs ){
    return $this->setSelect( $lrs, "statement.context.language" )->toArray();
  }

  public function getContextInstructors( $lrs ){
    return $this->setSelect( $lrs, "statement.context.instructor" )->toArray();
  }

  private function setSelect( $lrs, $select ){

    return \Statement::where('lrs._id', $lrs)
            ->select( $select )
            ->distinct()
            ->remember(15)
            ->get();

  }

} 
