import React, { Component } from "react";
import { Table, PageHeader, notification, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import NumberFormat from "react-number-format";
import moment from "moment";
import FileSaver from "file-saver";

import storageUtils from "../../utils/storageUtils";
import comEvents from "../../utils/comEvents";
import {
  reqExportOrganizationSummaryReport,
  reqGetOrganizationSummaryReport,
  reqGetCampaignOrgs,
  reqGetRelatedL2Orgs,
  reqGetSubsidiaries,
} from "../../api";
import { Loading } from "../../components";
import "../../css/common.less";

import BranchForm from "./branchForm";

const renderAmount = (value) => {
  return (
    <div style={{ textAlign: "right" }}>
      <NumberFormat
        value={value}
        displayType={"text"}
        thousandSeparator={true}
      />
    </div>
  );
};
const renderPercent = (value) => {
  return (
    <div style={{ textAlign: "right" }}>
      <NumberFormat
        value={value * 100}
        decimalScale={2}
        displayType={"text"}
        suffix={"%"}
      />
    </div>
  );
};

class OrganizationReport extends Component {
  state = {
    inited: false,
    columns: [],
    stats: [],
    orgId: storageUtils.getUser().orgId,
    userId: storageUtils.getUser().id,
    currentPage: 1,
    pageSize: 20,
    total: 0,
    endDate: null,
    loading: false,
    downloading: false,
    summaryLevel: "L2",
    campaignOrgs: [],
    campaignOrgUid: storageUtils.getUser().orgUid,
    campaignName: "",
    campaignTag: "",
    branches: [],
    branchUid: "",
    subBranches: [],
    subBranchUid: "",
  };

  initFormData = async () => {
    const result = await reqGetCampaignOrgs();
    const campaignOrgs =
      result && result.data && result.data.content ? result.data.content : [];
    const result2 = await reqGetRelatedL2Orgs();
    const branches =
      result2 && result2.data && result2.data.content
        ? result2.data.content
        : [];
    this.setState({
      inited: true,
      campaignOrgs: campaignOrgs,
      branches: branches,
      stats: [],
      total:
        result.data && result.data.content
          ? result.data.content.totalElements
          : 0,
      loading: false,
    });
  };

  initSubBranches = async (branchUid) => {
    let subBranches = [];
    if (branchUid !== "") {
      const params = {
        page: 0,
        size: 1000,
        uid: branchUid,
      };
      const result = await reqGetSubsidiaries(branchUid, params);
      subBranches =
        result && result.data && result.data.content
          ? result.data.content.content
          : [];
    }
    this.setState({
      branchUid: branchUid,
      subBranches: subBranches,
      subBranchUid: "",
    });
  };

  componentDidMount() {
    this.initColumns("L2");
    this.initFormData();
  }
  initColumns(summaryLevel) {
    let tableCols = [];
    const fixedCols = [
      // {
      //   title: "资源数量",
      //   dataIndex: "netAmount",
      //   width: 100,
      //   render: renderAmount,
      // },
      // {
      //   title: "起始资源数",
      //   dataIndex: "beginAmount",
      //   width: 100,
      //   render: renderAmount,
      // },
      {
        title: "剩余资源数",
        dataIndex: "endAmount",
        width: 100,
        render: renderAmount,
      },
      {
        title: "发放数量",
        dataIndex: "distributedAmount",
        width: 100,
        render: renderAmount,
      },
      {
        title: "发放率",
        dataIndex: "distributionRate",
        width: 80,
        render: renderPercent,
      },
      {
        title: "兑换数量",
        dataIndex: "redeemedAmount",
        width: 100,
        render: renderAmount,
      },
      {
        title: "兑换率",
        dataIndex: "redemptionRate",
        width: 80,
        render: renderPercent,
      },
      {
        title: "失效数量",
        dataIndex: "expiredAmount",
        width: 100,
        render: renderAmount,
      },
      {
        title: "失效率",
        dataIndex: "expirationRate",
        width: 80,
        render: renderPercent,
      },
      {
        title: "客户总数",
        dataIndex: "totalCustomerAmount",
        width: 100,
        render: renderAmount,
      },
      {
        title: "发放客户数",
        dataIndex: "customerDistributionAmount",
        width: 100,
        render: renderAmount,
      },
      {
        title: "兑换客户数",
        dataIndex: "customerRedemptionAmount",
        width: 100,
        render: renderAmount,
      },
      {
        title: "发放覆盖率",
        dataIndex: "customerDistributionCoverage",
        width: 90,
        fixed: "right",
        render: renderPercent,
      },
      {
        title: "兑换覆盖率",
        dataIndex: "customerRedemptionCoverage",
        width: 90,
        fixed: "right",
        render: renderPercent,
      },
    ];
    if (summaryLevel === "L2") {
      const l2Cols = [
        {
          title: "分支机构",
          dataIndex: "orgName",
          width: 180,
          fixed: "left",
        },
        {
          title: "下属机构数量",
          dataIndex: "totalSites",
          width: 100,
        },
        {
          title: "参与机构数量",
          dataIndex: "sitesWithNetTransfer",
          width: 100,
        },
        {
          title: "参与发放机构数量",
          dataIndex: "sitesWithDistribution",
          width: 130,
          render: renderAmount,
        },
        {
          title: "机构活跃度",
          dataIndex: "activation",
          width: 90,
          render: renderPercent,
        },
      ];
      tableCols = tableCols.concat(l2Cols);
    } else {
      const l3Cols = [
        {
          title: "分支机构",
          dataIndex: "parentName",
          width: 180,
          fixed: "left",
        },
        {
          title: "参与机构",
          dataIndex: "orgName",
          width: 180,
          fixed: "left",
        },
        {
          title: "机构编号",
          dataIndex: "orgCode",
          width: 100,
        },
        {
          title: "参与活动员工数",
          dataIndex: "employeesWithNetTransfer",
          width: 120,
        },
        {
          title: "发放资源员工数",
          dataIndex: "employeesWithDistribution",
          width: 120,
          render: renderAmount,
        },
        {
          title: "员工活跃度",
          dataIndex: "employeeStickiness",
          width: 90,
          render: renderPercent,
        },
      ];
      tableCols = tableCols.concat(l3Cols);
    }
    tableCols = tableCols.concat(fixedCols);
    this.setState({ columns: tableCols });
  }
  /*
获取列表数据
*/
  getReport = async (values, currentPage, size) => {
    //owner 我的
    this.setState({ loading: true });
    let params = {
      page: currentPage ? currentPage - 1 : this.state.currentPage - 1,
      size: size ? size : this.state.pageSize,
      summaryLevel: values.summaryLevel,
      campaignOrgUid: values.campaignOrgUid,
      campaignName: values.campaignName,
      campaignTag: values.campaignTag,
      endDate: values.endDate.format("YYYY-MM-DD"),
      branchUid: values.branchUid,
      subBranchUid: values.subBranchUid,
    };
    const result = await reqGetOrganizationSummaryReport(params);
    const cont =
      result && result.data && result.data.content
        ? result.data.content.content
        : [];
    this.initColumns(values.summaryLevel);
    this.setState({
      inited: true,
      stats: cont,
      total:
        result.data && result.data.content
          ? result.data.content.totalElements
          : 0,
      loading: false,
    });
  };

  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  submitQuery = (values) => {
    this.setState({
      currentPage: 1,
      endDate: values.endDate.format("YYYY-MM-DD"),
      summaryLevel: values.summaryLevel,
      campaignOrgUid: values.campaignOrgUid,
      campaignName: values.campaignName,
      campaignTag: values.campaignTag,
      branchUid: values.branchUid,
      subBranchUid: values.subBranchUid,
    });
    this.getReport(values, 1);
  };
  onTableChange = (pagination) => {
    this.setState({
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
    });
    const {
      endDate,
      campaignOrgUid,
      campaignName,
      campaignTag,
      branchUid,
      subBranchUid,
      summaryLevel,
    } = this.state;
    const values = {
      endDate: moment(endDate, "YYYY-MM-DD"),
      campaignOrgUid: campaignOrgUid,
      campaignName: campaignName,
      campaignTag: campaignTag,
      branchUid: branchUid,
      subBranchUid: subBranchUid,
      summaryLevel: summaryLevel,
    };
    this.getReport(values, pagination.current, pagination.pageSize);
  };
  selectBranch = (branchUid) => {
    this.initSubBranches(branchUid);
  };
  selectSummaryLevel = (value) => {
    // this.initColumns(value);
  };
  handleDownload = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      downloading: true,
    });
    const {
      campaignOrgUid,
      campaignName,
      campaignTag,
      branchUid,
      subBranchUid,
      summaryLevel,
      endDate,
    } = this.state;
    let params = {
      campaignOrgUid,
      campaignName,
      campaignTag,
      endDate,
      branchUid,
      subBranchUid,
      summaryLevel,
    };
    const filename = "organizationReport_" + summaryLevel + ".xlsx";
    reqExportOrganizationSummaryReport(params)
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
  renderTable = () => {
    const {
      stats,
      pageSize,
      total,
      currentPage,
      loading,
      columns,
      campaignOrgs,
      campaignOrgUid,
      campaignName,
      campaignTag,
      branches,
      branchUid,
      subBranches,
      subBranchUid,
      endDate,
      summaryLevel,
    } = this.state;

    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="按机构统计"
          extra={[
            <Button
              type="primary"
              key="_b"
              shape="circle"
              loading={this.state.downloading}
              icon={<DownloadOutlined />}
              onClick={(e) => this.handleDownload(e)}
            />,
          ]}
        />
        <BranchForm
          loading={this.state.loading}
          initialData={{
            summaryLevel,
            campaignOrgs,
            campaignOrgUid,
            campaignName,
            campaignTag,
            branches,
            branchUid,
            subBranches,
            subBranchUid,
            endDate: endDate || new Date(),
          }}
          onSelectSummaryLevel={this.selectSummaryLevel}
          onSelectBranch={this.selectBranch}
          onLoading={this.enterLoading}
          onSubmit={this.submitQuery}
        />
        <Table
          rowKey="key"
          size="small"
          scroll={{ x: 2000 }}
          bordered
          dataSource={stats}
          columns={columns}
          loading={loading}
          onChange={this.onTableChange}
          pagination={{
            size: "small",
            pageSize: pageSize,
            current: currentPage,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `总共 ${total} 条数据`,
          }}
        />
      </div>
    );
  };
  render() {
    return (
      <div style={{ height: "100%" }}>
        {this.state.inited ? this.renderTable() : <Loading />}
      </div>
    );
  }
}

export default OrganizationReport;
