import React, { Component } from "react";
import { reqGetStats } from "../../api";
import {
  PageHeader,
  Statistic,
  Card,
  Row,
  Col,
  DatePicker,
  Space,
  Badge,
} from "antd";
import {
  UserOutlined,
  UngroupOutlined,
  NodeIndexOutlined,
  GiftOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/zh-cn";
import { Loading } from "../../components";
import "./index.less";
import comEvents from "../../utils/comEvents";

const gridStyle = {
  width: "100%",
  textAlign: "center",
};

class Dashboard extends Component {
  state = {
    showLatest: false,
    latestStats: null,
    showSince: false,
    statsSince: null,
    inited: false,
    since: comEvents.firstDayOfMonth(),
  };

  componentDidMount() {
    this.initLatestStats();
    this.initStatsSince("2020-05-01");
    this.setState({
      inited: true,
    });
  }

  initLatestStats = async () => {
    const res = await reqGetStats([
      "EMP_CUSTOMERS",
      "ORG_CUSTOMERS",
      "CAMPAIGNS",
      "ORG_CAMPAIGNS",
      "TRANSFERABLE_COUPONS",
      "ORG_TRANSFERABLE_COUPONS",
      "DISTRIBUTABLE_COUPONS",
      "ORG_DISTRIBUTABLE_COUPONS",
    ]);
    const stats = res && res.data ? res.data.content : {};
    this.setState({
      showLatest: true,
      latestStats: stats,
    });
  };

  onChangeSince = (date, dateString) => {
    this.initStatsSince(dateString);
    this.setState({
      since: dateString,
    });
  };

  initStatsSince = async (since) => {
    const res = await reqGetStats(
      ["DISTRIBUTIONS", "ORG_DISTRIBUTIONS", "ORG_REDEEMED", "ORG_REDEMPTIONS"],
      since
    );
    const stats = res && res.data ? res.data.content : {};
    this.setState({
      showSince: true,
      statsSince: stats,
    });
  };

  render() {
    return (
      <div style={{ height: "100%" }} className="dashborad">
        <PageHeader
          className="site-page-header-responsive cont"
          title="仪表仓"
        />
        <StatsPanel1 stats={this.state.latestStats} />
        <StatsPanel2
          stats={this.state.statsSince}
          since={this.state.since}
          onChange={this.onChangeSince}
        />
      </div>
    );
  }
}

const StatsPanel1 = (props) => {
  const stats = props.stats;
  return stats ? (
    <div>
      <Card>
        <Row gutter={{ xs: 8, sm: 16, md: 16, lg: 16 }}>
          <Col xs={24} sm={24} md={24} lg={6} xl={6}>
            <Card.Grid style={gridStyle}>
              <Statistic
                title="客户"
                value={stats["EMP_CUSTOMERS"]}
                suffix={"/" + stats["ORG_CUSTOMERS"]}
                prefix={<UserOutlined className="dashborad-icon" />}
              />
            </Card.Grid>
          </Col>
          <Col xs={24} sm={24} md={24} lg={6} xl={6}>
            <Card.Grid style={gridStyle}>
              <Statistic
                title="参与活动"
                value={stats.CAMPAIGNS}
                suffix={"/" + stats.ORG_CAMPAIGNS}
                prefix={<GiftOutlined className="dashborad-icon" />}
              />
            </Card.Grid>
          </Col>
          <Col xs={24} sm={24} md={24} lg={6} xl={6}>
            <Card.Grid style={gridStyle}>
              <Statistic
                title="可配券"
                value={stats.TRANSFERABLE_COUPONS}
                suffix={"/" + stats.ORG_TRANSFERABLE_COUPONS}
                prefix={<NodeIndexOutlined className="dashborad-icon" />}
              />
            </Card.Grid>
          </Col>
          <Col xs={24} sm={24} md={24} lg={6} xl={6}>
            <Card.Grid style={gridStyle}>
              <Statistic
                title="可发券"
                value={stats.DISTRIBUTABLE_COUPONS}
                suffix={"/" + stats.ORG_DISTRIBUTABLE_COUPONS}
                prefix={<UngroupOutlined className="dashborad-icon" />}
              />
            </Card.Grid>
          </Col>
        </Row>
      </Card>
    </div>
  ) : (
    <Loading />
  );
};

const StatsPanel2 = (props) => {
  const stats = props.stats;
  return stats ? (
    <div className="dashboard-statistic-card">
      <div className="since-date">
        <Space>
          <div>
            <CarryOutOutlined />
            开始时间:{" "}
          </div>
          <DatePicker
            placeholder="开始时间"
            allowClear={false}
            defaultValue={moment(props.since, "YYYY-MM-DD")}
            onChange={props.onChange}
          />
        </Space>
      </div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Card bodyStyle={{ textAlign: "center" }}>
            <Statistic
              title="已发放"
              value={stats["DISTRIBUTIONS"]}
              suffix={"/" + stats["ORG_DISTRIBUTIONS"]}
              prefix={<Badge color="orange" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Card bodyStyle={{ textAlign: "center" }}>
            <Statistic
              title="已核销"
              value={stats["ORG_REDEEMED"]}
              prefix={<Badge color="geekblue" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Card bodyStyle={{ textAlign: "center" }}>
            <Statistic
              title="核销"
              value={stats["ORG_REDEMPTIONS"]}
              prefix={<Badge color="green" />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  ) : (
    <Loading />
  );
};
export default Dashboard;
