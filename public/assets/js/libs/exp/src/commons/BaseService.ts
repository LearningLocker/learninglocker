/// <reference path="../definitions/references.d.ts" />
import events = require('events');
var CHANGE_EVENT = 'change';

class Service extends events.EventEmitter {
  emitChange() {
    this.emit(CHANGE_EVENT);
  }
  addChangeListener(cb: Function) {
    this.addListener(CHANGE_EVENT, cb);
  }
  removeChangeListener(cb: Function) {
    this.removeListener(CHANGE_EVENT, cb);
  }
}

export = Service;