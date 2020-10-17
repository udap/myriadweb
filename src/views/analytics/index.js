import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import IndividualReport from "./individualReport";
import OrganizationReport from "./organizationReport";

export default class SummaryReport extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/admin/reports/individual" component={IndividualReport}></Route>
        <Route exact path="/admin/reports/organization" component={OrganizationReport}></Route>
        <Redirect to="/admin/reports/individual"></Redirect>
      </Switch>
    );
  }
}