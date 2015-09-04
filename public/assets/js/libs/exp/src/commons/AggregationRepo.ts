/// <reference path="../definitions/references.d.ts" />
import jquery = require('jquery');

class Repo {
  private endpoint: String;
  private auth: String;

  constructor(endpoint: String, username: String, password: String) {
    this.endpoint = this.getEndpoint(endpoint);
    this.auth = this.getAuth(username, password);
  }

  public update(pipeline: Array<any>) {
    return jquery.ajax({
      url: this.endpoint + '?pipeline=' + JSON.stringify(pipeline),
      dataType: 'json',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + this.auth);
      }.bind(this)
    });
  }

  private getAuth(username: String, password: String): String {
    return window.btoa(username + ':' + password);
  }

  private getEndpoint(endpoint: String): String {
    return endpoint + '/api/v1/statements/aggregate';
  }
}

export = Repo;