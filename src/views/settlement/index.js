import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import SettlementHome from "./settlementHome";
import SettlementDetail from "./settlementDetail";
import "./index.less";
export default class Settlement extends Component {
  render() {
    return (
      <Switch>
        <Route
          exact
          path="/admin/settlement"
          component={SettlementHome}
        ></Route>
        <Route
          path="/admin/settlement/new"
          component={SettlementDetail}
        ></Route>
      </Switch>
    );
  }
}
