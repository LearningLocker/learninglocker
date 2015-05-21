<?php namespace Jenssegers\Eloquent;

use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\Relation;
use Jenssegers\Mongodb\Relations\HasOne;
use Jenssegers\Mongodb\Relations\HasMany;
use Jenssegers\Mongodb\Relations\BelongsTo;
use Jenssegers\Mongodb\Relations\BelongsToMany;
use Jenssegers\Mongodb\Relations\MorphTo;
use Jenssegers\Mongodb\Query\Builder as QueryBuilder;

abstract class Model extends \Illuminate\Database\Eloquent\Model {

    /**
    * Define a one-to-one relationship.
    *
    * @param  string  $related
    * @param  string  $foreignKey
    * @param  string  $localKey
    * @return \Illuminate\Database\Eloquent\Relations\HasOne
    */
    public function hasOne($related, $foreignKey = null, $localKey = null)
    {
        // Check if it is a relation with an original model.
        if (!is_subclass_of($related, 'Jenssegers\Mongodb\Model'))
        {
            return parent::hasOne($related, $foreignKey, $localKey);
        }

        $foreignKey = $foreignKey ?: $this->getForeignKey();

        $instance = new $related;

        $localKey = $localKey ?: $this->getKeyName();

        return new HasOne($instance->newQuery(), $this, $foreignKey, $localKey);
    }

    /**
     * Define a polymorphic one-to-one relationship.
     *
     * @param  string  $related
     * @param  string  $name
     * @param  string  $type
     * @param  string  $id
     * @param  string  $localKey
     * @return \Illuminate\Database\Eloquent\Relations\MorphOne
     */
    public function morphOne($related, $name, $type = null, $id = null, $localKey = null)
    {
        // Check if it is a relation with an original model.
        if (!is_subclass_of($related, 'Jenssegers\Mongodb\Model'))
        {
            return parent::morphOne($related, $name, $type, $id, $localKey );
        }

        $instance = new $related;

        list($type, $id) = $this->getMorphs($name, $type, $id);

        $table = $instance->getTable();

        $localKey = $localKey ?: $this->getKeyName();

        return new MorphOne($instance->newQuery(), $this, $type, $id, $localKey);
    }

    /**
    * Define a one-to-many relationship.
    *
    * @param  string  $related
    * @param  string  $foreignKey
    * @param  string  $localKey
    * @return \Illuminate\Database\Eloquent\Relations\HasMany
    */
    public function hasMany($related, $foreignKey = null, $localKey = null)
    {
        // Check if it is a relation with an original model.
        if (!is_subclass_of($related, 'Jenssegers\Mongodb\Model'))
        {
            return parent::hasMany($related, $foreignKey, $localKey);
        }

        $foreignKey = $foreignKey ?: $this->getForeignKey();

        $instance = new $related;

        $localKey = $localKey ?: $this->getKeyName();

        return new HasMany($instance->newQuery(), $this, $foreignKey, $localKey);
    }

    /**
     * Define a polymorphic one-to-many relationship.
     *
     * @param  string  $related
     * @param  string  $name
     * @param  string  $type
     * @param  string  $id
     * @param  string  $localKey
     * @return \Illuminate\Database\Eloquent\Relations\MorphMany
     */
    public function morphMany($related, $name, $type = null, $id = null, $localKey = null)
    {
        // Check if it is a relation with an original model.
        if (!is_subclass_of($related, 'Jenssegers\Mongodb\Model'))
        {
            return parent::morphMany($related, $name, $type, $id, $localKey);
        }

        $instance = new $related;

        // Here we will gather up the morph type and ID for the relationship so that we
        // can properly query the intermediate table of a relation. Finally, we will
        // get the table and create the relationship instances for the developers.
        list($type, $id) = $this->getMorphs($name, $type, $id);

        $table = $instance->getTable();

        $localKey = $localKey ?: $this->getKeyName();

        return new MorphMany($instance->newQuery(), $this, $type, $id, $localKey);
    }

