<?php namespace Jenssegers\Mongodb\Query;

use MongoId;
use MongoRegex;
use MongoDate;
use DateTime;
use Closure;

use Illuminate\Database\Query\Expression;
use Jenssegers\Mongodb\Connection;

class Builder extends \Illuminate\Database\Query\Builder {

    /**
     * The database collection
     *
     * @var MongoCollection
     */
    protected $collection;

    /**
     * All of the available clause operators.
     *
     * @var array
     */
    protected $operators = array(
        '=', '<', '>', '<=', '>=', '<>', '!=',
        'like', 'not like', 'between', 'ilike',
        '&', '|', '^', '<<', '>>',
        'rlike', 'regexp', 'not regexp',
        'exists', 'type', 'mod', 'where', 'all', 'size', 'regex', 'text', 'slice', 'elemmatch',
        'geowithin', 'geointersects', 'near', 'nearsphere', 'geometry',
        'maxdistance', 'center', 'centersphere', 'box', 'polygon', 'uniquedocs',
    );

    /**
     * Operator conversion.
     *
     * @var array
     */
    protected $conversion = array(
        '='  => '=',
        '!=' => '$ne',
        '<>' => '$ne',
        '<'  => '$lt',
        '<=' => '$lte',
        '>'  => '$gt',
        '>=' => '$gte',
    );

    /**
     * Create a new query builder instance.
     *
     * @param Connection $connection
     * @return void
     */
    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    /**
     * Execute a query for a single record by ID.
     *
     * @param  mixed  $id
     * @param  array  $columns
     * @return mixed
     */
    public function find($id, $columns = array())
    {
        return $this->where('_id', '=', $this->convertKey($id))->first($columns);
    }

    /**
     * Execute the query as a fresh "select" statement.
     *
     * @param  array  $columns
     * @return array|static[]
     */
    public function getFresh($columns = array())
    {
        // If no columns have been specified for the select statement, we will set them
        // here to either the passed columns, or the standard default of retrieving
        // all of the columns on the table using the "wildcard" column character.
        if (is_null($this->columns)) $this->columns = $columns;

        // Drop all columns if * is present, MongoDB does not work this way.
        if (in_array('*', $this->columns)) $this->columns = array();

        // Compile wheres
        $wheres = $this->compileWheres();

        // Use MongoDB's aggregation framework when using grouping or aggregation functions.
        if ($this->groups or $this->aggregate)
        {
            $group = array();

            // Add grouping columns to the $group part of the aggregation pipeline.
            if ($this->groups)
            {
                foreach ($this->groups as $column)
                {
                    $group['_id'][$column] = '$' . $column;

                    // When grouping, also add the $last operator to each grouped field,
                    // this mimics MySQL's behaviour a bit.
                    $group[$column] = array('$last' => '$' . $column);
                }
            }
            else
            {
                // If we don't use grouping, set the _id to null to prepare the pipeline for
                // other aggregation functions.
                $group['_id'] = null;
            }

            // Add aggregation functions to the $group part of the aggregation pipeline,
            // these may override previous aggregations.
            if ($this->aggregate)
            {
                $function = $this->aggregate['function'];

                foreach ($this->aggregate['columns'] as $column)
                {
                    // Translate count into sum.
                    if ($function == 'count')
                    {
                        $group['aggregate'] = array('$sum' => 1);
                    }
                    // Pass other functions directly.
                    else
                    {
                        $group['aggregate'] = array('$' . $function => '$' . $column);
                    }
                }
            }

            // If no aggregation functions are used, we add the additional select columns
            // to the pipeline here, aggregating them by $last.
            else
            {
                foreach ($this->columns as $column)
                {
                    $key = str_replace('.', '_', $column);
                    $group[$key] = array('$last' => '$' . $column);
                }
            }

            // Build the aggregation pipeline.
            $pipeline = array();
            if ($wheres) $pipeline[] = array('$match' => $wheres);
            $pipeline[] = array('$group' => $group);

            // Apply order and limit
            if ($this->orders) $pipeline[] = array('$sort' => $this->orders);
            if ($this->offset) $pipeline[] = array('$skip' => $this->offset);
            if ($this->limit)  $pipeline[] = array('$limit' => $this->limit);

            // Execute aggregation
            $results = $this->collection->aggregate($pipeline);

            // Return results
            return $results['result'];
        }

        // Distinct query
        else if ($this->distinct)
        {
            // Return distinct results directly
            $column = isset($this->columns[0]) ? $this->columns[0] : '_id';

            // Execute distinct
            $result = $this->collection->distinct($column, $wheres);

            return $result;
        }

        // Normal query
        else
        {
            $columns = array();
            foreach ($this->columns as $column)
            {
                $columns[$column] = true;
            }

            // Execute query and get MongoCursor
            $cursor = $this->collection->find($wheres, $columns);

            // Apply order, offset and limit
            if ($this->orders) $cursor->sort($this->orders);
            if ($this->offset) $cursor->skip($this->offset);
            if ($this->limit)  $cursor->limit($this->limit);

            // Return results as an array with numeric keys
            return iterator_to_array($cursor, false);
        }
    }

