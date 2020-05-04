import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import CouponHome from "./couponHome";
import CouponDetail from "./couponDetail";
import "./index.less";
export default class Coupon extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/admin/coupon" component={CouponHome}></Route>
        <Route path="/admin/coupon/detail/:id" component={CouponDetail}></Route>
        <Redirect to="/admin/coupon"></Redirect>
      </Switch>
    );
  }
}
