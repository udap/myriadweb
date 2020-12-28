import React from "react";
import NumberFormat from "react-number-format";
import { Descriptions } from "antd";

import "./index.less";
import comEvents from "@utils/comEvents";

const ConfigPanel = (props) => {
  return (
    <Descriptions size="small" bordered column={1}>
      <Descriptions.Item label="票券名称">{props.name}</Descriptions.Item>
      {props.discount && props.discount.type === "PERCENT" ? (
        <>
          <Descriptions.Item label="类型">折扣券</Descriptions.Item>
          <Descriptions.Item label="折扣">
            <NumberFormat
              value={props.discount.valueOff}
              displayType={"text"}
              suffix={"%"}
            />
          </Descriptions.Item>
          <Descriptions.Item label="最高优惠">
            {props.discount.amountLimit ? (
              <NumberFormat
                value={props.discount.amountLimit / 100}
                displayType={"text"}
                thousandSeparator={true}
                prefix={"¥"}
              />
            ) : (
              "无限制"
            )}
          </Descriptions.Item>
        </>
      ) : null}
      {props.discount && props.discount.type === "AMOUNT" ? (
        <>
          <Descriptions.Item label="类型">代金券</Descriptions.Item>
          <Descriptions.Item label="金额">
            <NumberFormat
              value={props.discount.valueOff / 100}
              displayType={"text"}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
              prefix={"¥"}
            />
          </Descriptions.Item>
        </>
      ) : null}
      {props.daysAfterDist ? (
        <Descriptions.Item label="有效期">
          领取/发放后 {props.daysAfterDist} 天内有效
        </Descriptions.Item>
      ) : null}
      {props.effective && props.expiry ? (
        <Descriptions.Item label="有效期">
          {props.effective}至{comEvents.formatExpiry(props.expiry)}
        </Descriptions.Item>
      ) : null}
      <Descriptions.Item label="发行方式">
        {props.multiple ? "一码一券" : "通用码"}
      </Descriptions.Item>
      {props.type === "GIFT" ? (
        <>
          <Descriptions.Item label="商品名称">
            {props.product.name}
          </Descriptions.Item>
          <Descriptions.Item label="SKU">
            {props.product.code}
          </Descriptions.Item>
          <Descriptions.Item label="商品市场零售价">
            <NumberFormat
              value={props.product.marketPrice / 100}
              displayType={"text"}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
              prefix={"¥"}
            />
          </Descriptions.Item>
          <Descriptions.Item label="商品换购价格">
            <NumberFormat
              value={props.product.exchangePrice / 100}
              displayType={"text"}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
              prefix={"¥"}
            />
          </Descriptions.Item>
        </>
      ) : null}
    </Descriptions>
  );
};

export default ConfigPanel;
