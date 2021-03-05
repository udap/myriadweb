import React from "react";
import { Drawer, Collapse, Skeleton } from "antd";

import "./CampaignDetail.less";
import {
  InfoPanel,
  ConfigPanel,
  RedemptionRules,
  CheckInPanel,
} from "./components";

const { Panel } = Collapse;

const CampaignDetail = (props) => {
  console.log(props);
  return (
    <Drawer
      className="camDetail"
      width={480}
      title="活动详情"
      onClose={props.onClose}
      visible={props.visible}
    >
      <Skeleton loading={!props.campaign} active>
        <Collapse defaultActiveKey={["1"]}>
          <Panel header="基本信息" key="1">
            <InfoPanel {...props.campaign} />
          </Panel>
          {props.campaign?.voucherConfig && (
            <Panel header="详细设置" key="2">
              <ConfigPanel {...props.campaign?.voucherConfig} />
            </Panel>
          )}
          {props.campaign?.rules && props.campaign?.rules.length !== 0 && (
            <Panel header="使用规则" key="3">
              {props.campaign?.rules.length !== 0 && (
                <RedemptionRules
                  rulesArr={props.campaign?.rules}
                  parties={props.campaign?.parties}
                />
              )}
            </Panel>
          )}
          {props.campaign?.subType.includes("CHECKIN") && (
            <>
              {props.campaign?.metadata?.schedule && (
                <Panel header="签到详情" key="4">
                  <CheckInPanel {...props.campaign?.metadata} />
                </Panel>
              )}
            </>
          )}
        </Collapse>
      </Skeleton>
    </Drawer>
  );
};

export default CampaignDetail;
