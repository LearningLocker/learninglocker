<?php namespace Jenssegers\Mongodb\Relations;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany as EloquentHasMany;

class HasMany extends EloquentHasMany {

    /**
     * Add the constraints for a relationship count query.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  \Illuminate\Database\Eloquent\Builder  $parent
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function getRelationCountQuery(Builder $query, Builder $parent)
    {
        $foreignKey = $this->getHasCompareKey();

        return $query->select($this->getHasCompareKey())->where($this->getHasCompareKey(), 'exists', true);
    }

}
