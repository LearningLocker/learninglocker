<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ConsistentForeignKeyNames extends Migration {

	public function up() {
		$this->chunkKeyRenaming(new DocumentAPI, 'lrs', 'lrs_id');
    $this->chunkKeyRenaming(new Statement, 'lrs._id', 'lrs_id');
    $this->chunkKeyRenaming(new Lrs, 'owner._id', 'owner_id');
    $this->chunkKeyRenaming(new Report, 'lrs', 'lrs_id');
    $this->chunkKeyRenaming(new Export, 'lrs', 'lrs_id');
	}

  public function down() {
    $this->chunkMongoIdRemoval(new DocumentAPI, 'lrs', 'lrs_id');
    $this->chunkMongoIdRemoval(new Statement, 'lrs._id', 'lrs_id');
    $this->chunkMongoIdRemoval(new Lrs, 'owner._id', 'owner_id');
    $this->chunkMongoIdRemoval(new Report, 'lrs', 'lrs_id');
    $this->chunkMongoIdRemoval(new Export, 'lrs', 'lrs_id');
  }

  private function chunkKeyRenaming($model, $old_name, $new_name) {
    $this->chunkModelMigration($model, $this->renameKey($old_name, $new_name));
  }

  private function chunkMongoIdRemoval($model, $old_name, $new_name) {
    $this->chunkModelMigration($model, $this->removeMongoId($old_name, $new_name));
  }

  private function removeMongoId($old_name, $new_name) {
    return function ($model) use ($old_name, $new_name) {
      $value = $model->$new_name;
      $model = $this->setKey($model, explode('.', $old_name), 0, (string) $value);
      $model->save();
    };
  }

  private function setKey($model, $keys, $key_index, $value) {
    if ($key_index < count($keys) - 1) {
      $model->{$keys[$key_index]} = (object) [];
      $this->setKey($model->{$keys[$key_index]}, $keys, $key_index + 1, $value);
    } else {
      $model->{$keys[$key_index]} = (string) $value;
    }
    return $model;
  }

  private function renameKey($old_name, $new_name) {
    return function ($model) use ($old_name, $new_name) {
      $value = array_reduce(explode('.', $old_name), function ($value, $key) {
        return is_object($value) ? $value->{$key} : $value[$key];
      }, $model);
      $model->$new_name = new \MongoId($value);
      $model->save();
    };
  }

  private function chunkModelMigration($model, Callable $migration) {
    $model->chunk(1000, function ($models) use ($migration) {
      foreach ($models as $model){
        $migration($model);
      }
      echo count($models) . ' converted.'.PHP_EOL;
    });

    echo 'All finished, hopefully!'.PHP_EOL;
  }

}
