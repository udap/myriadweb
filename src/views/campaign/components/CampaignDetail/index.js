import React, { Component } from "react";
import { Drawer, Collapse } from "antd";
import { withRouter } from "react-router-dom";

import "./index.less";
import { InfoPanel, ConfigPanel, RedemptionRules } from "./components";

const { Panel } = Collapse;

class CampaignDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listSize: 20,
      campaign: { ...props.campaign } || {},
      visible: props.visible || false,
    };
  }

  onClose = () => {
    this.setState({ visible: false });
    this.props.onClose();
  };

  render() {
    console.log(this);
    console.log(window.location);
    const { campaign, visible } = this.state;

    const parties = campaign.parties ? campaign.parties : [];
    let merchants = [];
    parties.forEach((p) => {
      if (p.type === "MERCHANT") merchants.push(p);
    });
    return (
      <Drawer
        className="camDetail"
        width={480}
        title="活动详情"
        onClose={this.onClose}
        visible={visible}
      >
        <Collapse defaultActiveKey={["1"]}>
          <Panel header="基本信息" key="1">
            <InfoPanel {...campaign} />
          </Panel>
          {campaign.voucherConfig ? (
            <Panel header="详细设置" key="2">
              <ConfigPanel {...campaign.voucherConfig} />
            </Panel>
          ) : null}
          {campaign.rules && campaign.rules.length !== 0 ? (
            <Panel header="使用规则" key="3">
              {campaign.rules.length !== 0 ? (
                <RedemptionRules
                  rulesArr={campaign.rules}
                  parties={campaign.parties}
                />
              ) : null}
            </Panel>
          ) : null}
        </Collapse>
      </Drawer>
    );
  }
}

export default withRouter(CampaignDetail);
