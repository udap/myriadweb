import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Setting from "./setHome";
import SetDetail from "./setForm";
import './index.less'
export default class Coupon extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/admin/setting" component={Setting}></Route>
        <Route path="/admin/setting/new" component={SetDetail}></Route>
      </Switch>
    );
  }
}

