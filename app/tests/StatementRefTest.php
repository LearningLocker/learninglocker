<?php namespace Tests;

// class StatementRefTest extends TestCase {

//   public function setUp() {
//     parent::setUp();
//     \Route::enableFilters();

//     // Authentication as super user.
//     $user = \User::firstOrCreate(['email' => 'test@example.com']);
//     \Auth::login($user);
//     $this->createLrs();
//   }

//   private function sendStatements($statements) {
//     $auth = [
//       'api_key' => $this->lrs->api['basic_key'],
//       'api_secret' => $this->lrs->api['basic_secret'],
//     ];
//     $headers = $this->makeRequestHeaders($auth);
//     $statements = json_encode($statements);
//     return $this->call('POST', '/data/xAPI/statements', [], [], $headers, $statements);
//   }

//   protected function generateStatement($statement) {
//     return array_merge($statement, [
//       'actor' => [
//         'mbox' => 'mailto:test@example.com'
//       ],
//       'verb' => [
//         'id' => 'http://www.example.com/verbs/test',
//       ],
//     ]);
//   }

//   private function createReferenceStatement($reference_id, $statement = []) {
//     return $this->generateStatement(array_merge($statement, [
//       'object' => [
//         'objectType' => 'StatementRef',
//         'id' => $this->generateUUID($reference_id)
//       ]
//     ]));
//   }

//   private function createIdStatement($id, $statement = []) {
//     return $this->generateStatement(array_merge($statement, [
//       'id' => $this->generateUUID($id)
//     ]));
//   }

//   private function checkStatement($id, $expected_references = [], $expected_referrers = []) {
//     $uuid = $this->generateUUID($id);
//     $statement = \Statement::where('lrs._id', $this->lrs->_id)->where('statement.id', '=', $uuid)->first();

//     //$queries = DB::getQueryLog();

//     $expected_references = array_map(function ($ref) {
//       return $this->generateUUID($ref);
//     }, $expected_references);

//     $expected_referrers = array_map(function ($ref) {
//       return $this->generateUUID($ref);
//     }, $expected_referrers);

//     // Checks $expected_references.
//     $references = array_map(function ($ref) {
//       return $ref['id'];
//     }, isset($statement->refs) ? $statement->refs : []);

//     // Checks $expected_referrers.
//     $referrers = (new \Statement)
//       ->select('statement.id')
//       ->where('statement.object.id', '=', $uuid)
//       ->where('statement.object.objectType', '=', 'StatementRef')
//       ->get()->toArray();
//     $referrers = array_map(function ($ref) {
//       return $ref['statement']['id'];
//     }, $referrers);

//     $this->assertEmpty(array_diff($expected_referrers, $referrers));
//   }

//   private function generateUUID($id) {
//     $len = strlen($id);
//     $start = str_repeat('0', 8 - $len);
//     return $id . $start . '-0000-0000-b000-000000000000';
//   }

//   public function testInsert1() {
//     $this->sendStatements([
//       $this->createIdStatement('A', $this->createReferenceStatement('E'))
//     ]);

//     $this->checkStatement('A', [], []);
//   }

//   public function testInsert2() {
//     $this->sendStatements([
//       $this->createIdStatement('A', $this->createReferenceStatement('E'))
//     ]);

//     $this->sendStatements([
//       $this->createIdStatement('C', $this->createReferenceStatement('A')),
//       $this->createIdStatement('D', $this->createReferenceStatement('B'))
//     ]);

//     $this->checkStatement('A', [], ['C']);
//     $this->checkStatement('C', ['A'], []);
//     $this->checkStatement('D', [], []);
//   }

//   public function testInsert3() {
//     $this->sendStatements([
//         $this->createIdStatement('A', $this->createReferenceStatement('E'))
//     ]);

//     $this->sendStatements([
//         $this->createIdStatement('C', $this->createReferenceStatement('A')),
//         $this->createIdStatement('D', $this->createReferenceStatement('B'))
//     ]);

//     $this->sendStatements([
//       $this->createIdStatement('B', $this->createReferenceStatement('A'))
//     ]);

//     $this->checkStatement('A', [], ['B', 'C']);
//     $this->checkStatement('B', ['A'], ['D']);
//     $this->checkStatement('C', ['A'], []);
//     $this->checkStatement('D', ['B', 'A'], []);
//   }

//   public function testInsert4() {
//     $this->sendStatements([
//         $this->createIdStatement('A', $this->createReferenceStatement('E'))
//     ]);

//     $this->sendStatements([
//         $this->createIdStatement('C', $this->createReferenceStatement('A')),
//         $this->createIdStatement('D', $this->createReferenceStatement('B'))
//     ]);

//     $this->sendStatements([
//         $this->createIdStatement('B', $this->createReferenceStatement('A'))
//     ]);

//     $this->sendStatements([
//       $this->createIdStatement('E', $this->createReferenceStatement('D'))
//     ]);

//     $this->checkStatement('A', ['E', 'D', 'B'], ['B', 'C']);
//     $this->checkStatement('B', ['A', 'E', 'D'], ['D']);
//     $this->checkStatement('C', ['A', 'E', 'D', 'B'], []);
//     $this->checkStatement('D', ['B', 'A', 'E'], ['E']);
//     $this->checkStatement('E', ['D', 'B', 'A'], ['A']);
//   }

//   public function tearDown() {
//     parent::tearDown();
//     if ($this->lrs)  $this->lrs->delete();
//   }

// }
