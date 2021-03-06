import React, { Component } from "react";
import { Button, Table, PageHeader, Tag, Pagination, notification } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import FileSaver from "file-saver";

import "@css/common.less";
import comEvents from "@utils/comEvents";
import { reqGetRedemptions, reqExportRedemption } from "@api";
import { redemptionStatuses, settlementStatuses } from "@utils/constants";
import { QueryForm } from "./components";
import { ValueOffText } from "@components";

const columns = [
  {
    title: "券号",
    dataIndex: "voucher",
    key: "voucher",
    fixed: "left",
    width: 160,
  },
  {
    title: "活动名",
    dataIndex: "campaignName",
    key: "campaignName",
    responsive: ["lg"],
    ellipsis: true,
  },
  {
    title: "发行机构",
    dataIndex: "issuerName",
    key: "issuerName",
    responsive: ["md"],
    ellipsis: true,
  },
  {
    title: "订单号",
    dataIndex: "orderId",
    key: "orderId",
    responsive: ["lg"],
  },
  {
    title: "优惠金额",
    dataIndex: "discountOff",
    key: "discountOff",
    width: 100,
    render: (text, record) => (
      <ValueOffText
        type={record.voucherType}
        discountType={"AMOUNT"}
        text={text}
      />
    ),
  },
  {
    title: "核销机构",
    dataIndex: "merchantName",
    key: "merchantName",
    responsive: ["md"],
    ellipsis: true,
  },
  {
    title: "核销时间",
    dataIndex: "updatedAt",
    key: "updatedAt",
    width: 180,
  },
  {
    title: "状态",
    width: 80,
    fixed: "right",
    render: (chooseItem) => {
      const { status, settlementStatus } = chooseItem;
      return (
        <>
          <Tag color={status === "SUCCESS" ? "green" : "red"}>
            {redemptionStatuses[status]}
          </Tag>
          {settlementStatus ? (
            <Tag color="blue">
              {settlementStatuses.map((item) => item[settlementStatus])}
            </Tag>
          ) : null}
        </>
      );
    },
  },
];

class Redemption extends Component {
  constructor(props) {
    super(props);
    this.state = {
      campaigns: [],
      currentPage: 1,
      size: 20,
      total: 0,
      loading: false,
      beginDate: comEvents.firstDayOfMonth(),
      endDate: null,
      downloading: false,
      role: "marketer",
      includingSubsidiaries: true,
    };
  }

  componentDidMount() {
    const params = { pageIndex: 1 };
    this.getRedemptions(params);
  }

  // 获取列表数据
  getRedemptions = async (elements) => {
    const {
      size,
      searchTxt,
      endDate,
      beginDate,
      includingSubsidiaries,
    } = this.state;
    const params = {
      page: elements.pageIndex - 1,
      size: size,
      searchTxt: elements.searchTxt || searchTxt,
      beginDate: elements.beginDate || beginDate,
      endDate: elements.endDate || endDate,
      includingSubsidiaries,
    };

    this.setState({ loading: true });
    const result = await reqGetRedemptions(params);
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
            discountOff = cont[i].exchangePrice;
            break;

          default:
            break;
        }
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
          discountOff,
          voucherType: cont[i].voucher.type,
          settlementStatus:
            cont[i].settlement && cont[i].settlement.status
              ? cont[i].settlement.status
              : null,
        });
      }
    }
    this.setState({
      campaigns: data,
      total:
        result && result.data && result.data.content
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
    const params = {
      pageIndex: 1,
      searchTxt: values.searchTxt,
    };
    this.getRedemptions(params);
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page }, () => {
      this.getRedemptions({ pageIndex: page });
    });
  };

  // 下属机构切换
  onIncluding = (e) => {
    this.setState(
      {
        page: 0,
        includingSubsidiaries: e.target.value,
        currentPage: 1,
      },
      () => {
        const params = { pageIndex: 1 };
        this.getRedemptions(params);
      }
    );
  };

  handleDownload = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { beginDate, endDate, searchTxt, includingSubsidiaries } = this.state;

    this.setState({ downloading: true });

    try {
      const params = {
        beginDate,
        endDate,
        searchTxt,
        includingSubsidiaries,
      };

      const filename = "redemptions.xlsx";

      reqExportRedemption(params)
        .then((response) => {
          FileSaver.saveAs(response.data, filename);
        })
        .catch(() => {
          notification.warning({
            message: "下载失败，请稍后再试",
          });
        });
    } catch (error) {}
    this.setState({ downloading: false });
  };

  render() {
    const {
      campaigns,
      size,
      currentPage,
      loading,
      role,
      includingSubsidiaries,
      total,
    } = this.state;
    return (
      <>
        <PageHeader
          title="核销记录"
          extra={[
            <Button
              key="download"
              type="primary"
              shape="circle"
              loading={this.state.downloading}
              icon={<DownloadOutlined />}
              onClick={(e) => this.handleDownload(e)}
            />,
          ]}
        />
        <QueryForm
          loading={loading}
          dateRange={[this.state.beginDate]}
          onLoading={this.enterLoading}
          onSubmit={this.submitQuery}
          onIncluding={this.onIncluding}
          role={role}
          includingSubsidiaries={includingSubsidiaries}
        />
        <Table
          rowKey="key"
          size="small"
          scroll={{ x: 2000 }}
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
            onChange={this.handlePageChange}
            total={total}
            showSizeChanger={false}
            size="small"
            showTotal={(val) => `总共 ${val} 条数据`}
            disabled={loading}
          />
        </div>
      </>
    );
  }
}

export default Redemption;
