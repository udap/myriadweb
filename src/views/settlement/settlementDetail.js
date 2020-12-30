import React, { Component } from "react";
import {
  PageHeader,
  Tag,
  Button,
  Table,
  Pagination,
  Descriptions,
  notification,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import FileSaver from "file-saver";

import "./index.less";
import Loading from "@components/Loading";
import { reqGetSettlementDetail, reqDownloadSettlement } from "@api";
import {
  settlementStatuses,
  settlementTypes,
  redemptionStatuses,
} from "@utils/constants";
import "@css/common.less";

const columns = [
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
        <>
          <Tag color={status === "SUCCESS" ? "green" : "red"}>
            {redemptionStatuses[status]}
          </Tag>
          <Tag color="green" key={settlementStatus}>
            {settlementStatuses.map((item, index) => (
              <span key={index}>{item[settlementStatus]}</span>
            ))}
          </Tag>
        </>
      );
    },
  },
  // {
  //   title: "操作",
  //   render: (chooseItem) => {
  //     return (
  //       <b
  //         onClick={this.downloadSettlement}
  //         className="ant-green-link cursor"
  //       >
  //         下载
  //       </b>
  //     );
  //   },
  // },
];

class SettlementDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initd: false,
      listData: [],
      page: 1,
      size: 20,
      currentPage: 1,
      searchTxt: "",
      downloading: false,
      //上页信息
      item: props.location.state.chooseItem || {},
    };
  }

  componentDidMount() {
    this.getLists(null, 1);
  }

  //请求当前列表数据
  getLists = async (currentPage) => {
    let id = this.props.match.params.id;
    const params = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      searchTxt: this.state.searchTxt,
    };
    const result = await reqGetSettlementDetail(id, params);
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
      initd: true,
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
    let { listData, size, currentPage } = this.state;
    return (
      <div>
        <Table
          rowKey="uid"
          size="small"
          bordered
          dataSource={listData}
          columns={columns}
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

  handleDownload = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ downloading: true });
    let id = this.props.match.params.id;
    const filename = "settlement.xlsx";
    reqDownloadSettlement(id)
      .then((response) => {
        FileSaver.saveAs(response.data, filename);
        this.setState({ downloading: false });
      })
      .catch((e) => {
        this.setState({ downloading: false });
        notification.warning({ message: "下载失败，请稍后再试" });
      });
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
        <PageHeader
          className="site-page-header-responsive cont"
          title="结算详情"
          onBack={this.backIndex}
          extra={[
            <Button
              type="primary"
              shape="circle"
              loading={this.state.downloading}
              icon={<DownloadOutlined />}
              onClick={(e) => this.handleDownload(e)}
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
    const { initd } = this.state;
    return <>{initd ? this.renderDetail() : <Loading />}</>;
  }
}

export default SettlementDetail;
