import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import MarketHome from "./marketHome";
import MarketEdit from "./marketEdit";
import MarketDetail from "./marketDetail";
import "./index.less";
export default class Market extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/admin/market" component={MarketHome}></Route>
        <Route path="/admin/market/edit" component={MarketEdit}></Route>
        <Route path="/admin/market/detail" component={MarketDetail}></Route>
        <Redirect to="/admin/market"></Redirect>
      </Switch>
    );
  }
}
