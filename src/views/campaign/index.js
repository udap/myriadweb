import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import CampaignHome from "./campaignHome";
import CampaignEdit from "./campaignEdit";
import CampaignDetail from "./campaignDetail";
import "./index.less";
export default class Campaign extends Component {
                 render() {
                   return (
                     <Switch>
                       <Route
                         exact
                         path="/admin/campaign"
                         component={CampaignHome}
                       ></Route>
                       <Route
                         path="/admin/campaign/edit/:id"
                         component={CampaignEdit}
                       ></Route>
                       <Route
                         path="/admin/campaign/detail/:id"
                         component={CampaignDetail}
                       ></Route>
                       <Redirect to="/admin/campaign"></Redirect>
                     </Switch>
                   );
                 }
               }
