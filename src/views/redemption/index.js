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
import { reqGetRedemptions } from "../../api";
import { Loading } from "../../components";
import { redemptionStatuses, settlementStatuses } from "../../utils/constants";
import "../../css/common.less";

class Redemption extends Component {
  state = {
    inited: false,
    campaigns: [],
    publisherId: storageUtils.getUser().orgId,
    ownerId: storageUtils.getUser().id,
    hasChoose: false,
    merchantCode: "",
    codeType: "UPCODE",
    currentPage: 1,
    size: 20,
    total: 0,
    visible: false,
    /*搜索框 */
    loading: false,
    chooseRadio: "owner",
    /*是否有权限 */
    hasAuthority: false,
  };
  componentDidMount() {
    this.initColumns();
    this.getList();
  }
  getList = async () => {
      //有权限
      this.setState({
        hasAuthority: true,
      });
      this.getMarkets(null, 1);
  };
  initColumns() {
    //显示券号，活动，发券机构，核销机构，核销时间，核销状态以及结算状态
    this.marketColumns = [
      {
        title: "券号",
        dataIndex: "voucher",
        key: "voucher",
      },
      {
        title: "营销活动",
        dataIndex: "campaignName",
        key: "campaignName",
      },
      {
        title: "订单号",
        dataIndex: "orderId",
        key: "orderId",
      },
      {
        title: "核销机构",
        dataIndex: "merchantName",
        key: "merchantName",
      },
      {
        title: "核销时间",
        dataIndex: "updatedAt",
        key: "updatedAt",
      },
      {
        title: "状态",
        render: (chooseItem) => {
          const { status, settlementStatus } = chooseItem;
          return (
            <div>
              <Tag color="green" key={status}>
                {redemptionStatuses.map((item, index) => (
                  <span key={index}>{item[status]}</span>
                ))}
              </Tag>
              {settlementStatus !== "-" ? (
                <Tag color="green" key={settlementStatus}>
                  {settlementStatuses.map((item, index) => (
                    <span key={index}>{item[settlementStatus]}</span>
                  ))}
                </Tag>
              ) : (
                ""
              )}
            </div>
          );
        },
      },
    ];
    this.columns = [
      {
        title: "券号",
        dataIndex: "voucher",
        key: "voucher",
      },
      {
        title: "营销活动",
        dataIndex: "campaignName",
        key: "campaignName",
      },
      {
        title: "订单号",
        dataIndex: "orderId",
        key: "orderId",
      },
      {
        title: "发行机构",
        dataIndex: "issuerName",
        key: "issuerName",
      },
      {
        title: "核销时间",
        dataIndex: "updatedAt",
        key: "updatedAt",
      },
      {
        title: "状态",
        render: (chooseItem) => {
          const { status, settlementStatus } = chooseItem;
          //show settlementStatus 结算状态
          return (
            <div>
              <Tag color="green" key={status}>
                {redemptionStatuses.map((item, index) => (
                  <span key={index}>{item[status]}</span>
                ))}
              </Tag>
              <Tag color="green" key={settlementStatus}>
                {settlementStatuses.map((item, index) => (
                  <span key={index}>{item[settlementStatus]}</span>
                ))}
              </Tag>
            </div>
          );
        },
      },
    ];
  }

  /*
获取列表数据
*/
  getMarkets = async (values, currentPage, searchTxt, chooseRadio) => {
    //owner Li:显示要有两个选择：营销机构，核销机构   前者传入issuerid，后者传入merchant id
    let typeStr = chooseRadio ? chooseRadio : this.state.chooseRadio;
    let parmas =
      typeStr === "owner"
        ? {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: this.state.size,
            issuerId: this.state.publisherId,
            searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
          }
        : {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: this.state.size,
            merchantId: this.state.publisherId,
            searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
          };

    const result = await reqGetRedemptions(parmas);
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
          name: cont[i].merchantName,
          merchantName: cont[i].merchantName,
          issuerName: cont[i].voucher.issuerName,
          campaignName: cont[i].campaign.name,
          voucher: cont[i].voucher.code,
          status: cont[i].status,
          updatedAt: cont[i].updatedAt,
          orderId: cont[i].orderId,
          settlementStatus:
            cont[i].settlement && cont[i].settlement.status
              ? cont[i].settlement.status
              : "-",
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
        result && result.data && result.data.content
          ? result.data.content.totalElements
          : 0,
      loading: false,
    });
    //parseInt((this.receipts.length - 1) / PAGE_SIZE) + 1;//
  };

  handleChange = (value) => {
    this.setState({
      codeType: value,
    });
  };
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  onFinish = (values) => {
    this.setState({
      currentPage: 1,
      searchTxt: values.searchTxt,
    });
    this.getMarkets(null, 1, values.searchTxt);
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
    const { campaigns, size, total, currentPage, hasAuthority,chooseRadio } = this.state;
    let columns = chooseRadio==='owner'?this.marketColumns:this.columns;
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="核销记录"
        ></PageHeader>
        {hasAuthority ? (
          <Form
            onFinish={this.onFinish}
            layout="horizontal"
            name="advanced_search"
            className="ant-advanced-search-form"
            initialValues={{
              searchTxt: "",
              group: "owner",
            }}
          >
            <Row>
              <Col>
                <Form.Item name="group" label="查询条件">
                  <Radio.Group onChange={this.onRadioChange}>
                    <Radio value="owner">营销机构</Radio>
                    <Radio value="publisherId">核销机构</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="searchTxt">
                  <Input
                    placeholder="请输入券号、活动名、订单号进行搜索"
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
          rowKey="key"
          size="small"
          bordered
          dataSource={campaigns}
          columns={columns}
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

export default Redemption;
