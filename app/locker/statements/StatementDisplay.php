<?php namespace app\locker\statements;

class StatementDisplay {

  /*
  |---------------------------------------------------------------------------
  | Set readable display for a statement
  |
  | @param statement array
  | @param lrs array
  | @param display_type string
  | @return display  string 
  |---------------------------------------------------------------------------
  */
  function displayStatement( $statement, $lrs, $display_type = 'simpleTable' ){

    switch( $display_type ){
      case 'simpleTable':
        return $this->simpleTable( $statement, $lrs );
      case 'comments':
        return $this->comments( $statement, $lrs );
      case 'commentsActor':
        return $this->commentsActor( $statement, $lrs );
    }

  }

  private function simpleTable( $statement, $lrs ){

    $display = '<table class="table table-striped table-bordered">';

    if( isset($statement['actor']) )
      $display .= $this->setActor( $statement['actor'], $lrs );
    if( isset($statement['object']) )
      $display .= $this->setActivity( $statement['object'] );
    if( isset($statement['verb']) )
      $display .= $this->setVerb( $statement['verb'], $lrs );
    if( isset($statement['context']) )
      $display .= $this->setCourse( $statement['context'], $lrs );
    if( isset($statement['result']) )
      $display .= $this->setScore( $statement['result'] );
    if( isset($statement['result']) )
      $display .= $this->setDuration( $statement['result'] );
    if( isset($statement['result']) && isset($statement['object']) )
      $display .= $this->setComment( $statement['result'], $statement['object'] );
    if( isset($statement['context']) )
      $display .= $this->setParent( $statement['context'], $lrs );

    $display .= '</table>';

    return $display;

  }

  private function comments( $statement, $lrs ){

    $display = '<div class="">';

    $display .= $this->setComment( $statement['result'], $statement['object'], 'div' );

    $display .= '</div>';

    return $display;

  }

  private function commentsActor( $statement, $lrs ){

    $display = '<table class="table table-striped table-bordered">';

    $display .= $this->setActor( $statement['actor'], $lrs );
    $display .= $this->setComment( $statement['result'], $statement['object'] );
    $display .= $this->setParent( $statement['context'], $lrs );
    $display .= $this->setCourse( $statement['context'], $lrs );

    $display .= '</table>';

    return $display;

  }

  /**
   * Set the actor for readable display.
   * 
   * @todo use all elements of the actor key, not just mbox
   *
   **/
  private function setActor( $actor, $lrs, $return_type='table' ){

    $avatar = $this->setAvatar( $actor['mbox'] );

    $display = array('title'   => 'Actor',
                     'display' => $actor['name'],
                     'url'     => \URL::current() . '/actor/' . $actor['mbox'],
                     'extra'   => $avatar);

    return $this->setDisplayRow( $display, $return_type );

  }

  private function setVerb( $verb, $lrs, $return_type='table' ){

    if( isset($verb['display']) ){
      $set_verb = reset( $verb['display'] );
    }else{
      $set_verb = $verb['id'];
    }

    $display  = array('title'   => 'Verb',
                      'url'     => \URL::current() . '/verb/' . $set_verb, 
                      'display' => $set_verb);

    return $this->setDisplayRow( $display, $return_type );
    
  }

  private function setActivity( $activity, $return_type='table' ){

    $name = isset($activity['definition']['name']) ? reset( $activity['definition']['name'] ) : $activity['id'];
    $display = array('title'   => 'Activity',
                     'display' => $name,
                     'url'     => \URL::current() . '/activity/' . rawurlencode( $activity['id'] ));

    return $this->setDisplayRow( $display, $return_type );
  
  }

  private function setDuration( $result, $return_type='table' ){

    if( isset($result['duration']) ){

      $display = array('title'   => 'Duration',
                       'display' => $result['duration'] . ' seconds');

      return $this->setDisplayRow( $display, $return_type );
      
    }

  }

  private function setScore( $result, $return_type='table' ){

    if( isset($result['score']['scaled']) ){
      $percentage = round( $result['score']['scaled'] * 100 );

      $display = array('title'   => 'Score',
                       'display' => $percentage . '%');

      return $this->setDisplayRow( $display, $return_type );
      
    }

    if( isset($result['score']['raw']) ){

      $raw = $result['score']['raw'];
      $text = $raw;
      if( isset($result['score']['max']) ){
        $max = $result['score']['max'];
        $text.= ' out of '.$max;
      }
      $display = array('title'   => 'Score',
                       'display' => $text);

      return $this->setDisplayRow( $display, $return_type );
      
    }

  }

