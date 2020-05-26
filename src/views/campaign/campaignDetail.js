import React, { Component, Fragment } from "react";
import { Tag, Descriptions, Input, Drawer, Table, Collapse } from "antd";
import comEvents from "../../utils/comEvents";
import "./index.less";

const { TextArea } = Input;
const { Panel } = Collapse;

class CampaignDetail extends Component {
  state = {
    listSize: 20,
    curInfo: {},
    visible: false,
  };
  componentDidMount() {
    let { listItem, visible } = this.props;
    this.setState({
      curInfo: listItem,
      visible: visible,
    });
    this.initColumns();
  }
  initColumns() {
    this.columns = [
      {
        title: "商户名称",
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
    this.props.closeDetail();
  };
    
  _renderInfoPanel = (campaign) => {
    return (
      <Descriptions
        size="small"
        bordered
        column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="活动类型">优惠券活动</Descriptions.Item>
        <Descriptions.Item label="活动名称">
          {campaign.name}
        </Descriptions.Item>
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
        <Descriptions.Item label="发行数量">
            {campaign.totalSupply ? campaign.totalSupply : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="允许增发?">
            {campaign.autoUpdate ? "是" : "否"}
        </Descriptions.Item>
        <Descriptions.Item label="活动主页">
          {campaign.url ? campaign.url : ""}
        </Descriptions.Item>
        <Descriptions.Item label="活动描述">
          {/* <TextArea placeholder={curInfo.description} rows={4} disabled /> */}
          {campaign.description}
        </Descriptions.Item>
      </Descriptions>
    );
  }

  _renderConfigPanel(voucherConfig) {
    let discountContent = null;
    if (voucherConfig && voucherConfig.discount && voucherConfig.discount.type === "PERCENT") {
      discountContent = (
        <Fragment>
        <Descriptions.Item label="类型">折扣券</Descriptions.Item>
        <Descriptions.Item label="折扣">
          {voucherConfig.discount.valueOff}% 
        </Descriptions.Item>                
        <Descriptions.Item label="最高优惠">
          {voucherConfig.discount.amountLimit ? comEvents.formatCurrency(voucherConfig.discount.amountLimit) + "元" : "无限制"}
        </Descriptions.Item>
        </Fragment>
      )
    }

    if (voucherConfig && voucherConfig.discount && voucherConfig.discount.type === "AMOUNT") {
      discountContent = (
        <Fragment>
        <Descriptions.Item label="类型">
        代金券
        </Descriptions.Item>
        <Descriptions.Item label="金额">
            {voucherConfig.discount.valueOff / 100}元 
        </Descriptions.Item> 
        </Fragment>
      )
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
              {voucherConfig.effective}至{comEvents.formatExpiry(voucherConfig.expiry)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="发行方式">
            {voucherConfig.multiple ? "一码一券" : "通用码"}
          </Descriptions.Item>
        </Descriptions>
      )
    } else {
      return "";
    }
  };

  renderContent = () => {
    const { curInfo, visible, listSize } = this.state;
    const { voucherConfig } = this.state.curInfo;
    var parties = curInfo.parties ? curInfo.parties : [];
    var merchants = [];
    parties.forEach(p => {
      if (p.type === "MERCHANT")
        merchants.push(p);
    });
    return (
      <Drawer
        className="camDetail"
        width={480}
        title="活动详情"
        onClose={this.onClose}
        visible={visible}
      >
        <Collapse defaultActiveKey={['1']}>
          <Panel header="基本信息" key="1">
            {this._renderInfoPanel(curInfo)}
          </Panel>
          <Panel header="详细设置" key="2">
          {/* 优惠券名称 类型 代金券 折扣券 折扣比例 % 最高优惠金额 元 有效期
          固定有效时间 2020-05-22 → 2020-05-23 相对有效时间 发放/领取后 天有效
          发行方式 一码一券 发行数量 1 是否自动增发 */}
            {this._renderConfigPanel(voucherConfig)}
          </Panel>
          <Panel header="参与商户" key="3">
            <Table
              bordered
              size="small"
              className="tableFont"
              columns={this.columns}
              dataSource={merchants}
              pagination={{
                pageSize: listSize,
                total: merchants.length,
              }}
            />
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
