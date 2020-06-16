import React, { Component } from "react";
import { Table, PageHeader, Divider, Pagination } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusSquareFilled,
} from "@ant-design/icons";
import { reqGetCustomers } from "../../api";
import "../../css/common.less";
import { Loading, SearchForm } from "../../components";
import storageUtils from "../../utils/storageUtils";
import CustomerView from "./customerView";

const renderTableObj = (value, row, index) => {
  const obj = {
    children: value.name,
    props: {},
  };
  return obj;
};

class Customer extends Component {
  state = {
    currentPage: 1,
    size: 20,
    searchTxt: null,
    inited: false,
    restricted: true,
    loading: false,
    showDetail: false,
    selectedCustomer: null,
  };
  componentDidMount() {
    this.getCustomerList(1);
    this.initColumns();
  }
  initColumns = () => {
    this.columns = [
      {
        title: "员工名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "员工电话",
        dataIndex: "cellphone",
        key: "cellphone",
      },
      {
        title: "客户经理",
        key: "employee",
        dataIndex: "employee",
        render: renderTableObj,
      },
      {
        title: "员工所在机构",
        key: "organization",
        dataIndex: "organization",
        render: renderTableObj,
      },
      {
        title: "操作",
        key: "action",
        width: 120,
        render: (chooseItem) => (
          <div size="middle">
            <b
              onClick={() => {
                //this.showDetailDrawer(chooseItem);
              }}
              className="ant-green-link cursor"
            >
              <EyeOutlined title="查看" />
            </b>
            <Divider type="vertical" />
            <b
              onClick={() => {
              }}
              className="ant-blue-link cursor"
            >
              <EditOutlined title="修改" />
            </b>
            <Divider type="vertical" />
            <b
              onClick={() => {
              }}
              className="ant-pink-link cursor"
            >
              <DeleteOutlined title="删除" />
            </b>
          </div>
        ),
      },
    ];
  };
  refresh = (searchTxt, restricted) => {
    this.setState({
      currentPage: 1,
      restricted: restricted,
    });
    this.getCustomerList(1, searchTxt, restricted);
  };
  getCustomerList = async (currentPage, searchTxt, restricted) => {
    const { size } = this.state;
    let orgUid = storageUtils.getUser().orgUid;
    let params = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: size,
      orgUid: orgUid,
      searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
      restricted: restricted,
    };
    let result = await reqGetCustomers(params);
    const cont =
      result && result.data && result.data.content ? result.data.content : [];
    this.data = cont.content;
    this.totalPages = cont ? cont.totalElements : 1;
    this.setState({
      loading: false,
      inited: true,
    });
  };
  searchValue = (searchTxt, restricted) => {
    this.setState({
      currentPage: 1,
      loading: true,
    });
    this.getCustomerList(1, searchTxt, restricted);
  };
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getCustomerList(page, this.state.searchTxt, this.state.restricted);
  };
 
 
  renderContent = () => {
    //搜索栏要展示的字段
    const text = [
      { name: "我的客户", value: true },
      { name: "机构客户", value: false },
    ];
    let { size, currentPage, showDetail, selectedCustomer } = this.state;
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="我的客户"
          extra={[
            <PlusSquareFilled
              key="add"
              className="setIcon"
              onClick={this.addItem}
            />,
          ]}
        ></PageHeader>
        {/* --搜索栏-- */}
        <SearchForm
          searchTxt={this.state.searchTxt}
          loading={this.state.loading}
          searchValue={this.searchValue}
          defaultValue={true} //true->默认选中我的客户
          texts={text}
          placeholder="请输入客户名称或手机号码查收"
          refresh={this.refresh}
        />
        <Table
          rowKey="uid"
          columns={this.columns}
          dataSource={this.data}
          bordered
          size="small"
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

        
      </div>
    );
  };
  render() {
    const { inited } = this.state;
    return <div>{inited ? this.renderContent() : <Loading />}</div>;
  }
}

export default Customer;
