import React from "react";
import PropTypes from 'prop-types';
import { Tag, Descriptions, Drawer } from "antd";
import comEvents from "../../utils/comEvents";
import { couponStatuses, voucherTypes } from "../../utils/constants";
import "./index.less";

const CouponDetails = (props) => {
  const {voucher, visible, onClose} = props;
  return voucher? (
    <Drawer
      width={400}
      title="票券详情"
      onClose={onClose}
      visible={visible}
    >
      <Descriptions size="small" bordered column={1}>
        <Descriptions.Item label="券号">
          {voucher.code}
        </Descriptions.Item>
        <Descriptions.Item label="券名">
          {voucher.config.name}
        </Descriptions.Item>
        {
          _renderType(voucher.config)
        }
        <Descriptions.Item label="营销机构">
          {voucher.issuerName}
        </Descriptions.Item>
        { 
          voucher.campaign ? (
            <Descriptions.Item label="营销活动">
              {voucher.campaign.name}
            </Descriptions.Item>
          ) : null
        }
        <Descriptions.Item label="标签">
          <span>{voucher.category ? voucher.category.split(",").map((t,index)=><Tag color="cyan" key={index}>{t}</Tag>) : ""}</span>
        </Descriptions.Item>
        {
          voucher.config.daysAfterDist ? (
          <Descriptions.Item label="有效期">
              领取/发放后 {voucher.config.daysAfterDist} 天内有效
          </Descriptions.Item>
          ) : (
            <Descriptions.Item label="有效期">
              {voucher.effective}至{comEvents.formatExpiry(voucher.expiry)}
            </Descriptions.Item>
          )
        }
        {
          _renderValueOff(voucher.config)
        }
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
    </Drawer>
  ) : null;
};

const _renderType = (config) => {
  let subType = config.discount ? config.discount.type : config.type;
  return (
    <>
      <Descriptions.Item label="类型">
        <Tag color="green" key={subType}>
          {voucherTypes.map((item, index) => (
            <span key={index}>{item[subType]}</span>
          ))}
        </Tag>
      </Descriptions.Item>
    </>
  );
};

const _renderValueOff = (config) => {
  let subType = config.discount ? config.discount.type : config.type;
  let valueOff = config.discount ? config.discount.valueOff : "";
  if (subType === "AMOUNT") {
    valueOff = "¥"+comEvents.formatCurrency(valueOff);
  }
  else if (subType === "PERCENT")
    valueOff = valueOff + "%";
  return (
    <>
      <Descriptions.Item label="折扣">
        {valueOff}
      </Descriptions.Item>   
      {
        subType === "PERCENT" ? (
        <Descriptions.Item label="最高优惠">
          {config.discount.amountLimit ? comEvents.formatCurrency(config.discount.amountLimit) + "元" : "无限制"}
        </Descriptions.Item>
        ) : null  
      } 
    </>
  );
};

CouponDetails.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  voucher: PropTypes.any
};

export default CouponDetails;