  private function setAvatar( $mbox ){

    if( isset($mbox) ){
      $avatar =  \Locker\Helpers\Helpers::getGravatar( substr($mbox, 7), '20');
      $avatar = '<img src="'.$avatar.'" alt="User gravatar" />';
    }else{
      $avatar = '';
    }

    return $avatar;

  }

  private function setCourse( $context, $lrs, $return_type='table' ){

    if( isset($context['contextActivities']['grouping']['type']) &&
      $context['contextActivities']['grouping']['type'] == 'http://adlnet.gov/expapi/activities/course' ){

      $name    = reset( $context['contextActivities']['grouping']['definition']['name'] );

      $display = array('title'   => 'Course',
                       'display' => $name,
                       'url'     => \URL::current() . '/course/' . rawurlencode( $context['contextActivities']['grouping']['id'] ) );

      return $this->setDisplayRow( $display, $return_type );
      
    }

    return false;

  }

  private function setParent( $context, $lrs, $return_type='table'  ){

    if( isset($context['contextActivities']['parent']) ){

      if( isset($context['contextActivities']['parent']['id']) ){

        if( isset($context['contextActivities']['parent']['definition']['name']) )
          $name = reset( $context['contextActivities']['parent']['definition']['name'] );
        else
          $name = '';

        $display = array('title'   => 'Parent Object',
                         'display' => $name,
                         'url'     => \URL::current() . '/parent/' . rawurlencode( $context['contextActivities']['parent']['id'] ) );

        return $this->setDisplayRow( $display, $return_type );

      }

    }

    return false;

  }

  private function setBadge( $object, $return_type='table' ){

    if( isset($object['definition']['type']) && 
      $object['definition']['type'] == 'http://activitystrea.ms/schema/1.0/badge' ){

      //can we grab badge json feed?
      $json  = @file_get_contents( $object['id'] );

      if( $json !== false ){
        $badge = json_decode( $json );

        //grab issuer
        $json  = file_get_contents( $badge->issuer );
        $issuer = json_decode( $json );

        $badge_display =  '<div class="statement-badge">';
        $badge_display .= '<div class="actual-badge pull-left"><img src="'. $badge->image .'" class="badge-image"></div>';
        $badge_display .= '<div class="badge-contents">';
        $badge_display .= '<h3>' . $badge->name . '</h3>';
        $badge_display .= '<p>' . $badge->description . '</p>';
        $badge_display .= '<p>Issued by: ' . $issuer->name . '</p>';
        $badge_display .= '</div>';
        $badge_display .= '</div>';
        
        $display = array('title'   => 'Badge',
                 'display' => $badge_display);

        return $this->setDisplayRow( $display, $return_type );
          
      }

    }

  }

  private function setActivityType( $object, $return_type='table' ){

    if( isset($object['definition']['type']) && 
      $object['definition']['type'] == 'http://activitystrea.ms/schema/1.0/article' ){

      $display = array('title'   => 'Activity type',
                       'display' => $object['definition']['type'],
                       'url'     => $object['definition']['type']);

      return $this->setDisplayRow( $display, $return_type );

    }

  }

  private function setComment( $result, $object, $return_type='table' ){

    if( isset($object['definition']['type']) && 
      $object['definition']['type'] == 'http://activitystrea.ms/schema/1.0/comment' && 
        isset($result['response']) ){

      $display = array('title'   => 'Comment',
                       'display' => nl2br( $result['response']));

      return $this->setDisplayRow( $display, $return_type );

    }

  }

  private function setDisplayRow( array $options = array(), $return_type = 'table' ){

    $defaults = $this->getDefaults();

    //merge values passed with default values
    $options = array_merge($defaults, $options);

    if( $return_type == 'table' ){
      $row  = '<tr><td class="col-sm-1">';
    }else{
      $row = '<div class="row">';
      $row .= '<div class="col-sm-1">';
    }

    $row .= $options['title'].':';

    if( $return_type == 'table' ){
      $row .= '</td>';
      $row .= '<td class="col-sm-10">';
    }else{
      $row .= '</div>';
      $row .= '<div class="col-sm-10">';
    } 

    $row .= $options['extra'];
    
    if( $options['url'] != '' ){
      $row .= '<a href="'.$options['url'].'" '.$options['target'].'>';
    }

    $row .= ' ' . $options['display'];

    if( $options['url'] != '' ){
      $row .= '</a>';
    }

    if( $options['icon'] != '' ){
      $row .= ' ' . $options['icon'];
    }

    if( $return_type == 'table' ){
      $row .= '</td></tr>';
    }else{
      $row .= '</div></div>';
    }

    return $row;

  }

  private function getDefaults(){
    return array('title'   => '',
                 'display' => '',
                 'url'     => '',
                 'extra'   => '',
                 'icon'    => '',
                 'target'  => '');
  }

}