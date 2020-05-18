import React, { Component } from "react";
import {
  //表头
  PageHeader,
  Tag,
  //搜索栏
  // Form,
  // Input,
  // Row,
  // Col,
  // Button,
  //表格
  Table,
  Pagination,
  Descriptions,
} from "antd";
//import storageUtils from "../../utils/storageUtils";
import Loading from "../../components/Loading";
import { reqGetSettlementDetail } from "../../api";
import { DownloadOutlined } from "@ant-design/icons";

import {
  settlementStatuses,
  settlementTypes,
  redemptionStatuses,
} from "../../utils/constants";
import "../../css/common.less";
import "./index.less";

class SettlementDetail extends Component {
  state = {
    //表格数据
    inited: false,
    listData: [],
    //分页
    page: 1,
    size: 20,
    currentPage: 1,
    //搜索
    // searchTxt: "",
    // loading: false,
    //上页信息
    item: {},
  };
  componentDidMount() {
    let item = this.props.location.state.chooseItem;
    console.log("SettlementDetail -> componentDidMount -> item", item);
    this.setState({
      item: item,
    });
    this.initColumns();
    this.getLists(null, 1);
  }
  //初始化表头
  initColumns() {
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
      // {
      //   title: "发行机构",
      //   dataIndex: "issuerName",
      //   key: "issuerName",
      // },
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
      // {
      //   title:"操作",
      //   render:(chooseItem)=>{
      //     return (
      //           <b
      //           onClick={this.downloadSettlement}
      //           className="ant-green-link cursor"
      //           >
      //             下载
      //           </b>
      //     )
      //   }
      // }
    ];
  }
  //请求当前列表数据
  getLists = async (currentPage) => {
    let id = this.props.match.params.id;
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      searchTxt: this.state.searchTxt,
    };
    const result = await reqGetSettlementDetail(id, parmas);
    console.log("getLists -> result", result);
    const cont =
      result && result.data && result.data.content
        ? result.data.content.entries
        : [];
    this.totalPages =
      result && result.data && result.data.content
        ? result.data.content.totalElements
        : 1;
    let data = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.length; i++) {
        data.push({
          key: i,
          id: cont[i].id,
          name: cont[i].merchantName,
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
    this.setState({
      inited: true,
      listData: data,
      totalPages:
        result && result.data && result.data.content
          ? result.data.content.totalElements
          : 1,
      loading: false,
    });
  };
  //返回上一页
  backIndex = () => {
    this.props.history.push("/admin/settlement");
  };
  //查询
  // searchValue = (value) => {
  //   this.setState({
  //     searchTxt: value.searchTxt,
  //     currentPage: 1,
  //   });
  //   this.getLists(value.searchTxt, 1, this.state.value);
  // };
  //搜索加载
  // enterLoading = () => {
  //   this.setState({
  //     loading: true,
  //   });
  // };
  //分页切换
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getLists(null, page);
  };
  //表格数据
  renderTableList = () => {
    let {
      //表格数据
      listData,
      //分页
      size,
      currentPage,
    } = this.state;
    return (
      <div>
        {/* --搜索栏-- */}
        {/* <Form
          onFinish={this.searchValue}
          layout="horizontal"
          name="advanced_search"
          className="ant-advanced-search-form"
          initialValues={{
            searchTxt: "",
          }}
        >
          <Row>
            <Col span={9} label="查询条件">
              <Form.Item name="searchTxt">
                <Input
                  placeholder="请输入券号、活动名、活动标签、订单号进行搜索"
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
        </Form> */}
        {/* --搜索栏-- */}
        {/* 列表内容 */}
        <Table
          rowKey="uid"
          size="small"
          bordered
          dataSource={listData}
          columns={this.columns}
          pagination={false}
        />
        <div className="pagination">
          <Pagination
            pageSize={size}
            current={currentPage}
            onChange={this.handleTableChange}
            total={this.totalPages}
            showTotal={(total) => `总共 ${total} 条数据`}
            size="small"
            showSizeChanger={false}
          />
        </div>
        {/* 列表内容 */}
      </div>
    );
  };
  //明细
  renderDetail = () => {
    const {
      merchantName,
      marketerName,
      type,
      campaign,
      beginDate,
      endDate,
      amount,
      settlementDate,
      status,
    } = this.state.item;
    return (
      <div>
        {/* 页表头 */}
        <PageHeader
          className="site-page-header-responsive cont"
          title="结算详情"
          onBack={this.backIndex}
          extra={[
            <DownloadOutlined
              key="add"
              className="setIcon"
              //onClick={}
            />,
          ]}
        ></PageHeader>
        <Descriptions
          bordered
          column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
          size="small"
        >
          <Descriptions.Item label="营销机构">{marketerName}</Descriptions.Item>
          <Descriptions.Item label="核销机构">{merchantName}</Descriptions.Item>
          <Descriptions.Item label="结算类型">
            {settlementTypes.map((item, index) =>
              item.value === type ? <span key={index}>{item.name}</span> : null
            )}
          </Descriptions.Item>
          {campaign && campaign.name ? (
            <Descriptions.Item label="活动名称">
              {campaign.name}
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item label="交易周期">
            {beginDate}至{endDate}
          </Descriptions.Item>
          <Descriptions.Item label="票券数量">{amount}</Descriptions.Item>
          <Descriptions.Item label="结算时间">
            {settlementDate}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {settlementStatuses.map((item, index) => (
              <span key={index}>{item[status]}</span>
            ))}
          </Descriptions.Item>
        </Descriptions>
        {/* 核销记录列表 */}
        <Descriptions style={{ marginTop: 20 }} title="核销记录"></Descriptions>
        {this.renderTableList()}
      </div>
    );
  };
  render() {
    return (
      <div
        style={{
          height: "100%",
        }}
      >
        {this.state.inited ? this.renderDetail() : <Loading />}
      </div>
    );
  }
}

export default SettlementDetail;
