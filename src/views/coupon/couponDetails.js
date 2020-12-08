import React from "react";
import PropTypes from "prop-types";
import { Tag, Descriptions, Drawer, Table, Space } from "antd";
import NumberFormat from "react-number-format";
import comEvents from "../../utils/comEvents";
import { couponStatuses, couponSubTypes } from "../../utils/constants";
import "./index.less";

const merchantColumns = [
  {
    title: "商户名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "商户地址",
    dataIndex: "address",
    key: "address",
  },
];

const pageSize = 20;

const CouponDetails = (props) => {
  const { voucher, visible, onClose } = props;
  return voucher ? (
    <Drawer width={400} title="票券详情" onClose={onClose} visible={visible}>
      <Space direction="vertical">
        <Descriptions size="small" bordered column={1}>
          <Descriptions.Item label="券号">{voucher.code}</Descriptions.Item>
          <Descriptions.Item label="券名">
            {voucher.config.name}
          </Descriptions.Item>
          {_renderType(voucher.config)}
          <Descriptions.Item label="营销机构">
            {voucher.issuerName}
          </Descriptions.Item>
          {voucher.campaign ? (
            <Descriptions.Item label="营销活动">
              {voucher.campaign.name}
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item label="标签">
            <span>
              {voucher.category
                ? voucher.category.split(",").map((t, index) => (
                    <Tag color="cyan" key={index}>
                      {t}
                    </Tag>
                  ))
                : ""}
            </span>
          </Descriptions.Item>
          {voucher.config.daysAfterDist ? (
            <Descriptions.Item label="有效期">
              领取/发放后 {voucher.config.daysAfterDist} 天内有效
            </Descriptions.Item>
          ) : (
            <Descriptions.Item label="有效期">
              {voucher.effective}至{comEvents.formatExpiry(voucher.expiry)}
            </Descriptions.Item>
          )}
          {_renderValueOff(voucher.config)}
          <Descriptions.Item label="持有人">
            {voucher.ownerName}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color="green" key={voucher.status}>
              {couponStatuses.map((item, index) => (
                <span key={index}>{item[voucher.status]}</span>
              ))}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
        <div>
          <h4>参与商户</h4>
          <Table
            bordered
            size="small"
            className="tableFont"
            columns={merchantColumns}
            dataSource={voucher.merchants}
            pagination={{
              pageSize: pageSize,
              total: voucher.merchants.length,
            }}
          />
        </div>
      </Space>
    </Drawer>
  ) : null;
};

const _renderType = (config) => {
  let subType = config.type;
  return (
    <>
      <Descriptions.Item label="类型">
        <Tag color="green" key={subType}>
          {couponSubTypes.map((item, index) => (
            <span key={index}>{item[subType]}</span>
          ))}
        </Tag>
      </Descriptions.Item>
    </>
  );
};

const _renderValueOff = (config) => {
  let disscountType = config.discount ? config.discount.type : config.type;
  let valueOff = config.discount ? config.discount.valueOff : "";
  return (
    <>
      {config.type === "COUPON" ? (
        <>
          <Descriptions.Item label="折扣">
            {disscountType === "AMOUNT" ? (
              <NumberFormat
                value={valueOff / 100}
                displayType={"text"}
                thousandSeparator={true}
                prefix={"¥"}
              />
            ) : (
              <NumberFormat
                value={valueOff}
                displayType={"text"}
                suffix={"%"}
              />
            )}
          </Descriptions.Item>
          {disscountType === "PERCENT" ? (
            <Descriptions.Item label="最高优惠">
              {config.discount.amountLimit ? (
                <NumberFormat
                  value={config.discount.amountLimit / 100}
                  displayType={"text"}
                  thousandSeparator={true}
                  prefix={"¥"}
                />
              ) : (
                "无限制"
              )}
            </Descriptions.Item>
          ) : null}
        </>
      ) : config.type === "GIFT" ? (
        <>
          <Descriptions.Item label="商品名称">
            {config.product.name}
          </Descriptions.Item>
          <Descriptions.Item label="SKU">
            {config.product.code}
          </Descriptions.Item>
          <Descriptions.Item label="商品市场零售价">
            <NumberFormat
              value={config.product.marketPrice / 100}
              displayType={"text"}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
              prefix={"¥"}
            />
          </Descriptions.Item>
          <Descriptions.Item label="商品换购价格">
            <NumberFormat
              value={config.product.exchangePrice / 100}
              displayType={"text"}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
              prefix={"¥"}
            />
          </Descriptions.Item>
        </>
      ) : null}
    </>
  );
};

CouponDetails.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  voucher: PropTypes.any,
};

export default CouponDetails;
