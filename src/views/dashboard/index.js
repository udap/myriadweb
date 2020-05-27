import React, { Component } from "react";
import storageUtils from "../../utils/storageUtils";
import { reqGetStats } from "../../api";
import { PageHeader, Statistic, Card, Row, Col, Modal, Space } from "antd";
import { ExclamationCircleOutlined, SmileOutlined, ReloadOutlined } from "@ant-design/icons";
import { LinkBtn } from "../../components";
import { Loading } from "../../components";
import "./index.less";
const { confirm } = Modal;

const gridStyle = {
  width: '25%',
  textAlign: 'center',
};

class Dashboard extends Component {
  state = {
    showLatest: false,
    latestStats: null,
    showSince: false,
    statsSince: null,
    inited: false,
  };

  componentDidMount() {
    this.initLatestStats();
    this.initStatsSince("2020-05-01");
    this.setState({
      inited: true,
    });
  };

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

  initStatsSince = async (since) => {
    const res = await reqGetStats([
      "DISTRIBUTIONS",
      "ORG_DISTRIBUTIONS",
      "ORG_REDEEMED",
      "ORG_REDEMPTIONS",
    ], since);
    const stats = res && res.data ? res.data.content : {};
    this.setState({
      showSince: true,
      statsSince: stats,
    });
  };

  render() {
    return (
      <div style={{ height: "100%" }}>
        <PageHeader
          className="site-page-header-responsive cont"
          title="仪表仓"
          extra={[
            <ReloadOutlined
              key="add"
              className="setIcon"
              onClick={() => this.initStatsSince("2020-05-01")}
            />,
          ]}
        >
        </PageHeader>
        <StatsPanel1 stats={this.state.latestStats} />
        <StatsPanel2 stats={this.state.statsSince} />
      </div>
    );
  }
}

const StatsPanel1 = (props) => {
  const stats = props.stats;
  return stats ? (
    <div>
    <Row gutter="16">
      <Col span="24">
        <Card>
          <Card.Grid style={gridStyle}>
            <Statistic title="客户"
              value={stats['EMP_CUSTOMERS']} 
              suffix={"/" + stats['ORG_CUSTOMERS']} />
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Statistic title="参与活动"
              value={stats.CAMPAIGNS}
              suffix={"/" + stats.ORG_CAMPAIGNS}/>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Statistic title="可配券"
              value={stats.TRANSFERABLE_COUPONS}
              suffix={"/" + stats.ORG_TRANSFERABLE_COUPONS}/>
          </Card.Grid>
          <Card.Grid style={gridStyle}>
            <Statistic title="可发券"
              value={stats.DISTRIBUTABLE_COUPONS}
              suffix={"/" + stats.ORG_DISTRIBUTABLE_COUPONS} />
          </Card.Grid>
        </Card>
      </Col>
    </Row>
    </div>
  ) : <Loading/>;
};

const StatsPanel2 = (props) => {
  const stats = props.stats;
  return stats ? (
    <div className="dashboard-statistic-card">
    <Row gutter="16">
      <Col span="8">
        <Card bodyStyle={{textAlign: 'center'}}>
          <Statistic title="已发放"
            value={stats['DISTRIBUTIONS']} 
            suffix={"/"+stats['ORG_DISTRIBUTIONS']}/>
        </Card>
      </Col>
      <Col span="8">
        <Card bodyStyle={{textAlign: 'center'}}>
          <Statistic title="已核销"
              value={stats["ORG_REDEEMED"]} 
          />
        </Card>
      </Col>
      <Col span="8">
        <Card bodyStyle={{textAlign: 'center'}}>
          <Statistic title="核销"
            value={stats["ORG_REDEMPTIONS"]} />            
        </Card>
      </Col>
    </Row>
    </div>
  ) : <Loading />;
}
export default Dashboard;
