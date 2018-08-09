import React, { Component } from 'react';
import { compose } from 'recompose';
import { Map, OrderedMap } from 'immutable';
import isString from 'lodash/isString';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { getLegend } from 'ui/utils/defaultTitles';

import { displayVerb, displayActivity } from '../../utils/xapi';
import { makeData, Logo, Tips } from "./Utils";
import ReactTable from "react-table";
import "./styles.css";

class TableResults extends Component {
  constructor() {
    super();
    this.state = {
      data: [{
        firstName: 'Jim',
        lastName: 'Baps',
        age: 23,
        visits: 10,
        progress: 20
      },{
        firstName: 'Bentley',
        lastName: 'McPherson',
        age: 40,
        visits: 15,
        progress: 25
      }]
    };
  }
  // render() {
  //   return <div>Hello world</div>;
  // }
  render() {
    const { data } = this.state;
    return (
      <div>
        <ReactTable
          data={data}
          columns={[
            {
              Header: "Name",
              columns: [
                {
                  Header: "First Name",
                  accessor: "firstName"
                },
                {
                  Header: "Last Name",
                  id: "lastName",
                  accessor: d => d.lastName
                }
              ]
            },
            {
              Header: "Info",
              columns: [
                {
                  Header: "Age",
                  accessor: "age"
                }
              ]
            },
            {
              Header: 'Stats',
              columns: [
                {
                  Header: "Visits",
                  accessor: "visits"
                }
              ]
            }
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
        <br />
        <Tips />
        <Logo />
      </div>
    );
  }
}


export default TableResults;
