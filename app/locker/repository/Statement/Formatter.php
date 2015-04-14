<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Helpers as Helpers;

interface FormatterInterface {
  public function identityStatement(\stdClass $statement);
  public function canonicalStatement(\stdClass $statement, array $langs);
}

class Formatter {

  /**
   * Removes properties other than `objectType` and identifier from objects inside a statement.
   * @param \stdClass $statement Statement to be formatted.
   * @return \stdClass Formatted statement.
   */
  public function identityStatement(\stdClass $statement) {
    $actor = $statement->actor;

    // Processes an anonymous group or actor.
    $is_anonymous_group = $actor->objectType === 'Group' && Helpers::getAgentIdentifier($actor) === null;
    if ($is_anonymous_group) {
      $actor->members = array_map(function (\stdClass $member) {
        return $this->identityObject($member, Helpers::getAgentIdentifier($member));
      }, $actor->members);
    } else {
      $actor = $this->identityObject($actor, Helpers::getAgentIdentifier($actor));
    }

    // Replace parts of the statements.
    $statement->actor = $actor;
    $statement->object = $this->identityObject(
      $statement->object,
      Helpers::getAgentIdentifier($statement->object) ?: 'id'
    );
    return $statement;
  }

  /**
   * Removes properties other than `objectType` and identifier.
   * @param \stdClass $object Object to be formatted.
   * @param String $identifier Name of the identifier property.
   * @return \stdClass Formatted object.
   */
  private function identityObject(\stdClass $object, $identifier) {
    return (object) [
      $identifier => $object->{$identifier},
      'objectType' => $object->objectType
    ];
  }

  /**
   * Canonicalises a statement.
   * @param \stdClass $statement Statement to be formatted.
   * @param [String] $langs Languages acceptable for the user.
   * @return \stdClass Formatted statement.
   */
  public function canonicalStatement(\stdClass $statement, array $langs) {
    // Canocalises the object.
    if (isset($statement->object->definition)) {
      $definition = $statement->object->definition;
      if (isset($definition->name)) {
        $definition->name = $this->canonicalLangMap($definition->name, $langs);
      }
      if (isset($definition->description)) {
        $definition->description = $this->canonicalLangMap($definition->description, $langs);
      }
      $statement->object->definition = $definition;
    }

    // Canocalises the verb.
    if (isset($statement->verb->display)) {
      $statement->verb->display = $this->canonicalLangMap($statement->verb->display, $langs);
    }

    return $statement;
  }

  /**
   * Returns the most appropriate string for a given set of languages.
   * @param \stdClass $lang_map Language map to be searched.
   * @param [String] $langs Languages acceptable for the user.
   * @return String Most appropriate string.
   */
  private function canonicalLangMap(\stdClass $lang_map, array $langs) {
    $display_langs = array_keys((array) $lang_map);

    // Determines the acceptable languages.
    $acceptable_langs = array_filter($display_langs, function ($display_lang) use ($langs) {
      return in_array($display_lang, $langs);
    });
    $acceptable_langs = array_values($acceptable_langs);

    // Returns the canonicalised lang_map.
    if (count($acceptable_langs) > 0) {
      return $lang_map->{$acceptable_langs[0]};
    } else if (count($display_langs) > 0) {
      return $lang_map->{$display_langs[0]};
    } else {
      return null;
    }
  }
}
