import React from "react";
import { Card, List, Button } from "antd";
import { AntdIcon } from "../../components";
import { PlusCircleOutlined } from "@ant-design/icons";

import "./index.less";

const CampaignTypes = [
  {
    name: "优惠券活动",
    icon: "DollarCircleOutlined",
    type: "VOUCHER",
    subType: "COUPON", //VOUCHER, PROMOTION
    desc:
      "电子优惠券是企业利用App、短信、社交媒体等多种渠道进行数字化营销的便利手段。每一张优惠券都有一个唯一的、随机产生的编码，可以有效防止欺诈。",
  },
  // {
  //   name: "礼品换购活动",
  //   icon: "GiftOutlined",
  //   type: "VOUCHER",
  //   subType: "GIFT", //VOUCHER, PROMOTION
  //   desc:
  //     "礼品换购活动允许企业利用性价比高的热门礼品实现低成本营销，在不降低利润的前提下为用户营造超值的优惠力度，完成引流、截流、回流、现金流和营业额的突破。",
  // },
];

const CampaignTypeSelect = (props) => {
  return (
    <div className="site-card-wrapper">
      <List
        dataSource={CampaignTypes}
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 2, xl: 3, xxl: 4 }}
        renderItem={(item) => (
          <List.Item>
            <Card bordered={false}>
              <div style={{ display: "flex" }}>
                <div>
                  <List.Item.Meta title={item.name} description={item.desc} />
                  <Button
                    style={{ paddingLeft: "0" }}
                    type="link"
                    size="large"
                    icon={<PlusCircleOutlined />}
                    danger
                    disabled={props.disabled}
                    onClick={props.onSelect.bind(this, item)}
                  >
                    选择
                  </Button>
                </div>
                <div className="market_icon">
                  <AntdIcon name={item.icon} />
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      ></List>
    </div>
  );
};

export default CampaignTypeSelect;
