import React from "react";
import { Drawer, Descriptions, Tag, Collapse } from "antd";

import { couponTypes, campaignStatusObj } from "@/utils/constants";
import ValueOffText from "../ValueOffText";

const CouponDetails = (props) => {
  return (
    <Drawer
      title="票券详情"
      width={480}
      visible={props.visible}
      onClose={props.handleCancel}
      destroyOnClose
    >
      <Collapse defaultActiveKey={["1", "2", "3"]}>
        <Collapse.Panel header="基本信息" key="1">
          <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="券名">
              {props.data?.name}
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag color="green">{couponTypes[props.data?.type]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="发行总数">
              {props.data?.totalSupply}
            </Descriptions.Item>
            <Descriptions.Item label="剩余数量">
              {props.data?.remainingSupply}
            </Descriptions.Item>
            <Descriptions.Item label="优惠金额">
              <ValueOffText
                type={props.data?.type}
                discountType={props.data?.discountType}
                text={props.data?.valueOff}
              />
            </Descriptions.Item>
            <Descriptions.Item label="有效期">
              {props.data?.periodTime}
            </Descriptions.Item>
          </Descriptions>
        </Collapse.Panel>
        <Collapse.Panel header="所属活动" key="2">
          <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="活动名">
              {props.data?.camName}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color="green">
                {campaignStatusObj[props.data?.camStatus]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="自动增发">
              {props.data?.camAutoUpdate ? "是" : "否"}
            </Descriptions.Item>
            <Descriptions.Item label="创建人">
              {props.data?.camCreatedByName}
            </Descriptions.Item>
            {props.data?.camTags && (
              <Descriptions.Item label="标签">
                {props.data?.camTags.split(",").map((item, index) => (
                  <Tag color="cyan" key={index}>
                    {item}
                  </Tag>
                ))}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="发布时间">
              {props.data?.camActivationTime}
            </Descriptions.Item>
          </Descriptions>
        </Collapse.Panel>
        <Collapse.Panel header="所属机构" key="3">
          <Descriptions size="small" bordered column={1}>
            <Descriptions.Item label="机构名">
              {props.data?.issuerName}
            </Descriptions.Item>
          </Descriptions>
        </Collapse.Panel>
      </Collapse>
    </Drawer>
  );
};

export default CouponDetails;
