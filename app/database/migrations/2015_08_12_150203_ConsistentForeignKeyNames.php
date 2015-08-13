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
  }

  private function renameKeyOnModel($model, $old_name, $new_name) {
    $value = array_reduce(explode('.', $old_name), function ($value, $key) {
      return is_object($value) ? $value->{$key} : $value[$key];
    }, $model);
    $model->$new_name = new \MongoId($value);
    //$model->$new_name = $value;
    $model->save();
  }

  private function renameKeyOnModels($models, $old_name, $new_name) {
    foreach ($models as $model){
      $this->renameKeyOnModel($model, $old_name, $new_name);
    }
    echo count($models) . ' converted.'.PHP_EOL;
  }

  private function chunkKeyRenaming($model, $old_name, $new_name) {
    $this->chunkModelMigration($model, function($documents) use ($old_name, $new_name) {
      $this->renameKeyOnModels($documents, $old_name, $new_name);
    });
  }

  private function chunkModelMigration($model, Callable $migration) {
    $model->chunk(1000, $migration);
    echo 'All finished, hopefully!'.PHP_EOL;
  }

}