    /**
     * Generate the unique cache key for the current query.
     *
     * @return string
     */
    public function generateCacheKey()
    {
        $key = array(
            'connection' => $this->connection->getName(),
            'collection' => $this->collection->getName(),
            'wheres'     => $this->wheres,
            'columns'    => $this->columns,
            'groups'     => $this->groups,
            'orders'     => $this->orders,
            'offset'     => $this->offset,
            'aggregate'  => $this->aggregate,
        );

        return md5(serialize(array_values($key)));
    }

    /**
     * Execute an aggregate function on the database.
     *
     * @param  string  $function
     * @param  array   $columns
     * @return mixed
     */
    public function aggregate($function, $columns = array())
    {
        $this->aggregate = compact('function', 'columns');

        $results = $this->get($columns);

        // Once we have executed the query, we will reset the aggregate property so
        // that more select queries can be executed against the database without
        // the aggregate value getting in the way when the grammar builds it.
        $this->columns = null; $this->aggregate = null;

        if (isset($results[0]))
        {
            $result = (array) $results[0];

            return $result['aggregate'];
        }
    }

    /**
     * Force the query to only return distinct results.
     *
     * @return Builder
     */
    public function distinct($column = false)
    {
        $this->distinct = true;

        if ($column)
        {
            $this->columns = array($column);
        }

        return $this;
    }

    /**
     * Add an "order by" clause to the query.
     *
     * @param  string  $column
     * @param  string  $direction
     * @return Builder
     */
    public function orderBy($column, $direction = 'asc')
    {
        $direction = (strtolower($direction) == 'asc' ? 1 : -1);

        if ($column == 'natural')
        {
            $this->orders['$natural'] = $direction;
        }
        else
        {
            $this->orders[$column] = $direction;
        }

        return $this;
    }

    /**
     * Add a where between statement to the query.
     *
     * @param  string  $column
     * @param  array   $values
     * @param  string  $boolean
     * @param  bool  $not
     * @return Builder
     */
    public function whereBetween($column, array $values, $boolean = 'and', $not = false)
    {
        $type = 'between';

        $this->wheres[] = compact('column', 'type', 'boolean', 'values', 'not');

        return $this;
    }

    /**
     * Insert a new record into the database.
     *
     * @param  array  $values
     * @return bool
     */
    public function insert(array $values)
    {
        // Since every insert gets treated like a batch insert, we will have to detect
        // if the user is inserting a single document or an array of documents.
        $batch = true;
        foreach ($values as $value)
        {
            // As soon as we find a value that is not an array we assume the user is
            // inserting a single document.
            if (!is_array($value))
            {
                $batch = false; break;
            }
        }

        if (!$batch) $values = array($values);

        // Batch insert
        $result = $this->collection->batchInsert($values);

        return (1 == (int) $result['ok']);
    }

    /**
     * Insert a new record and get the value of the primary key.
     *
     * @param  array   $values
     * @param  string  $sequence
     * @return int
     */
    public function insertGetId(array $values, $sequence = null)
    {
        $result = $this->collection->insert($values);

        if (1 == (int) $result['ok'])
        {
            if (!$sequence)
            {
                $sequence = '_id';
            }

            // Return id
            return $values[$sequence];
        }
    }

    /**
     * Update a record in the database.
     *
     * @param  array  $values
     * @param  array  $options
     * @return int
     */
    public function update(array $values, array $options = array())
    {
        return $this->performUpdate(array('$set' => $values), $options);
    }

    /**
     * Increment a column's value by a given amount.
     *
     * @param  string  $column
     * @param  int     $amount
     * @param  array   $extra
     * @return int
     */
    public function increment($column, $amount = 1, array $extra = array(), array $options = array())
    {
        $query = array(
            '$inc' => array($column => $amount)
        );

        if (!empty($extra))
        {
            $query['$set'] = $extra;
        }

        // Protect
        $this->where(function($query) use ($column)
        {
            $query->where($column, 'exists', false);
            $query->orWhereNotNull($column);
        });

        return $this->performUpdate($query, $options);
    }

    /**
     * Decrement a column's value by a given amount.
     *
     * @param  string  $column
     * @param  int     $amount
     * @param  array   $extra
     * @return int
     */
    public function decrement($column, $amount = 1, array $extra = array(), array $options = array())
    {
        return $this->increment($column, -1 * $amount, $extra, $options);
    }

