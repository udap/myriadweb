import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { privateRoutes } from "./routers";
import { FrameOut } from "./components";

class App extends Component {
  constructor(props) {
    super(props);
    console.log("App -> constructor -> props", props);
    //监测地址栏是否发生变化 修改地址title
    // this.props.history.listen((location) => {
    //   window.document.title = curTtile;
    // });
  }
  //返回路由组件
  getComponent(privateRoutes) {
    return privateRoutes.map((item) => {
      if (!item.children) {
        if (item.exact) {
          return (
            <Route
              exact={item.exact}
              key={item.pathname}
              path={item.pathname}
              component={item.component}
            />
          );
        } else {
          return (
            <Route
              key={item.pathname}
              path={item.pathname}
              component={item.component}
            />
          );
        }
      } else {
        return this.getComponent(item.children);
      }
    });
  }

  componentWillUnmount() {
    // window.onbeforeunload = function (e) {
    //   var storage = window.sessionStorage || sessionStorage;
    //   storage.clear();
    // };
   
  }

  render() {
    return (
      <FrameOut>
        {/*只匹配其中一个*/}
        <Switch>{this.getComponent(privateRoutes)}</Switch>
      </FrameOut>
    );
  }
}

export default App;
