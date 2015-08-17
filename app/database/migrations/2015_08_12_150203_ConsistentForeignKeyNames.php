<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ConsistentForeignKeyNames extends Migration {

	public function up() {
    $db = \DB::getMongoDB();

    Lrs::get()->each(function (Lrs $lrs) use ($db) {
      $convertToMongoId = function ($value) {
        return new \MongoId($value);
      };
      $this->changeForeignKey($db->statements, 'lrs._id', 'lrs_id', $lrs->_id, $convertToMongoId);
      $this->changeForeignKey($db->documentapi, 'lrs', 'lrs_id', $lrs->_id, $convertToMongoId);
      $this->changeForeignKey($db->reports, 'lrs', 'lrs_id', $lrs->_id, $convertToMongoId);
      $this->changeForeignKey($db->exports, 'lrs', 'lrs_id', $lrs->_id, $convertToMongoId);

      $lrs->owner_id = $convertToMongoId($lrs->owner['_id']);
      $lrs->save();

      echo 'Models for "'.$lrs->title.'" converted.'.PHP_EOL;
    });

    echo 'All finished, hopefully!'.PHP_EOL;
	}

  private function changeForeignKey($collection, $old_key, $new_key, $old_value, $modifier) {
    $collection->update([
      $old_key => $old_value
    ], [
      '$set' => [
        $new_key => $modifier($old_value)
      ]
    ], [
      'multiple' => true
    ]);
  }

  public function down() {
    $db = \DB::getMongoDB();

    Lrs::get()->each(function (Lrs $lrs) use ($db) {
      $convertToString = function ($value) {
        return (string) $value;
      };
      $this->changeForeignKey($db->statements, 'lrs_id', 'lrs._id', $lrs->_id, $convertToString);
      $this->changeForeignKey($db->documentapi, 'lrs_id', 'lrs', $lrs->_id, $convertToString);
      $this->changeForeignKey($db->reports, 'lrs_id', 'lrs', $lrs->_id, $convertToString);
      $this->changeForeignKey($db->exports, 'lrs_id', 'lrs', $lrs->_id, $convertToString);

      $lrs->owner = [
        '_id' => $convertToString($lrs->owner_id)
      ];
      $lrs->save();

      echo 'Models for "'.$lrs->title.'" converted.'.PHP_EOL;
    });

    echo 'All finished, hopefully!'.PHP_EOL;
  }

}
