import React, { Component } from "react";
import {
  Card,
  Col,
  Row,
  List,
} from "antd";
import { AntdIcon, LinkBtn } from "../../components";

import "./index.less";

const CampaignTypes = [
  {
    name: "优惠券活动",
    icon: "DollarCircleOutlined",
    type: "VOUCHER", //VOUCHER, PROMOTION
    desc:
      "电子优惠券是企业利用App、短信、社交媒体等多种渠道进行数字化营销的便利手段。每一张优惠券都有一个唯一的、随机产生的编码，可以有效防止欺诈。",
  },
];

const CampaignTypeSelect = (props) => {
  return (
    <div className="site-card-wrapper">
      <Row>
        <List
          dataSource={CampaignTypes}
          renderItem={(item) => (
            <Col xs={24} sm={24} md={24} lg={12} xl={8}>
              <Card bordered={false}>
                <List.Item key={item.name}>
                  <Card bordered={false}>
                    <List.Item.Meta
                      title={item.name}
                      description={item.desc}
                    />

                    <div className="market_icon_btn">
                      <AntdIcon name="PlusCircleOutlined" />
                      <LinkBtn
                        className="btnChoose"
                        onClick={props.onSelect.bind(this,item)}
                      >
                        选择
                      </LinkBtn>
                    </div>
                  </Card>
                  <div className="market_icon">
                    <AntdIcon name="DollarCircleOutlined" />
                  </div>
                </List.Item>
              </Card>
            </Col>
          )}
        ></List>
      </Row>
    </div>
  );

}

export default CampaignTypeSelect;

