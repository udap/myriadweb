import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Card,
  Descriptions,
  Divider,
  Input,
  Row,
  Col,
} from "antd";
import { RollbackOutlined } from "@ant-design/icons";

import storageUtils from "../../utils/storageUtils";
import { reqGetCampaignById } from "../../api";
import { Loading } from "../../components";
import JoinOrg from "./joinOrg";
import "./index.less";

const { Meta } = Card;
const { TextArea } = Input;
const style = {
  fontSize: "26px",
  color: "#1890ff",
  marginLeft: "10px",
};
const columns = [
  {
    title: "商户名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "商户电话",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "商户地址",
    dataIndex: "address",
    key: "address",
  },
];

class MarketDetail extends Component {
  state = {
    inited: false,
    curInfo: {},
  };
  componentDidMount() {
    console.log("this.props", this.props);
    let id = this.props.match.params.id;
    this.setState({
      inited: true,
      current: 2,
      //curInfo: Product[id],
    });
    this.reqGetCampaignById(id);
  }
  //获取活动详情
  reqGetCampaignById = async (id) => {
    let curInfo = await reqGetCampaignById(id);
    let cont = curInfo && curInfo.data ? curInfo.data : [];
    console.log("FormDialog -> getEmployee -> cont", cont);
    this.setState({
      inited: true,
      curInfo: cont,
    });
  };
  backIndex = () => {
    this.props.history.push("/admin/market");
  };
  renderContent = () => {
    const { curInfo } = this.state;
    //const { curInfo, basicInfo } = this.state.curInfo;
    console.log("MarketDetail -> renderContent -> curInfo", curInfo);
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive"
          title="活动详情"
          extra={[
            <RollbackOutlined style={style} className="backIcon" onClick={this.backIndex} />,
          ]}
        ></PageHeader>
        <Card bordered={false} className="detail">
          <Descriptions
            title="活动类型"
            style={{ marginBottom: 32 }}
            layout="vertical"
            bordered
          >
            <Descriptions.Item label="活动类型">优惠券活动</Descriptions.Item>
          </Descriptions>
          <Descriptions
            title="基本信息"
            layout="vertical"
            bordered
            column={2}
            style={{ marginBottom: 32 }}
          >
            <Descriptions.Item label="活动名称">
              {curInfo.name}
            </Descriptions.Item>
            <Descriptions.Item label="活动类别">
              {curInfo.category}
            </Descriptions.Item>

            <Descriptions.Item label="活动开始时间">
              {curInfo.effective}
            </Descriptions.Item>
            <Descriptions.Item label="活动结束时间">
              {curInfo.expiry}
            </Descriptions.Item>
            <Descriptions.Item label="活动主页" span={2}>
              {curInfo.url ? curInfo.url : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="活动描述">
              <TextArea placeholder={curInfo.description} rows={4} disabled />
            </Descriptions.Item>
          </Descriptions>
          <Divider style={{ marginBottom: 32 }} />
          <Descriptions title="详情配置"></Descriptions>
          <Row gutter={16}>
            <Col span={16}>
              <Descriptions
                bordered
                layout="vertical"
                // column={{ xs: 1, sm: 1, md: 1, lg: 1 }}
              >
                <Descriptions.Item label="优惠券名称">
                  {curInfo.name}
                </Descriptions.Item>

                <Descriptions.Item label="折扣类型">
                  {curInfo.type}
                </Descriptions.Item>
                <Descriptions.Item label="折扣数量">
                  {curInfo.issuedAmount}
                </Descriptions.Item>
                <Descriptions.Item label="发行数量">
                  {curInfo.amount}
                </Descriptions.Item>
                <Descriptions.Item label="是否允许增发">
                  {curInfo.restricted ? "是" : "否"}
                </Descriptions.Item>
                <Descriptions.Item label="允许兑换次数">
                  {curInfo.amount}
                </Descriptions.Item>
                <Descriptions.Item label="备注">
                  <TextArea placeholder={curInfo.desc} rows={4} disabled />
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={7}>
              <Card bordered={true} className="cardImg">
                <img alt="example" src={curInfo.coverImg} />
              </Card>
            </Col>
          </Row>
          <Divider style={{ marginBottom: 32 }} />
          <Descriptions title="参与机构"></Descriptions>
          <div className="site-card-wrapper">
            <JoinOrg uid={curInfo.uid} />
          </div>
        </Card>
      </div>
    );
  };
  render() {
    return (
      <div>
        <div style={{ height: "100%" }}>
          {this.state.inited ? this.renderContent() : <Loading />}
        </div>
      </div>
    );
  }
}

export default MarketDetail;
