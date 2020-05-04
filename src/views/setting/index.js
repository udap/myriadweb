import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Setting from "./setHome";
import SetDetail from "./setDetail";
export default class Coupon extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/admin/setting" component={Setting}></Route>
        <Route path="/admin/setting/detail/:id" component={SetDetail}></Route>
      </Switch>
    );
  }
}

