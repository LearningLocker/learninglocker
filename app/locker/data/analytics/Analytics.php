<?php namespace Locker\Data\Analytics;

use Locker\Repository\Query\QueryRepository;
use Locker\Graphing\GraphingInterface as Graph;

class Analytics extends \app\locker\data\BaseData implements AnalyticsInterface {

	protected $query;

	protected $graphs;

	public $results, $data;
	private $lrs;

	/**
	 * Construct
	 *
	 * @param Locker\Repository\Data\QueryRepository $query
	 *
	 */
	public function __construct( QueryRepository $query, Graph $graphs ){

		$this->query  = $query;
		$this->graphs = $graphs;
		$this->setDb();
		

	}

	/**
	 * The main method to grab appropriate anayltics
	 *
	 * @param $lrs         id        The LRS in question
	 * @param $segment     string    The analytics segment required. e.g. badges, verbs etc
	 * @param $graph_it    boolean   Is a graph ready display required? 
	 *
	 **/
	public function getAnalytics( $lrs, $segment, $graph_it = true ){

		$this->lrs      = $lrs;
		$this->graph_it = $graph_it;
		$this->selectAnalytics( $segment );

	}

	/**
	 * Get the appropriate object that matches the required segment
	 *
	 * @param $segment   string    The analytics segment required. e.g. badges, verbs etc
	 *
	 **/
	public function selectAnalytics( $segment ){

		switch( $segment ){
			case 'verbs':
				$this->verbCloud();
				$this->verbChart();
				break;
			case 'badges':
				$this->results['badges'] = $this->getObjectType( 'http://activitystrea.ms/schema/1.0/badge' );
				break;
			case 'questions':
				$this->results['questions'] = $this->getObjectType( 'http://activitystrea.ms/schema/1.0/question' );
				break;
			case 'courses':
				$this->results['courses'] = $this->getObjectType( 'http://adlnet.gov/expapi/activities/course',
														  	      'context.contextActivities.grouping.type',
														          'context.contextActivities.grouping.definition');
				break;
			case 'articles':
				$this->results['articles'] = $this->getObjectType( 'http://activitystrea.ms/schema/1.0/article' );
				break;
			case 'participation':
				$this->results['participation'] = array();
				break;
			case 'scores':
				$this->results['scores'] = array();
				break;
			default:
				$this->verbCloud();
				$this->verbChart();
		}			

	}


	/**
	 * Query to grab the required data based on type
	 *
	 * @param $value     string   The value of the field to search for
	 * @param $field     string   The field we are searching against
	 * @param $select    string   The field we want returned
	 *
	 * @return array results
	 *
	 **/
	public function getObjectType( $value = '', $field = 'object.definition.type', $select = 'object.id' ){

		$lrs   = $this->lrs;
		$table = 'statements';

		return $this->query->selectDistinctField( $lrs, $table, $field, $value, $select );

	}

	/**
	 * Get the top 6 verbs being used in statements
	 *
	 * @todo move this query to the query class
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

    	$this->results['verbs']['total'] = \Statement::where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $this->lrs)
    									   ->remember(5)
    									   ->count();

    }

    /**
	 * A simple verb cloud
	 *
	 * @todo move this query to the query class
	 *
	 **/
	public function verbChart(){
    	
    	$statements = $this->db->statements->aggregate(
							array('$group' => array('_id'   => array('$dayOfYear' => '$created_at'),
													'count' => array('$sum' => 1),
													'date'  => array('$addToSet' => '$stored'),
													'actor' => array('$addToSet' => '$actor'))),
							array('$sort'    => array('_id' => 1)),
							array('$project' => array('count' => 1, 'date' => 1, 'actor' => 1))
						);

    	var_dump( $statements['result'] );exit;

		//set statements for graphing
		if( $this->graph_it ){
			$this->data = $this->graphs->morrisLineGraph( $statements['result'] );
		}else{
			$this->data = $statements['result'];
		}

    }

}