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
import { reqGetDistributions } from "../../api";
import { Loading } from "../../components";
import { distributionStatuses } from "../../utils/constants";
import "../../css/common.less";
import QueryForm from "../campaign/queryForm";

class TransferListView extends Component {
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
      this.getMarkets(null, 1);
      this.setState({
        hasAuthority: true,
      });
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
        responsive: ['lg'],
      },
      {
        title: "发放人",
        dataIndex: "fromOwnerName",
        key: "fromOwnerName",
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
        responsive: ['md'],
      },
      {
        title: "发放状态",
        dataIndex: "status",
        key: "status",
        width: 100,
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
            searchTxt: values ? values : this.state.searchTxt,
          }
        : {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: size ? size : this.state.size,
            issuerId: this.state.publisherId,
            searchTxt: values ? values : this.state.searchTxt,
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
          fromOwnerName: cont[i].fromOwnerName,
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
    this.setState({
      currentPage: 1,
      searchTxt: values.searchTxt,
    });
    this.getMarkets(values.searchTxt, 1);
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
          <QueryForm loading={this.state.loading} 
            onChangeCategory={this.onRadioChange} 
            onLoad={this.enterLoading}
            onSubmit={this.onFinish} />
        ) : null}

        <Table
          rowKey="key"
          size="small"
          bordered
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

export default TransferListView;
