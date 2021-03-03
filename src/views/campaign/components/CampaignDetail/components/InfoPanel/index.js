import React from "react";
import QRCode from "qrcode.react";
import saveAs from "save-svg-as-png";
import { CopyToClipboard } from "react-copy-to-clipboard";
import NumberFormat from "react-number-format";
import { Descriptions, message, Button, Tag } from "antd";
import { CopyOutlined } from "@ant-design/icons";

import "./index.less";
import comEvents from "@utils/comEvents";
import {
  distributionMethods,
  VOUCHER_COLLECT_URL,
  couponSubTypeMethods,
} from "@utils/constants";
import { host } from "@utils/config";

const InfoPanel = (props) => {
  const downloadQrCode = () => {
    const imageOptions = {
      scale: 5,
      encoderOptions: 1,
      backgroundColor: "white",
    };
    saveAs.saveSvgAsPng(
      document.getElementById("qrcode"),
      "qrcode.png",
      imageOptions
    );
  };
  console.log(window.location);

  return (
    <Descriptions
      size="small"
      bordered
      column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
    >
      <Descriptions.Item label="活动类型">
        {couponSubTypeMethods.map((item, index) => (
          <span key={index}>{item[props.subType]}</span>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label="id">
        <div className="idView">
          <div>{props.id}</div>
          <CopyToClipboard
            text={props.id}
            onCopy={() =>
              message.success(
                <>
                  已复制, <b>{props.id}</b>
                </>
              )
            }
          >
            <Button
              type="primary"
              shape="circle"
              icon={<CopyOutlined />}
              size="small"
            />
          </CopyToClipboard>
        </div>
      </Descriptions.Item>
      <Descriptions.Item label="活动名称">{props.name}</Descriptions.Item>
      <Descriptions.Item label="标签">
        {props.category
          ? props.category.split(",").map((item, index) => (
              <Tag key={index} color="cyan">
                {item}
              </Tag>
            ))
          : ""}
      </Descriptions.Item>
      <Descriptions.Item label="活动时间">
        {props.effective}至{comEvents.formatExpiry(props.expiry)}
      </Descriptions.Item>
      <Descriptions.Item label="计划发行">
        <NumberFormat
          value={props.plannedSupply}
          displayType={"text"}
          thousandSeparator={true}
        />
      </Descriptions.Item>
      <Descriptions.Item label="实际发行">
        <NumberFormat
          value={props.totalSupply}
          displayType={"text"}
          thousandSeparator={true}
        />
      </Descriptions.Item>
      <Descriptions.Item label="自动增发">
        {props.autoUpdate ? "是" : "否"}
      </Descriptions.Item>
      <Descriptions.Item label="发放形式">
        {distributionMethods.map((item, index) => (
          <span key={index}>{item[props.distMethod]}</span>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label="领取限制">
        <NumberFormat
          value={props.distLimit}
          displayType={"text"}
          suffix={" 张券/账户"}
        />
      </Descriptions.Item>
      {props.distMethod === "CUSTOMER_COLLECT" ? (
        <Descriptions.Item label="领取码">
          <QRCode
            id="qrcode"
            value={`${window.location.host}${host}${VOUCHER_COLLECT_URL}?campaignId=${props.id}`}
            renderAs={"svg"}
            onClick={downloadQrCode}
            size={120}
            level={"H"}
            imageSettings={{
              src: "/images/logo.jpg",
              height: 30,
              width: 30,
              excavate: true,
            }}
          />
        </Descriptions.Item>
      ) : null}
      <Descriptions.Item label="活动主页">
        <div className="word-wrap">{props.url ? props.url : ""}</div>
      </Descriptions.Item>
      <Descriptions.Item label="活动描述">
        {props.description}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default InfoPanel;