    /**
     * Pluck a single column from the database.
     *
     * @param  string  $column
     * @return mixed
     */
    public function pluck($column)
    {
        $result = (array) $this->first(array($column));

        // MongoDB returns the _id field even if you did not ask for it, so we need to
        // remove this from the result.
        if (array_key_exists('_id', $result))
        {
            unset($result['_id']);
        }

        return count($result) > 0 ? reset($result) : null;
    }

    /**
     * Delete a record from the database.
     *
     * @param  mixed  $id
     * @return int
     */
    public function delete($id = null)
    {
        $wheres = $this->compileWheres();
        $result = $this->collection->remove($wheres);

        if (1 == (int) $result['ok'])
        {
            return $result['n'];
        }

        return 0;
    }

    /**
     * Set the collection which the query is targeting.
     *
     * @param  string  $collection
     * @return Builder
     */
    public function from($collection)
    {
        if ($collection)
        {
            $this->collection = $this->connection->getCollection($collection);
        }

        return parent::from($collection);
    }

    /**
     * Run a truncate statement on the table.
     *
     * @return void
     */
    public function truncate()
    {
        $result = $this->collection->remove();

        return (1 == (int) $result['ok']);
    }

    /**
     * Create a raw database expression.
     *
     * @param  closure  $expression
     * @return mixed
     */
    public function raw($expression = null)
    {
        // Execute the closure on the mongodb collection
        if ($expression instanceof Closure)
        {
            return call_user_func($expression, $this->collection);
        }

        // Create an expression for the given value
        else if (!is_null($expression))
        {
            return new Expression($expression);
        }

        // Quick access to the mongodb collection
        return $this->collection;
    }

    /**
     * Append one or more values to an array.
     *
     * @param  mixed   $column
     * @param  mixed   $value
     * @return int
     */
    public function push($column, $value = null, $unique = false)
    {
        // Use the addToSet operator in case we only want unique items.
        $operator = $unique ? '$addToSet' : '$push';

        if (is_array($column))
        {
            $query = array($operator => $column);
        }
        else
        {
            $query = array($operator => array($column => $value));
        }

        return $this->performUpdate($query);
    }

    /**
     * Remove one or more values from an array.
     *
     * @param  mixed   $column
     * @param  mixed   $value
     * @return int
     */
    public function pull($column, $value = null)
    {
        if (is_array($column))
        {
            $query = array('$pull' => $column);
        }
        else
        {
            $query = array('$pull' => array($column => $value));
        }

        return $this->performUpdate($query);
    }

    /**
     * Remove one or more fields.
     *
     * @param  mixed $columns
     * @return int
     */
    public function drop($columns)
    {
        if (!is_array($columns)) $columns = array($columns);

        $fields = array();

        foreach ($columns as $column)
        {
            $fields[$column] = 1;
        }

        $query = array('$unset' => $fields);

        return $this->performUpdate($query);
    }

    /**
     * Get a new instance of the query builder.
     *
     * @return Builder
     */
    public function newQuery()
    {
        return new Builder($this->connection);
    }

    /**
     * Perform an update query.
     *
     * @param  array  $query
     * @param  array  $options
     * @return int
     */
    protected function performUpdate($query, array $options = array())
    {
        // Default options
        $default = array('multiple' => true);

        // Merge options and override default options
        $options = array_merge($default, $options);

        $wheres = $this->compileWheres();
        $result = $this->collection->update($wheres, $query, $options);

        if (1 == (int) $result['ok'])
        {
            return $result['n'];
        }

        return 0;
    }

    /**
     * Convert a key to MongoID if needed.
     *
     * @param  mixed $id
     * @return mixed
     */
    public function convertKey($id)
    {
        if (is_string($id) and strlen($id) === 24 and ctype_xdigit($id))
        {
            return new MongoId($id);
        }

        return $id;
    }

    /**
     * Add a basic where clause to the query.
     *
     * @param  string  $column
     * @param  string  $operator
     * @param  mixed   $value
     * @param  string  $boolean
     * @return \Illuminate\Database\Query\Builder|static
     *
     * @throws \InvalidArgumentException
     */
    public function where($column, $operator = null, $value = null, $boolean = 'and')
    {
        // Remove the leading $ from operators.
        if (func_num_args() == 3)
        {
            if (starts_with($operator, '$'))
            {
                $operator = substr($operator, 1);
            }
        }

        return parent::where($column, $operator, $value, $boolean);
    }

