import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Tag,
  Pagination,
  notification,
  Tooltip,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import FileSaver from "file-saver";

import "@css/common.less";
import storageUtils from "@utils/storageUtils";
import comEvents from "@utils/comEvents";
import { reqGetDistributions, reqExportDistributions } from "@api";
import { distributionStatuses } from "@utils/constants";
import { QueryFilter } from "./components";
import { ValueOffText } from "@components";

const { Column } = Table;

class Distribution extends Component {
  state = {
    campaigns: [],
    hasChoose: false,
    merchantCode: "",
    currentPage: 1,
    size: 20,
    total: 0,
    visible: false,
    searchTxt: "",
    beginDate: comEvents.firstDayOfMonth(),
    endDate: null,
    downloading: false,
    loading: false,
    type: "user",
  };

  componentDidMount() {
    this.initColumns();
    const params = {
      pageIndex: 1,
      searchTxt: "",
    };
    this.getDistributions(params);
  }

  initColumns() {
    this.columns = [
      {
        title: "券号",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "活动名",
        dataIndex: "campaignName",
        key: "campaignName",
        width: 280,
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
        width: 280,
      },
      {
        title: "客户",
        dataIndex: "customerName",
        key: "customerName",
        ellipsis: {
          showTitle: false,
        },
        render: (cusName) => (
          <Tooltip placement="topLeft" title={cusName}>
            {cusName}
          </Tooltip>
        ),
      },
      {
        title: "优惠金额",
        dataIndex: "discountOff",
        key: "discountOff",
        width: 100,
        render: (text, record) => (
          <ValueOffText
            type={record.voucherType}
            discountType={record.discountType}
            text={text}
          />
        ),
      },
      {
        title: "发放时间",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 180,
      },
      {
        title: "发放状态",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (text, record) => {
          return (
            <Tag color="green" key={record.code}>
              {distributionStatuses[text]}
            </Tag>
          );
        },
      },
    ];
  }

  // 获取列表数据
  getDistributions = async (elements) => {
    const { size, searchTxt, beginDate, endDate, type } = this.state;
    let params = {
      page: elements.pageIndex - 1,
      size,
      searchTxt: elements.searchTxt || searchTxt,
      beginDate: elements.beginDate || beginDate,
      endDate: elements.endDate || endDate,
      sort: "createdAt,desc",
    };
    switch (type) {
      case "user":
        params.ownerId = storageUtils.getUser().id;
        break;

      case "org":
        params.issuerId = storageUtils.getUser().orgId;
        break;

      default:
        break;
    }

    this.setState({ loading: true });
    const result = await reqGetDistributions(params);
    const cont =
      result && result.data && result.data.content
        ? result.data.content.entries
        : [];
    let data = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.length; i++) {
        let discountOff;
        switch (cont[i].voucher.type) {
          case "COUPON":
            discountOff = cont[i].discountOff;
            break;
          case "GIFT":
            discountOff = cont[i].product.exchangePrice;
            break;

          default:
            break;
        }

        data.push({
          key: i,
          id: cont[i].id,
          code: cont[i].voucher.code,
          campaignName: cont[i].campaign.name,
          orgName: cont[i].orgName,
          fromOwnerName: cont[i].fromOwnerName,
          customerName: cont[i].customerName,
          discountOff,
          discountType: cont[i].discountType,
          voucherType: cont[i].voucher.type,
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
      campaigns: data,
      total:
        result.data && result.data.content
          ? result.data.content.totalElements
          : 0,
      loading: false,
    });
  };

  enterLoading = () => {
    this.setState({ loading: true });
  };

  submitQuery = (values) => {
    this.setState({
      currentPage: 1,
      searchTxt: values.searchTxt,
      beginDate: values["dateRange"][0].format("YYYY-MM-DD"),
      endDate: values["dateRange"][1].format("YYYY-MM-DD"),
    });
    this.getDistributions({
      pageIndex: 1,
      searchTxt: values.searchTxt,
    });
  };

  onPageChange = (page) => {
    this.setState({ currentPage: page });
    this.getDistributions({ pageIndex: page });
  };

  // radio 切换
  onSwitchType = (e) => {
    // 提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    this.setState(
      {
        page: 0,
        type: e.target.value,
        currentPage: 1,
      },
      () => {
        this.getDistributions({ pageIndex: 1 });
      }
    );
  };

  handleDownload = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.setState({ downloading: true });
    try {
      const filename = "distributions.xlsx";
      let params = {
        beginDate: this.state.beginDate,
        endDate: this.state.endDate,
        searchTxt: this.state.searchTxt,
      };
      switch (this.state.type) {
        case "user":
          params.ownerId = storageUtils.getUser().id;
          break;

        case "org":
          params.issuerId = storageUtils.getUser().orgId;
          break;

        default:
          break;
      }

      reqExportDistributions(params)
        .then((response) => {
          FileSaver.saveAs(response.data, filename);
        })
        .catch(() => {
          notification.warning({ message: "下载失败，请稍后再试" });
        });
    } catch (error) {}
    this.setState({ downloading: false });
  };

  render() {
    const { campaigns, size, loading, currentPage, downloading } = this.state;
    return (
      <>
        <PageHeader
          title="发放记录"
          extra={[
            <Button
              key="download"
              type="primary"
              shape="circle"
              loading={downloading}
              icon={<DownloadOutlined />}
              onClick={(e) => this.handleDownload(e)}
            />,
          ]}
        />
        <QueryFilter
          loading={loading}
          dateRange={[this.state.beginDate]}
          onLoading={this.enterLoading}
          onSwitchType={this.onSwitchType}
          onSubmitQuery={this.submitQuery}
        />
        <Table
          rowKey={(record) => record.code}
          size="small"
          bordered
          dataSource={campaigns}
          pagination={false}
          loading={loading}
        >
          <Column title="券号" dataIndex="code" key="code" />
          <Column
            title="活动名"
            dataIndex="campaignName"
            key="campaignName"
            width={280}
          />
          <Column
            title="发放人"
            dataIndex="fromOwnerName"
            key="fromOwnerName"
            width={280}
          />
          <Column
            title="发放机构"
            dataIndex="orgName"
            key="orgName"
            width={280}
          />
          <Column
            title="客户"
            dataIndex="customerName"
            key="customerName"
            render={(cusName) => (
              <Tooltip placement="topLeft" title={cusName}>
                {cusName}
              </Tooltip>
            )}
          />
          <Column
            title="优惠金额"
            dataIndex="discountOff"
            key="discountOff"
            width={100}
            render={(text, record) => (
              <ValueOffText
                type={record.voucherType}
                discountType={record.discountType}
                text={text}
              />
            )}
          />
          <Column
            title="发放时间"
            dataIndex="updatedAt"
            key="updatedAt"
            width={180}
          />
          <Column
            title="发放状态"
            dataIndex="status"
            key="status"
            width={100}
            render={(text, record) => (
              <Tag color="green" key={record.code}>
                {distributionStatuses[text]}
              </Tag>
            )}
          />
        </Table>
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
      </>
    );
  }
}

export default Distribution;
