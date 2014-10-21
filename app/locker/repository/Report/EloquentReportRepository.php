<?php namespace Locker\Repository\Report;

use \app\locker\helpers\Helpers as Helpers;
use Report;

class EloquentReportRepository implements ReportRepository {

  public $validator;

  /**
   * Validates the given data.
   * @param  AssocArray $data The data to be validated.
   * @return Validator The validator used to validate the data.
   */
  private function validate($data) {
    return \Validator::make($data, Report::$rules);
  }

  /**
   * Gets all of the reports for the given LRS.
   * @param String $lrs LRS's identifier.
   * @return [Report] All of the reports.
   */
  public function all($lrs) {
    return Helpers::replaceHtmlEntity(Report::where('lrs', $lrs)->get());
  }

  /**
   * Gets the report with the given id.
   * @param String $id Report id.
   * @return Report
   */
  public function find($id) {
    return Report::find($id);
  }

  /**
   * Creates a report with the given data.
   * @param AssocArray $data Attributes of the report.
   * @return Report Created report.
   */
  public function create($data) {
    $validator = $this->validate($data);

    if ($validator->fails()) {
      $this->validator = $validator;
      throw new Exception('Validation failed.');
    } else {
      $data = Helpers::replaceFullStop($data);

      // Creates a report with the given data.
      $report = new Report($data);
      $report->save();
      return Helpers::replaceHtmlEntity($report);
    }
  }

  /**
   * Updates the report (with the given id) with the given data.
   * @param String $id Report id.
   * @param AssocArray $data Attributes of the report.
   * @return Report Updated report.
   */
  public function update($id, $data) {
    $validator = $this->validate($data);

    if ($validator->fails()) {
      $this->validator = $validator;
      throw new Exception('Validation failed.');
    } else {
      $data = Helpers::replaceFullStop($data);

      // Updates a report with the given data.
      $report = $this->find($id);
      $report->update($data);
      return Helpers::replaceHtmlEntity($report);
    }
  }

  /**
   * Deletes the report with the given id.
   * @param String $id Report id.
   * @return Boolean Success of the deletion.
   */
  public function delete($id) {
    return $this->find($id)->delete();
  }

  public function setQuery($lrs, $query, $field, $wheres) {
    return \Statement::select($field)
      ->where('lrs._id', $lrs)
      ->where($wheres, 'like', '%'.$query.'%')
      ->distinct()
      ->take(6)
      ->get();
  }

  public function statements($id) {
    $report = $this->find($id);
    return (new \Locker\Repository\Query\EloquentQueryRepository)->selectStatements(
      $report->lrs,
      Helpers::replaceHtmlEntity($report->query),
      false
    );
  }

}