    /**
     * Compile the where array.
     *
     * @return array
     */
    protected function compileWheres()
    {
        // The wheres to compile.
        $wheres = $this->wheres ?: array();

        // We will add all compiled wheres to this array.
        $compiled = array();

        foreach ($wheres as $i => &$where)
        {
            // Make sure the operator is in lowercase.
            if (isset($where['operator']))
            {
                $where['operator'] = strtolower($where['operator']);

                // Operator conversions
                $convert = array(
                    'regexp' => 'regex',
                    'elemmatch' => 'elemMatch',
                    'geointersects' => 'geoIntersects',
                    'geowithin' => 'geoWithin',
                    'nearsphere' => 'nearSphere',
                    'maxdistance' => 'maxDistance',
                    'centersphere' => 'centerSphere',
                    'uniquedocs' => 'uniqueDocs',
                );

                if (array_key_exists($where['operator'], $convert))
                {
                    $where['operator'] = $convert[$where['operator']];
                }
            }

            // Convert id's.
            if (isset($where['column']) and $where['column'] == '_id')
            {
                // Multiple values.
                if (isset($where['values']))
                {
                    foreach ($where['values'] as &$value)
                    {
                        $value = $this->convertKey($value);
                    }
                }

                // Single value.
                else if (isset($where['value']))
                {
                    $where['value'] = $this->convertKey($where['value']);
                }
            }

            // Convert DateTime values to MongoDate.
            if (isset($where['value']) and $where['value'] instanceof DateTime)
            {
                $where['value'] = new MongoDate($where['value']->getTimestamp());
            }

            // The next item in a "chain" of wheres devices the boolean of the
            // first item. So if we see that there are multiple wheres, we will
            // use the operator of the next where.
            if ($i == 0 and count($wheres) > 1 and $where['boolean'] == 'and')
            {
                $where['boolean'] = $wheres[$i+1]['boolean'];
            }

            // We use different methods to compile different wheres.
            $method = "compileWhere{$where['type']}";
            $result = $this->{$method}($where);

            // Wrap the where with an $or operator.
            if ($where['boolean'] == 'or')
            {
                $result = array('$or' => array($result));
            }

            // If there are multiple wheres, we will wrap it with $and. This is needed
            // to make nested wheres work.
            else if (count($wheres) > 1)
            {
                $result = array('$and' => array($result));
            }

            // Merge the compiled where with the others.
            $compiled = array_merge_recursive($compiled, $result);
        }

        return $compiled;
    }

    protected function compileWhereBasic($where)
    {
        extract($where);

        // Replace like with a MongoRegex instance.
        if ($operator == 'like')
        {
            $operator = '=';
            $regex = str_replace('%', '', $value);

            // Prepare regex
            if (substr($value, 0, 1) != '%') $regex = '^' . $regex;
            if (substr($value, -1) != '%')   $regex = $regex . '$';

            $value = new MongoRegex("/$regex/i");
        }

        if ( ! isset($operator) or $operator == '=')
        {
            $query = array($column => $value);
        }
        else if (array_key_exists($operator, $this->conversion))
        {
            $query = array($column => array($this->conversion[$operator] => $value));
        }
        else
        {
            $query = array($column => array('$' . $operator => $value));
        }

        return $query;
    }

    protected function compileWhereNested($where)
    {
        extract($where);

        return $query->compileWheres();
    }

    protected function compileWhereIn($where)
    {
        extract($where);

        return array($column => array('$in' => $values));
    }

    protected function compileWhereNotIn($where)
    {
        extract($where);

        return array($column => array('$nin' => $values));
    }

    protected function compileWhereNull($where)
    {
        $where['operator'] = '=';
        $where['value'] = null;

        return $this->compileWhereBasic($where);
    }

    protected function compileWhereNotNull($where)
    {
        $where['operator'] = '!=';
        $where['value'] = null;

        return $this->compileWhereBasic($where);
    }

    protected function compileWhereBetween($where)
    {
        extract($where);

        if ($not)
        {
            return array(
                '$or' => array(
                    array(
                        $column => array(
                            '$lte' => $values[0]
                        )
                    ),
                    array(
                        $column => array(
                            '$gte' => $values[1]
                        )
                    )
                )
            );
        }
        else
        {
            return array(
                $column => array(
                    '$gte' => $values[0],
                    '$lte' => $values[1]
                )
            );
        }
    }

    protected function compileWhereRaw($where)
    {
        return $where['sql'];
    }

    /**
     * Handle dynamic method calls into the method.
     *
     * @param  string  $method
     * @param  array   $parameters
     * @return mixed
     */
    public function __call($method, $parameters)
    {
        if ($method == 'unset')
        {
            return call_user_func_array(array($this, 'drop'), $parameters);
        }

        return parent::__call($method, $parameters);
    }

}
