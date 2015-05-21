<?php namespace Jenssegers\Mongodb\Schema;

use Closure;
use Jenssegers\Mongodb\Connection;
use Jenssegers\Mongodb\Schema\Blueprint;

class Builder extends \Illuminate\Database\Schema\Builder {

	/**
	 * Create a new database Schema manager.
	 *
	 * @param  Connection  $connection
	 */
	public function __construct(Connection $connection)
	{
		$this->connection = $connection;
	}

	/**
	 * Determine if the given collection exists.
	 *
	 * @param  string  $collection
	 * @return bool
	 */
	public function hasCollection($collection)
	{
		$db = $this->connection->getMongoDB();

		return in_array($collection, $db->getCollectionNames());
	}

	/**
	 * Determine if the given collection exists.
	 *
	 * @param  string  $collection
	 * @return bool
	 */
	public function hasTable($collection)
	{
		return $this->hasCollection($collection);
	}

	/**
	 * Modify a collection on the schema.
	 *
	 * @param  string   $collection
	 * @param  Closure  $callback
	 * @return bool
	 */
	public function collection($collection, Closure $callback)
	{
		$blueprint = $this->createBlueprint($collection);

		if ($callback)
		{
			$callback($blueprint);
		}
	}

	/**
	 * Modify a collection on the schema.
	 *
	 * @param  string   $collection
	 * @param  Closure  $callback
	 * @return bool
	 */
	public function table($collection, Closure $callback)
	{
		return $this->collection($collection, $callback);
	}

	/**
	 * Create a new collection on the schema.
	 *
	 * @param  string   $collection
	 * @param  Closure  $callback
	 * @return bool
	 */
	public function create($collection, Closure $callback = null)
	{
		$blueprint = $this->createBlueprint($collection);

		$blueprint->create();

		if ($callback)
		{
			$callback($blueprint);
		}
	}

	/**
	 * Drop a collection from the schema.
	 *
	 * @param  string  $collection
	 * @return bool
	 */
	public function drop($collection)
	{
		$blueprint = $this->createBlueprint($collection);

		return $blueprint->drop();
	}

	/**
	 * Create a new Blueprint.
	 *
	 * @param  string   $collection
	 * @return Schema\Blueprint
	 */
	protected function createBlueprint($collection, Closure $callback = null)
	{
		return new Blueprint($this->connection, $collection);
	}

}
