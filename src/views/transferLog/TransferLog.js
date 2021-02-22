import React, { Component } from "react";
import { Table, PageHeader, Pagination } from "antd";
import NumberFormat from "react-number-format";

import "@css/common.less";
import storageUtils from "@utils/storageUtils";
import comEvents from "@utils/comEvents";
import { QueryFilter } from "./components";
import { reqGetTransferStats } from "@api";

const { Column } = Table;

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

class TransferStats extends Component {
  state = {
    stats: [],
    orgId: storageUtils.getUser().orgId,
    userId: storageUtils.getUser().id,
    currentPage: 1,
    size: 20,
    total: 0,
    visible: false,
    /*搜索框 */
    searchTxt: null,
    beginDate: comEvents.firstDayOfMonth(),
    endDate: null,
    loading: false,
    statsType: "user",
  };

  componentDidMount() {
    this.getStats();
  }

  // 获取列表数据
  getStats = async (values, currentPage, size) => {
    //owner 我的
    let params = {
      page: currentPage > 0 ? currentPage - 1 : this.state.currentPage - 1,
      size: size ? size : this.state.size,
      beginDate: values ? values.beginDate : this.state.beginDate,
      endDate: values ? values.endDate : this.state.endDate,
      keyword: values ? values.searchTxt : this.state.searchTxt,
    };
    this.setState({ loading: true });
    const result = await reqGetTransferStats(params);
    const cont =
      result && result.data && result.data.content
        ? result.data.content.entries
        : [];
    let stats = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.length; i++) {
        stats.push({
          key: i,
          campaignId: cont[i].campaign.id,
          campaignName: cont[i].campaign.name,
          csrName: cont[i].csr.name,
          csrCode: cont[i].csr.code,
          csrOrgName: cont[i].csr.org.name,
          csrOrgCode: cont[i].csr.org.code,
          amountIn: cont[i].amountIn,
          amountOut: cont[i].amountOut,
          netAmount: cont[i].netAmount,
        });
      }
    }
    this.totalPages =
      result && result.data && result.data.content
        ? result.data.content.totalElements
        : 0;
    this.setState({
      stats,
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
      searchTxt: values.searchTxt,
    });
    this.getStats(null, 1);
  };

  onPageChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getStats(null, page);
  };

  render() {
    const { stats, size, currentPage, loading } = this.state;

    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="配券记录"
        />
        <QueryFilter
          loading={loading}
          dateRange={[this.state.beginDate]}
          onLoading={this.enterLoading}
          onSubmit={this.submitQuery}
        />
        <Table
          rowKey="key"
          size="small"
          bordered
          dataSource={stats}
          pagination={false}
          loading={loading}
        >
          <Column
            title="活动名称"
            dataIndex="campaignName"
            key="campaignName"
          />
          <Column title="员工" dataIndex="csrName" key="csrName" />
          <Column title="员工号" dataIndex="csrCode" key="csrCode" />
          <Column title="所属机构" dataIndex="csrOrgName" key="csrOrgName" />
          <Column
            title="配出"
            dataIndex="amountOut"
            key="amountOut"
            render={renderAmount}
          />
          <Column
            title="配入"
            dataIndex="amountIn"
            key="amountIn"
            render={renderAmount}
          />
          <Column
            title="净配出"
            dataIndex="netAmount"
            key="netAmount"
            render={renderAmount}
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
      </div>
    );
  }
}

export default TransferStats;
