import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Tag,
  Pagination,
  notification,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import FileSaver from 'file-saver';
import NumberFormat from 'react-number-format';

import QueryForm from './queryForm';
import storageUtils from "../../utils/storageUtils";
import comEvents from "../../utils/comEvents";

import { reqGetRedemptions, reqExportRedemption } from "../../api";
import { Loading } from "../../components";

import { redemptionStatuses, settlementStatuses } from "../../utils/constants";
import "../../css/common.less";

class Redemption extends Component {
  state = {
    inited: false,
    campaigns: [],
    ownerId: storageUtils.getUser().id,
    hasChoose: false,
    currentPage: 1,
    size: 20,
    total: 0,
    visible: false,
    /*搜索框 */
    loading: false,
    beginDate: comEvents.firstDayOfMonth(),
    endDate: null,
    downloading: false,
    role: "marketer",
  };
  componentDidMount() {
    this.initColumns();
    this.getRedemptions(1,this.state.searchTxt,this.state.beginDate,this.state.endDate);
  }
  initColumns() {
    //显示券号，活动，发券机构，核销机构，核销时间，核销状态以及结算状态
    this.marketColumns = [
      {
        title: "券号",
        dataIndex: "voucher",
        key: "voucher",
        width: 160,
      },
      {
        title: "营销活动",
        dataIndex: "campaignName",
        key: "campaignName",
        responsive: ['lg'],
        ellipsis: true,
      },
      {
        title: "订单号",
        dataIndex: "orderId",
        key: "orderId",
        responsive: ['lg'],
      },
      {
        title: "核销机构",
        dataIndex: "merchantName",
        key: "merchantName",
        responsive: ['md'],
        ellipsis: true,
      },
      {
        title: "优惠金额",
        dataIndex: "discountOff",
        key: "discountOff",
        width: 80,
        render: (value, row, index) => {
            return value? (
              <div style={{textAlign: "right"}}>
                <NumberFormat value={value/100} displayType={'text'} 
                thousandSeparator={true} decimalScale={2} fixedDecimalScale={true} prefix={'¥'}/></div>
                ):null
        },
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
        render: (chooseItem) => {
          const { status, settlementStatus } = chooseItem;
          return (
            <div>
              <Tag color="green" key={status}>
                {redemptionStatuses.map((item, index) => (
                  <span key={index}>{item[status]}</span>
                ))}
              </Tag>
              {settlementStatus ? 
                <Tag color="blue" key={settlementStatus}>
                  {settlementStatuses.map((item, index) => (
                    <span key={index}>{item[settlementStatus]}</span>
                  ))}
                </Tag>
                : null 
              }
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
        width: 160,
      },
      {
        title: "营销活动",
        dataIndex: "campaignName",
        key: "campaignName",
        responsive: ['lg'],
        ellipsis: true,
      },
      {
        title: "订单号",
        dataIndex: "orderId",
        key: "orderId",
        responsive: ['lg'],
      },
      {
        title: "发行机构",
        dataIndex: "issuerName",
        key: "issuerName",
        responsive: ['md'],
        ellipsis: true,
      },
      {
        title: "优惠金额",
        dataIndex: "discountOff",
        key: "discountOff",
        width: 80,
        render: (value, row, index) => {
          return value? (
            <div style={{textAlign: "right"}}>
              <NumberFormat value={value/100} displayType={'text'} 
                thousandSeparator={true} decimalScale={2} fixedDecimalScale={true} prefix={'¥'}/></div>
            ):null
        },
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
              {settlementStatus ?
              <Tag color="blue" key={settlementStatus}>
                {settlementStatuses.map((item, index) => (
                  item[settlementStatus]
                ))}
              </Tag> : null }
            </div>
          );
        },
      },
    ];
  }

  /*
获取列表数据
*/
  getRedemptions = async (currentPage, searchTxt, beginDate, endDate) => {
    //owner Li:显示要有两个选择：营销机构，核销机构   前者传入issuerid，后者传入merchant id
    let roleStr = this.state.role;
    let parmas =
      roleStr === "marketer"
        ? {
            page: currentPage-1,
            size: this.state.size,
            issuerId: storageUtils.getUser().orgId,
            beginDate: beginDate? beginDate: this.state.beginDate,
            endDate: endDate? endDate: this.state.endDate,
            searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
          }
        : {
            page: currentPage - 1,
            size: this.state.size,
            merchantId: storageUtils.getUser().orgId,
            beginDate: beginDate?beginDate:this.state.beginDate,
            endDate: endDate? endDate: this.state.endDate,
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
          discountOff: cont[i].discountOff,
          settlementStatus:
            cont[i].settlement && cont[i].settlement.status
              ? cont[i].settlement.status
              : null,
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

  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };

  submitQuery = (values) => {
    this.setState({
      currentPage: 1,
      searchTxt: values.searchTxt,
      beginDate: values['dateRange'][0].format("YYYY-MM-DD"),
      endDate: values['dateRange'][1].format("YYYY-MM-DD"),
    });
    this.getRedemptions(1, values.searchTxt, this.state.beginDate,this.state.endDate);
  };

  handlePageChange = (page) => {
    this.setState({
      currentPage: page,
    }, ()=>{
      this.getRedemptions(page);
    });
  };

  /*radio 切换*/
  onSwitchRole = (e) => {
    //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    this.setState({
      page: 0,
      role: e.target.value,
      currentPage: 1,
    },()=>{
      this.getRedemptions(1, null, this.state.beginDate, this.state.endDate);  
    });
  };

  handleDownload = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      downloading: true
    });
    let params = this.state.role === "marketer" ? {
      issuerId: storageUtils.getUser().orgId,
      beginDate: this.state.beginDate,
      endDate: this.state.endDate,
      searchTxt: this.state.searchTxt,
    } : {
      merchantId: storageUtils.getUser().orgId,
      beginDate: this.state.beginDate,
      endDate: this.state.endDate,
      searchTxt: this.state.searchTxt,
    };
    const filename = 'redemption.xlsx';
    reqExportRedemption(params).then(
      response => {
        FileSaver.saveAs(response.data, filename);
        this.setState({
          downloading: false
        });
      }
    ).catch((e)=>{
      this.setState({
        downloading: false
      });
      notification.warning({
        message: "下载失败，请稍后再试",
      });
    });
  }

  renderContent = () => {
    const { campaigns, size, total, currentPage,chooseRadio, loading } = this.state;
    let columns = chooseRadio==='owner'?this.marketColumns:this.columns;
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="核销记录"
          extra={[
            <Button type="primary" 
              shape="circle"
              loading={this.state.downloading}
              icon={<DownloadOutlined />} 
              onClick = {
                (e) => this.handleDownload(e)
              } 
            />
          ]}
        />
        <QueryForm 
          loading={loading}
          dateRange={[this.state.beginDate]}
          onLoading={this.enterLoading}
          onSwitchRole={this.onSwitchRole}
          onSubmit={this.submitQuery}
        />
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
            onChange={this.handlePageChange}
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
