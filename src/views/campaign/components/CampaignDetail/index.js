import React, { Component } from "react";
import {
  Tag,
  Descriptions,
  Drawer,
  Table,
  Collapse,
  Button,
  message,
} from "antd";
import NumberFormat from "react-number-format";
import QRCode from "qrcode.react";
import saveAs from "save-svg-as-png";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CopyOutlined } from "@ant-design/icons";

import comEvents from "@utils/comEvents";
import {
  distributionMethods,
  API_BASE_URL,
  VOUCHER_COLLECT_URL,
  couponSubTypeMethods,
} from "@utils/constants";
import "./index.less";

const { Panel } = Collapse;
const imageOptions = {
  scale: 5,
  encoderOptions: 1,
  backgroundColor: "white",
};

class CampaignDetail extends Component {
  state = {
    listSize: 20,
    campaign: {},
    visible: false,
  };
  componentDidMount() {
    let { campaign, visible } = this.props;
    this.setState({
      campaign: campaign,
      visible: visible,
    });
    this.initColumns();
  }
  initColumns() {
    this.columns = [
      {
        title: "指定商户",
        dataIndex: "partyName",
        key: "partyName",
      },
      {
        title: "商户地址",
        dataIndex: "partyAddress",
        key: "partyAddress",
      },
    ];
  }
  onClose = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };

  downloadQrCode = () => {
    //    let canvas=document.getElementById('qrcode');
    saveAs.saveSvgAsPng(
      document.getElementById("qrcode"),
      "qrcode.png",
      imageOptions
    );
  };

  _renderInfoPanel = (campaign) => {
    return (
      <Descriptions
        size="small"
        bordered
        column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="活动类型">
          {couponSubTypeMethods.map((item, index) => (
            <span key={index}>{item[campaign.subType]}</span>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="活动名称">{campaign.name}</Descriptions.Item>
        <Descriptions.Item label="id">
          <div className="idView">
            <div>{campaign.id}</div>
            <CopyToClipboard
              text={campaign.id}
              onCopy={() =>
                message.success(
                  <>
                    已复制, <b>{campaign.id}</b>
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
        <Descriptions.Item label="活动名称">{campaign.name}</Descriptions.Item>
        <Descriptions.Item label="标签">
          {campaign.category
            ? campaign.category
                .split(",")
                .map((item, index) => <Tag color="cyan">{item}</Tag>)
            : ""}
        </Descriptions.Item>
        <Descriptions.Item label="活动时间">
          {campaign.effective}至{comEvents.formatExpiry(campaign.expiry)}
        </Descriptions.Item>
        <Descriptions.Item label="计划发行">
          <NumberFormat
            value={campaign.plannedSupply}
            displayType={"text"}
            thousandSeparator={true}
          />
        </Descriptions.Item>
        <Descriptions.Item label="实际发行">
          <NumberFormat
            value={campaign.totalSupply}
            displayType={"text"}
            thousandSeparator={true}
          />
        </Descriptions.Item>
        <Descriptions.Item label="允许增发">
          {campaign.autoUpdate ? "是" : "否"}
        </Descriptions.Item>
        <Descriptions.Item label="发放形式">
          {distributionMethods.map((item, index) => (
            <span key={index}>{item[campaign.distMethod]}</span>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="领取限制">
          <NumberFormat
            value={campaign.distLimit}
            displayType={"text"}
            suffix={" 张券/账户"}
          />
        </Descriptions.Item>
        {campaign.distMethod === "CUSTOMER_COLLECT" ? (
          <Descriptions.Item label="领取码">
            <a id="download" title="点我下载">
              <QRCode
                id="qrcode"
                value={
                  API_BASE_URL +
                  VOUCHER_COLLECT_URL +
                  "?campaignId=" +
                  campaign.id
                }
                renderAs={"svg"}
                onClick={this.downloadQrCode}
                size={120}
                level={"H"}
                imageSettings={{
                  src: "/images/logo.jpg",
                  height: 30,
                  width: 30,
                  excavate: true,
                }}
              />
            </a>
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="活动主页">
          <div className="word-wrap">{campaign.url ? campaign.url : ""}</div>
        </Descriptions.Item>
        <Descriptions.Item label="活动描述">
          {campaign.description}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  _renderConfigPanel(subType, voucherConfig) {
    let discountContent = null;
    if (
      voucherConfig &&
      voucherConfig.discount &&
      voucherConfig.discount.type === "PERCENT"
    ) {
      discountContent = (
        <>
          <Descriptions.Item label="类型">折扣券</Descriptions.Item>
          <Descriptions.Item label="折扣">
            <NumberFormat
              value={voucherConfig.discount.valueOff}
              displayType={"text"}
              suffix={"%"}
            />
          </Descriptions.Item>
          <Descriptions.Item label="最高优惠">
            {voucherConfig.discount.amountLimit ? (
              <NumberFormat
                value={voucherConfig.discount.amountLimit / 100}
                displayType={"text"}
                thousandSeparator={true}
                prefix={"¥"}
              />
            ) : (
              "无限制"
            )}
          </Descriptions.Item>
        </>
      );
    }

    if (
      voucherConfig &&
      voucherConfig.discount &&
      voucherConfig.discount.type === "AMOUNT"
    ) {
      discountContent = (
        <>
          <Descriptions.Item label="类型">代金券</Descriptions.Item>
          <Descriptions.Item label="金额">
            <NumberFormat
              value={voucherConfig.discount.valueOff / 100}
              displayType={"text"}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
              prefix={"¥"}
            />
          </Descriptions.Item>
        </>
      );
    }

    if (voucherConfig) {
      return (
        <Descriptions size="small" bordered column={1}>
          <Descriptions.Item label="票券名称">
            {voucherConfig.name}
          </Descriptions.Item>
          {discountContent}
          {voucherConfig.daysAfterDist ? (
            <Descriptions.Item label="有效期">
              领取/发放后 {voucherConfig.daysAfterDist} 天内有效
            </Descriptions.Item>
          ) : (
            <Descriptions.Item label="有效期">
              {voucherConfig.effective}至
              {comEvents.formatExpiry(voucherConfig.expiry)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="发行方式">
            {voucherConfig.multiple ? "一码一券" : "通用码"}
          </Descriptions.Item>
          {subType === "GIFT" ? (
            <>
              <Descriptions.Item label="商品名称">
                {voucherConfig.product.name}
              </Descriptions.Item>
              <Descriptions.Item label="SKU">
                {voucherConfig.product.code}
              </Descriptions.Item>
              <Descriptions.Item label="商品市场零售价">
                <NumberFormat
                  value={voucherConfig.product.marketPrice / 100}
                  displayType={"text"}
                  thousandSeparator={true}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  prefix={"¥"}
                />
              </Descriptions.Item>
              <Descriptions.Item label="商品换购价格">
                <NumberFormat
                  value={voucherConfig.product.exchangePrice / 100}
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
    } else {
      return "";
    }
  }

  _renderRedemptionRule = (rule) => {
    if (rule.name === "MinimumValue")
      return (
        <Descriptions.Item label="满减规则">
          <NumberFormat
            value={rule.option / 100}
            displayType={"text"}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
            prefix={"最低消费金额 ¥"}
          />
        </Descriptions.Item>
      );
    else if (rule.name === "SelectedTags")
      return (
        <Descriptions.Item label="商户标签">
          {rule.option.split(",").map((item, index) => (
            <Tag color="cyan">{item}</Tag>
          ))}
        </Descriptions.Item>
      );
    else if (rule.name === "SelectedRegions") {
      return (
        <Descriptions.Item label="所在区域">
          {comEvents.flatRegions(JSON.parse(rule.option)).map((t, idx) => (
            <Tag color="blue">{t}</Tag>
          ))}
        </Descriptions.Item>
      );
    }
  };
  _renderRedemptionRules = (rules, merchants) => {
    return (
      <>
        <Descriptions size="small" bordered column={1}>
          <>
            {rules.map((r) => {
              if (r.name === "MinimumValue")
                return this._renderRedemptionRule(r);
            })}
          </>
          {rules.map((r) => {
            if (r.name === "SelectedTags" || r.name === "SelectedRegions")
              return this._renderRedemptionRule(r);
          })}
        </Descriptions>
        <Table
          bordered
          size="small"
          className="step-marginTop tableFont"
          columns={this.columns}
          dataSource={merchants}
          pagination={{
            pageSize: 20,
            total: merchants.length,
            hideOnSinglePage: true,
            showSizeChanger: false,
          }}
        />
      </>
    );
  };

  renderContent = () => {
    const { campaign, visible } = this.state;
    const { voucherConfig, rules, subType } = this.state.campaign;
    var parties = campaign.parties ? campaign.parties : [];
    var merchants = [];
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
            {this._renderInfoPanel(campaign)}
          </Panel>
          <Panel header="详细设置" key="2">
            {/* 优惠券名称 类型 代金券 折扣券 折扣比例 % 最高优惠金额 元 有效期
          固定有效时间 2020-05-22 → 2020-05-23 相对有效时间 发放/领取后 天有效
          发行方式 一码一券 发行数量 1 是否自动增发 */}
            {this._renderConfigPanel(subType, voucherConfig)}
          </Panel>

          <Panel header="使用规则" key="3">
            {rules
              ? rules.map((v) =>
                  v.namespace === "REDEMPTION"
                    ? this._renderRedemptionRules(v.rules, merchants)
                    : null
                )
              : null}
          </Panel>
        </Collapse>
      </Drawer>
    );
  };
  render() {
    return (
      <div>
        <div style={{ height: "100%" }}>{this.renderContent()}</div>
      </div>
    );
  }
}

export default CampaignDetail;
