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
import { RollbackOutlined, PictureOutlined } from "@ant-design/icons";

import storageUtils from "../../utils/storageUtils";
import { reqGetCampaigns } from "../../api";
import { Loading } from "../../components";
import imgEmpty from "../../assets/images/default.png";
import "./index.less";

const { Meta } = Card;
const { TextArea } = Input;
const style = {
  fontSize: "26px",
  color: "#1890ff",
  marginLeft: "10px",
};
class MarketDetail extends Component {
  state = {
    inited: false,
    curInfo: {},
  };
  componentDidMount() {
    let id = this.props.match.params.id;
     this.setState({
       inited: true,
       current: 2,
      // curInfo: Product[id],
     });
    //this.getEmployee(id);
  }

  backIndex = () => {
    this.props.history.push("/admin/coupon");
  };
  renderContent = () => {
    const { curInfo } = this.state;
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive"
          title="活动详情"
          extra={[
            <RollbackOutlined className="backIcon" onClick={this.backIndex} />,
          ]}
        ></PageHeader>
        <Card bordered={false} className="detail">
          <Row gutter={16}>
            <Col span={16}>
              <Descriptions bordered layout="vertical">
                <Descriptions.Item label="券号" span={3}>
                  {curInfo.code}
                </Descriptions.Item>
                <Descriptions.Item label="优惠券名称">
                  {curInfo.name}
                </Descriptions.Item>
                <Descriptions.Item label="优惠券类型">
                  {curInfo.type}
                </Descriptions.Item>
                <Descriptions.Item label="有效期">
                  {curInfo.beginDate}至{curInfo.endDate}
                </Descriptions.Item>
                <Descriptions.Item label="拥有者">
                  {curInfo.owner}
                </Descriptions.Item>
                <Descriptions.Item label="折扣类型">
                  {curInfo.type}
                </Descriptions.Item>
                <Descriptions.Item label="折扣数量">
                  {curInfo.issuedAmount ? curInfo.issuedAmount : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="发行数量">
                  {curInfo.amount ? curInfo.amount : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="是否允许增发">
                  {curInfo.restricted ? "是" : "否"}
                </Descriptions.Item>
                <Descriptions.Item label="允许兑换次数">
                  {curInfo.amount ? curInfo.amount : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="备注" span={24}>
                  <TextArea placeholder={curInfo.desc} rows={4} disabled />
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={7}>
              <Card bordered={true} className="cardImg">
                <img
                  alt="详情图片"
                  src={
                    curInfo.pic
                      ? curInfo.pic
                      :`${imgEmpty}`
                  }
                />
              </Card>
            </Col>
          </Row>
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
