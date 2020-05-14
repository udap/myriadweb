import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Tag,
  Radio,
  Form,
  Row,
  Col,
  Pagination,
} from "antd";
import storageUtils from "../../utils/storageUtils";
import { reqPermit, reqGetDistributions } from "../../api";
import { Loading } from "../../components";
import { distributionStatuses } from "../../utils/constants";
import "../../css/common.less";

class Distribution extends Component {
  state = {
    inited: false,
    campaigns: [],
    publisherId: storageUtils.getUser().orgId,
    ownerId: storageUtils.getUser().id,
    hasChoose: false,
    merchantCode: "",
    currentPage: 1,
    size: 20,
    total: 0,
    visible: false,
    /*搜索框 */
    searchTxt: "",
    loading: false,
    chooseRadio: "owner",
    hasAuthority: false,
  };
  componentDidMount() {
    this.initColumns();
    this.getList();
  }
  getList = async () => {
    const result = await reqPermit("VIEW_DISTRIBUTION");
    if (result) {
      this.getMarkets(null, 1);
      this.setState({
        hasAuthority: true,
      });
    } else {
      this.setState({
        inited: true,
        hasAuthority: false,
      });
    }
  };

  initColumns() {
    //券号	营销活动	客户	发放时间	状态
    this.columns = [
      {
        title: "券号",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "营销活动",
        dataIndex: "campaignName",
        key: "campaignName",
      },
      {
        title: "客户",
        dataIndex: "customerName",
        key: "customerName",
      },
      {
        title: "发放时间",
        dataIndex: "updatedAt",
        key: "updatedAt",
      },
      {
        title: "发放状态",
        dataIndex: "status",
        key: "status",
        render: (text) => {
          return (
            <Tag color="green" key={text}>
              {distributionStatuses.map((item, index) => (
                <span key={index}>{item[text]}</span>
              ))}
            </Tag>
          );
        },
      },
    ];
  }
  /*
获取列表数据
*/
  getMarkets = async (values, currentPage, size, chooseRadio) => {
    let typeStr = chooseRadio ? chooseRadio : this.state.chooseRadio;
    //owner 我的
    let parmas =
      typeStr === "owner"
        ? {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: size ? size : this.state.size,
            ownerId: this.state.ownerId,
            searchTxt: values ? values.merchantCode : "",
          }
        : {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: size ? size : this.state.size,
            issuerId: this.state.publisherId,
            searchTxt: values ? values.merchantCode : "",
          };

    const result = await reqGetDistributions(parmas);
    const cont =
      result && result.data && result.data.content
        ? result.data.content.entries
        : [];
    let data = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.length; i++) {
        data.push({
          key: i,
          id: cont[i].id,
          code: cont[i].voucher.code,
          campaignName: cont[i].campaign.name,
          customerName: cont[i].customerName,
          updatedAt: cont[i].updatedAt,
          channel: cont[i].channel,
          status: cont[i].status,
        });
      }
    }
    this.totalPages =
      result && result.data && result.data.content
        ? result.data.content.totalElements
        : 0;
    this.setState({
      inited: true,
      campaigns: data,
      total:
        result.data && result.data.content
          ? result.data.content.totalElements
          : 0,
      searchTxt: "",
      loading: false,
    });
    //parseInt((this.receipts.length - 1) / PAGE_SIZE) + 1;//
  };

  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  onFinish = (values) => {
    this.getMarkets(values, 1);
  };
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getMarkets(null, page);
  };

  /*radio 切换*/
  onRadioChange = (e) => {
    //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    this.setState({
      page: 0,
      chooseRadio: e.target.value,
      currentPage: 1,
    });
    this.getMarkets(null, 1, null, e.target.value);
  };

  renderContent = () => {
    const { campaigns, size, total, currentPage, hasAuthority } = this.state;

    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="发放记录"
        ></PageHeader>
        {hasAuthority ? (
          <Form
            onFinish={this.onFinish}
            layout="horizontal"
            name="advanced_search"
            className="ant-advanced-search-form"
            initialValues={{
              merchantCode: "",
              group: "owner",
            }}
          >
            <Row>
              <Col>
                <Form.Item name="group" label="查询条件">
                  <Radio.Group onChange={this.onRadioChange}>
                    <Radio value="owner">我的发放</Radio>
                    <Radio value="publisherId">机构发放</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item name="merchantCode">
                  <Input
                    placeholder="请输入活动名、标签、票券号进行搜索"
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item>
                  <Button
                    type="primary"
                    className="cursor searchBtn"
                    htmlType="submit"
                    loading={this.state.loading}
                    onClick={this.enterLoading}
                  >
                    搜索
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        ) : null}

        <Table
          tableLayout="auto"
          style={{ wordBreak: "break-all" }}
          size="small"
          bordered
          rowKey="_id"
          dataSource={campaigns}
          columns={this.columns}
          pagination={false}
        />
        <div className="pagination">
          <Pagination
            pageSize={size}
            current={currentPage}
            onChange={this.handleTableChange}
            total={this.totalPages}
            showSizeChanger={false}
            size="small"
            showTotal={(total) => `总共 ${total} 条数据`}
          />
        </div>
      </div>
    );
  };
  render() {
    return (
      <div style={{ height: "100%" }}>
        {this.state.inited ? this.renderContent() : <Loading />}
      </div>
    );
  }
}

export default Distribution;
