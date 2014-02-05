<?php namespace app\locker\data;

class Analytics extends BaseData {

	public $results;
	private $lrs;

	public function __construct( $lrs, $segment='verbCloud', $input='' ){

		$this->setDb();
		$this->lrs = $lrs;
		$this->selectAnalytics( $segment );

	}

	private function selectAnalytics( $segment ){

		switch( $segment ){
			case 'verbCloud':
				$this->verbCloud();
			case 'geo':
				$this->geo();
			default:
				$this->verbCloud();
		}

	}

	/**
	 * A simple verb cloud
	 *
	 **/
	public function verbCloud(){
    	
    	$match = $this->getMatch( $this->lrs ); 
    	$this->results['verbs']  = $this->db->statements->aggregate(
									array('$match' => $match),
									array('$group' => array('_id'   => '$verb.id', 
											  			    'count' => array('$sum' => 1),
											  			    'verb'  => array('$addToSet' => '$verb.display.en-US'),)),
									array('$sort'    => array('count' => -1)),
									array('$limit'   => 6)
								);

    	$this->results['verbs']['total'] = \Statement::where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $this->lrs)->remember(5)->count();

    }

    public function geo(){

    }

}