    /**
    * Define an inverse one-to-one or many relationship.
    *
    * @param  string  $related
    * @param  string  $foreignKey
    * @param  string  $otherKey
    * @param  string  $relation
    * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
    */
    public function belongsTo($related, $foreignKey = null, $otherKey = null, $relation = null)
    {
        // If no relation name was given, we will use this debug backtrace to extract
        // the calling method's name and use that as the relationship name as most
        // of the time this will be what we desire to use for the relatinoships.
        if (is_null($relation))
        {
            list(, $caller) = debug_backtrace(false);

            $relation = $caller['function'];
        }
		
        // Check if it is a relation with an original model.
        if (!is_subclass_of($related, 'Jenssegers\Mongodb\Model'))
        {
            return parent::belongsTo($related, $foreignKey, $otherKey, $relation);
        }

        // If no foreign key was supplied, we can use a backtrace to guess the proper
        // foreign key name by using the name of the relationship function, which
        // when combined with an "_id" should conventionally match the columns.
        if (is_null($foreignKey))
        {
            $foreignKey = snake_case($relation).'_id';
        }

        $instance = new $related;

        // Once we have the foreign key names, we'll just create a new Eloquent query
        // for the related models and returns the relationship instance which will
        // actually be responsible for retrieving and hydrating every relations.
        $query = $instance->newQuery();

        $otherKey = $otherKey ?: $instance->getKeyName();

        return new BelongsTo($query, $this, $foreignKey, $otherKey, $relation);
    }

    /**
     * Define a polymorphic, inverse one-to-one or many relationship.
     *
     * @param  string  $name
     * @param  string  $type
     * @param  string  $id
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo
     */
    public function morphTo($name = null, $type = null, $id = null)
    {
        // If no name is provided, we will use the backtrace to get the function name
        // since that is most likely the name of the polymorphic interface. We can
        // use that to get both the class and foreign key that will be utilized.
        if (is_null($name))
        {
            list(, $caller) = debug_backtrace(false);

            $name = snake_case($caller['function']);
        }

        list($type, $id) = $this->getMorphs($name, $type, $id);

        // If the type value is null it is probably safe to assume we're eager loading
        // the relationship. When that is the case we will pass in a dummy query as
        // there are multiple types in the morph and we can't use single queries.
        if (is_null($class = $this->$type))
        {
            return new MorphTo(
                $this->newQuery(), $this, $id, null, $type, $name
            );
        }

        // If we are not eager loading the relatinship, we will essentially treat this
        // as a belongs-to style relationship since morph-to extends that class and
        // we will pass in the appropriate values so that it behaves as expected.
        else
        {
            $instance = new $class;

            return new MorphTo(
                with($instance)->newQuery(), $this, $id, $instance->getKeyName(), $type, $name
            );
        }
    }

    /**
     * Define a many-to-many relationship.
     *
     * @param  string  $related
     * @param  string  $collection
     * @param  string  $foreignKey
     * @param  string  $otherKey
     * @param  string  $relation
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function belongsToMany($related, $collection = null, $foreignKey = null, $otherKey = null, $relation = null)
    {
        // If no relationship name was passed, we will pull backtraces to get the
        // name of the calling function. We will use that function name as the
        // title of this relation since that is a great convention to apply.
        if (is_null($relation))
        {
            $relation = $this->getBelongsToManyCaller();
        }
		
        // Check if it is a relation with an original model.
        if (!is_subclass_of($related, 'Jenssegers\Mongodb\Model'))
        {
            return parent::belongsToMany($related, $collection, $foreignKey, $otherKey, $relation);
        }

        // First, we'll need to determine the foreign key and "other key" for the
        // relationship. Once we have determined the keys we'll make the query
        // instances as well as the relationship instances we need for this.
        $foreignKey = $foreignKey ?: $this->getForeignKey() . 's';

        $instance = new $related;

        $otherKey = $otherKey ?: $instance->getForeignKey() . 's';

        // If no table name was provided, we can guess it by concatenating the two
        // models using underscores in alphabetical order. The two model names
        // are transformed to snake case from their default CamelCase also.
        if (is_null($collection))
        {
            $collection = $instance->getTable();
        }

        // Now we're ready to create a new query builder for the related model and
        // the relationship instances for the relation. The relations will set
        // appropriate query constraint and entirely manages the hydrations.
        $query = $instance->newQuery();

        return new BelongsToMany($query, $this, $collection, $foreignKey, $otherKey, $relation);
    }

    /**
     * Get a new query builder instance for the connection.
     *
     * @return Builder
     */
    protected function newBaseQueryBuilder()
    {
        $connection = $this->getConnection();

        // Check the connection type
        if ($connection instanceof \Jenssegers\Mongodb\Connection)
        {
            return new QueryBuilder($connection);
        }

        return parent::newBaseQueryBuilder();
    }

}
