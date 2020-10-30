import React, { Component } from "react";
import { Button, Table, PageHeader, Tag, Pagination, notification } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import FileSaver from "file-saver";
import NumberFormat from "react-number-format";
import QueryForm from "./queryForm";

import storageUtils from "../../utils/storageUtils";
import comEvents from "../../utils/comEvents";

import { reqGetDistributions, reqExportDistributions } from "../../api";
import { Loading } from "../../components";
import { distributionStatuses } from "../../utils/constants";
import "../../css/common.less";

class Distribution extends Component {
  state = {
    inited: false,
    campaigns: [],
    hasChoose: false,
    merchantCode: "",
    currentPage: 1,
    size: 20,
    total: 0,
    visible: false,
    /*搜索框 */
    searchTxt: "",
    beginDate: comEvents.firstDayOfMonth(),
    endDate: null,
    downloading: false,
    loading: false,
    type: "user",
  };
  componentDidMount() {
    this.initColumns();
    this.getDistributions(
      1,
      this.state.searchTxt,
      this.state.beginDate,
      this.state.endDate
    );
  }
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
        responsive: ["lg"],
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
        title: "优惠金额",
        dataIndex: "discountOff",
        key: "discountOff",
        width: 80,
        render: (value, row, index) => {
          return value ? (
            <div style={{ textAlign: "right" }}>
              {row.discountType === "AMOUNT" ? (
                <NumberFormat
                  value={value / 100}
                  displayType={"text"}
                  thousandSeparator={true}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  prefix={"¥"}
                />
              ) : (
                <NumberFormat value={value} displayType={"text"} suffix={"%"} />
              )}
            </div>
          ) : null;
        },
      },
      {
        title: "发放时间",
        dataIndex: "updatedAt",
        key: "updatedAt",
        responsive: ["md"],
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

    this.orgColumns = [
      {
        title: "券号",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "营销活动",
        dataIndex: "campaignName",
        key: "campaignName",
        responsive: ["lg"],
      },
      {
        title: "发放人",
        dataIndex: "fromOwnerName",
        key: "fromOwnerName",
      },
      {
        title: "发放机构",
        dataIndex: "orgName",
        key: "orgName",
      },
      {
        title: "客户",
        dataIndex: "customerName",
        key: "customerName",
      },
      {
        title: "优惠金额",
        dataIndex: "discountOff",
        key: "discountOff",
        width: 80,
        render: (value, row, index) => {
          return value ? (
            <div style={{ textAlign: "right" }}>
              {row.discountType === "AMOUNT" ? (
                <NumberFormat
                  value={value / 100}
                  displayType={"text"}
                  thousandSeparator={true}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  prefix={"¥"}
                />
              ) : (
                <NumberFormat value={value} displayType={"text"} suffix={"%"} />
              )}
            </div>
          ) : null;
        },
      },
      {
        title: "发放时间",
        dataIndex: "updatedAt",
        key: "updatedAt",
        responsive: ["md"],
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
  //  getDistributions = async (values, currentPage, size, chooseRadio) => {
  getDistributions = async (currentPage, searchTxt, beginDate, endDate) => {
    //    let typeStr = chooseRadio ? chooseRadio : this.state.chooseRadio;
    let typeStr = this.state.type;
    //owner 我的
    let parmas =
      typeStr === "user"
        ? {
            page: currentPage - 1,
            size: this.state.size,
            ownerId: storageUtils.getUser().id,
            beginDate: beginDate ? beginDate : this.state.beginDate,
            endDate: endDate ? endDate : this.state.endDate,
            searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
            sort: "createdAt,desc",
          }
        : {
            page: currentPage - 1,
            size: this.state.size,
            issuerId: storageUtils.getUser().orgId,
            beginDate: beginDate ? beginDate : this.state.beginDate,
            endDate: endDate ? endDate : this.state.endDate,
            searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
            sort: "createdAt,desc",
          };
    this.setState({ loading: true });
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
          orgName: cont[i].orgName,
          fromOwnerName: cont[i].fromOwnerName,
          customerName: cont[i].customerName,
          discountOff: cont[i].discountOff,
          discountType: cont[i].discountType,
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
  submitQuery = (values) => {
    this.setState({
      currentPage: 1,
      searchTxt: values.searchTxt,
      beginDate: values["dateRange"][0].format("YYYY-MM-DD"),
      endDate: values["dateRange"][1].format("YYYY-MM-DD"),
    });
    this.getDistributions(
      1,
      values.searchTxt,
      this.state.beginDate,
      this.state.endDate
    );
  };
  onPageChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getDistributions(page);
  };

  /*radio 切换*/
  onSwitchType = (e) => {
    //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    this.setState(
      {
        page: 0,
        type: e.target.value,
        currentPage: 1,
      },
      () => {
        this.getDistributions(
          1,
          null,
          this.state.beginDate,
          this.state.endDate
        );
      }
    );
  };

  handleDownload = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      downloading: true,
    });
    let params =
      this.state.type === "user"
        ? {
            ownerId: storageUtils.getUser().id,
            beginDate: this.state.beginDate,
            endDate: this.state.endDate,
            searchTxt: this.state.searchTxt,
          }
        : {
            issuerId: storageUtils.getUser().orgId,
            beginDate: this.state.beginDate,
            endDate: this.state.endDate,
            searchTxt: this.state.searchTxt,
          };
    const filename = "distributions.xlsx";
    reqExportDistributions(params)
      .then((response) => {
        FileSaver.saveAs(response.data, filename);
        this.setState({
          downloading: false,
        });
      })
      .catch((e) => {
        this.setState({
          downloading: false,
        });
        notification.warning({
          message: "下载失败，请稍后再试",
        });
      });
  };

  renderContent = () => {
    const { campaigns, size, loading, currentPage, type } = this.state;
    let columns = type === "user" ? this.columns : this.orgColumns;
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="发放记录"
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
        <QueryForm
          loading={loading}
          dateRange={[this.state.beginDate]}
          onLoading={this.enterLoading}
          onSwitchType={this.onSwitchType}
          onSubmitQuery={this.submitQuery}
        />
        <Table
          rowKey="key"
          size="small"
          bordered
          dataSource={campaigns}
          columns={columns}
          pagination={false}
          loading={loading}
        />
        <div className="pagination">
          <Pagination
            pageSize={size}
            current={currentPage}
            onChange={this.onPageChange}
            total={this.totalPages}
            showSizeChanger={false}
            size="small"
            showTotal={(total) => `总共 ${total} 条数据`}
            disabled={loading}
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
