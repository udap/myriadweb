import React, { Component } from "react";
import { Table, PageHeader, notification, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import NumberFormat from "react-number-format";
import moment from "moment";
import FileSaver from "file-saver";

import storageUtils from "../../utils/storageUtils";
import comEvents from "../../utils/comEvents";
import {
  reqExportIndividualSummaryReport,
  reqGetIndividualSummaryReport,
  reqGetCampaignOrgs,
  reqGetRelatedL2Orgs,
  reqGetSubsidiaries,
  reqGetEmployees,
} from "../../api";
import { Loading } from "../../components";
import "../../css/common.less";

import QueryForm from "./queryForm";

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
const renderEmployee = (value) => {
  return value ? value : <div class="description">{"离职员工"}</div>;
};

class IndividualReport extends Component {
  state = {
    inited: false,
    stats: [],
    orgId: storageUtils.getUser().orgId,
    userId: storageUtils.getUser().id,
    currentPage: 1,
    pageSize: 20,
    total: 0,
    beginDate: comEvents.firstDayOfMonth(),
    endDate: null,
    loading: false,
    downloading: false,
    campaignOrgs: [],
    campaignOrgUid: storageUtils.getUser().orgUid,
    campaignName: "",
    campaignTag: "",
    branches: [],
    branchUid: "",
    subBranches: [],
    subBranchUid: "",
    employees: [],
    employeeUid: "",
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
      employees: [],
      employeeUid: "",
    });
  };

  initEmployees = async (subBranchUid) => {
    let employees = [];
    if (subBranchUid !== "") {
      const params = {
        page: 0,
        sort: ["org", "createTime,desc"],
        size: 1000,
        orgUid: subBranchUid,
      };
      const result = await reqGetEmployees(params);
      employees = result && result.data ? result.data.content.content : [];
    }
    this.setState({
      subBranchUid: subBranchUid,
      employees: employees,
      employeeUid: "",
    });
  };

  componentDidMount() {
    this.initColumns();
    this.initFormData();
  }
  initColumns() {
    this.columns = [
      {
        title: "客户经理",
        dataIndex: "employeeName",
        width: 100,
        fixed: "left",
        render: renderEmployee,
      },
      {
        title: "员工号",
        dataIndex: "employeeCode",
        width: 100,
        fixed: "left",
      },
      {
        title: "机构名称",
        dataIndex: "siteName",
        width: 200,
      },
      {
        title: "机构编号",
        dataIndex: "siteCode",
        width: 100,
      },
      {
        title: "上级机构",
        dataIndex: "parentName",
        width: 200,
      },
      // {
      //   title: "资源总数",
      //   dataIndex: "netAmount",
      //   width: 80,
      //   render: renderAmount,
      // },
      {
        title: "起始资源数",
        dataIndex: "beginAmount",
        width: 100,
        render: renderAmount,
      },
      {
        title: "截止资源数",
        dataIndex: "endAmount",
        width: 100,
        render: renderAmount,
      },
      {
        title: "发放数量",
        dataIndex: "distributedAmount",
        width: 80,
        render: renderAmount,
      },
      {
        title: "发放率",
        dataIndex: "distributionRate",
        width: 100,
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
        width: 100,
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
        width: 100,
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
        width: 100,
        fixed: "right",
        render: renderPercent,
      },
      {
        title: "兑换覆盖率",
        dataIndex: "customerRedemptionCoverage",
        width: 100,
        fixed: "right",
        render: renderPercent,
      },
    ];
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
      campaignOrgUid: values.campaignOrgUid,
      campaignName: values.campaignName,
      campaignTag: values.campaignTag,
      beginDate: values["dateRange"][0].format("YYYY-MM-DD"),
      endDate: values["dateRange"][1].format("YYYY-MM-DD"),
      branchUid: values.branchUid,
      subBranchUid: values.subBranchUid,
      employeeUid: values.employeeUid,
    };
    const result = await reqGetIndividualSummaryReport(params);
    const cont =
      result && result.data && result.data.content
        ? result.data.content.content
        : [];
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
      beginDate: values["dateRange"][0].format("YYYY-MM-DD"),
      endDate: values["dateRange"][1].format("YYYY-MM-DD"),
      campaignOrgUid: values.campaignOrgUid,
      campaignName: values.campaignName,
      campaignTag: values.campaignTag,
      branchUid: values.branchUid,
      subBranchUid: values.subBranchUid,
      employeeUid: values.employeeUid,
    });
    this.getReport(values, 1);
  };
  onTableChange = (pagination) => {
    this.setState({
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
    });
    const {
      beginDate,
      endDate,
      campaignOrgUid,
      campaignName,
      campaignTag,
      branchUid,
      subBranchUid,
      employeeUid,
    } = this.state;
    const values = {
      dateRange: [
        moment(beginDate, "YYYY-MM-DD"),
        moment(endDate, "YYYY-MM-DD"),
      ],
      campaignOrgUid: campaignOrgUid,
      campaignName: campaignName,
      campaignTag: campaignTag,
      branchUid: branchUid,
      subBranchUid: subBranchUid,
      employeeUid: employeeUid,
    };
    //    console.log("values",values);
    this.getReport(values, pagination.current, pagination.pageSize);
  };
  selectBranch = (branchUid) => {
    this.initSubBranches(branchUid);
  };
  selectSubBranch = (subBranchUid) => {
    this.initEmployees(subBranchUid);
  };
  handleDownload = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      downloading: true,
    });
    const filename = "individualReport.xlsx";
    const {
      campaignOrgUid,
      campaignName,
      campaignTag,
      branchUid,
      subBranchUid,
      employeeUid,
      beginDate,
      endDate,
    } = this.state;
    let params = {
      campaignOrgUid: campaignOrgUid,
      campaignName: campaignName,
      campaignTag: campaignTag,
      beginDate: beginDate,
      endDate: endDate,
      branchUid: branchUid,
      subBranchUid: subBranchUid,
      employeeUid: employeeUid,
    };
    reqExportIndividualSummaryReport(params)
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
        console.log(e);
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
      campaignOrgs,
      campaignOrgUid,
      campaignName,
      campaignTag,
      branches,
      branchUid,
      subBranches,
      subBranchUid,
      employees,
      employeeUid,
      beginDate,
      endDate,
    } = this.state;

    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="按个人统计"
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
        <QueryForm
          loading={this.state.loading}
          initialData={{
            campaignOrgs: campaignOrgs,
            campaignOrgUid: campaignOrgUid,
            campaignName: campaignName,
            campaignTag: campaignTag,
            branches: branches,
            branchUid: branchUid,
            subBranches: subBranches,
            subBranchUid: subBranchUid,
            employees: employees,
            employeeUid: employeeUid,
            dateRange: [beginDate, endDate],
          }}
          onSelectBranch={this.selectBranch}
          onSelectSubBranch={this.selectSubBranch}
          onLoading={this.enterLoading}
          onSubmit={this.submitQuery}
        />
        <Table
          rowKey="key"
          size="small"
          scroll={{ x: 2000 }}
          bordered
          dataSource={stats}
          columns={this.columns}
          loading={loading}
          onChange={this.onTableChange}
          pagination={{
            size: "small",
            pageSize: pageSize,
            current: currentPage,
            total: total,
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

export default IndividualReport;
