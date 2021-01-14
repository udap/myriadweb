import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import {
  Modal,
  Table,
  PageHeader,
  Divider,
  Pagination,
  notification,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusSquareFilled,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import {
  reqGetCustomers,
  reqDelCustomer,
  reqGetCustomer,
  reqPermit,
} from "@api";
import "@css/common.less";
import { Loading } from "@components";
import storageUtils from "@utils/storageUtils";
import { SearchForm, CustomerView, CustomerEditForm } from "./components";

//搜索栏要展示的字段
const text = [
  { name: "我的客户", value: true },
  { name: "机构客户", value: false },
];

class Customer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      totalPages: 1,
      initd: false,
      pageIndex: 1,
      pageSize: 20,
      searchTxt: "",
      restricted: true,
      loading: false,
      showDetail: false,
      selectedCustomer: {},
      isNew: true,
      showForm: false,
    };
  }

  componentDidMount() {
    this.getCustomerList();
    this.initColumns();
  }

  initColumns = () => {
    this.columns = [
      {
        title: "客户名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "客户电话",
        dataIndex: "cellphone",
        key: "cellphone",
      },
      {
        title: "客户经理",
        key: "employee",
        dataIndex: "employee",
        render: (employee) => <div>{employee ? employee.name : ""}</div>,
      },
      {
        title: "客户所在机构",
        key: "organization",
        dataIndex: "organization",
        render: (organization) => <div>{organization.name}</div>,
      },
      {
        title: "客户等级",
        key: "ranking",
        dataIndex: "ranking",
        render: (ranking) => <div>{ranking ? ranking : "-"}</div>,
      },
      {
        title: "操作",
        key: "action",
        width: 120,
        render: (chooseItem) => (
          <div size="middle">
            <b
              onClick={() => {
                this.showDetailDrawer(chooseItem);
              }}
              className="ant-green-link cursor"
            >
              <EyeOutlined title="查看" />
            </b>
            {this.state.restricted || storageUtils.getUser().admin ? (
              <b>
                <Divider type="vertical" />
                <b
                  onClick={() => {
                    this.editCustomer(chooseItem);
                  }}
                  className="ant-blue-link cursor"
                >
                  <EditOutlined title="修改" />
                </b>
                <Divider type="vertical" />
                <b
                  onClick={() => {
                    this.deleteCustomer(chooseItem);
                  }}
                  className="ant-pink-link cursor"
                >
                  <DeleteOutlined title="删除" />
                </b>
              </b>
            ) : null}
          </div>
        ),
      },
    ];
  };

  refresh = (restricted) => {
    this.setState({ restricted });
    this.getCustomerList({ pageIndex: 1, restricted });
  };

  refreshSearchTxt = (txt) => {
    this.setState({ searchTxt: txt });
  };

  onSearchClear = (searchTxt) => {
    this.setState({ searchTxt });
    this.getCustomerList({ pageIndex: 1, searchTxt });
  };

  getCustomerList = async (elements = {}) => {
    const { pageIndex, pageSize, searchTxt, restricted } = this.state;
    const user = storageUtils.getUser();
    const params = {
      page: (elements.pageIndex || pageIndex) - 1,
      size: elements.pageSize || pageSize,
      orgUid: user.orgUid,
      searchTxt: elements.searchTxt || searchTxt,
      restricted:
        typeof elements.restricted === "boolean"
          ? elements.restricted
          : restricted,
    };
    this.setState({ loading: true });
    const result = await reqGetCustomers(params);
    const cont =
      result && result.data && result.data.content ? result.data.content : [];
    this.setState({
      loading: false,
      initd: true,
      dataSource: cont.content,
      totalPages: cont ? cont.totalElements : 1,
    });
  };

  getCustomerDetail = async (customer, name) => {
    let result = await reqGetCustomer(customer.uid);
    if (result && result.data && result.data.retcode === 0) {
      this.setState({
        isNew: false,
        [name]: true,
        selectedCustomer: result.data.content,
      });
    }
  };

  searchValue = (e) => {
    this.setState({
      pageIndex: 1,
      searchTxt: e.searchTxt,
      restricted: e.group,
    });
    this.getCustomerList({
      pageIndex: 1,
      searchTxt: e.searchTxt,
      restricted: e.group,
    });
  };

  handlePaginationChange = (page) => {
    this.setState({ pageIndex: page });
    this.getCustomerList({ pageIndex: page });
  };

  showDetailDrawer = (customer) => {
    this.setState({
      isNew: false,
      showDetail: true,
      selectedCustomer: customer,
    });
  };

  addCustomer = async () => {
    const result = await reqPermit("CREATE_CUSTOMER");
    if (result) {
      this.setState({
        isNew: true,
        showForm: true,
        selectedCustomer: {},
      });
    }
  };

  editCustomer = async (customer) => {
    const result = await reqPermit("UPDATE_CUSTOMER");
    if (result) {
      this.setState({
        isNew: false,
        showForm: true,
        selectedCustomer: customer,
      });
    }
  };

  deleteCustomer = async (chooseItem) => {
    let that = this;
    const result = await reqPermit("DELETE_CUSTOMER");
    if (result) {
      Modal.confirm({
        title: "确认删除客户【" + chooseItem.name + "】吗?",
        icon: <ExclamationCircleOutlined />,
        okText: "确认",
        okType: "danger",
        cancelText: "取消",
        onOk() {
          that.deleteItem(chooseItem.uid);
        },
      });
    }
  };

  deleteItem = async (uid) => {
    const result = await reqDelCustomer(uid);
    if (result.data.retcode === 0) {
      notification.success({ message: "删除成功" });
      this.getCustomerList();
    }
  };

  onDetailClose = () => {
    this.setState({ showDetail: false });
  };

  onClose = () => {
    this.setState({ showForm: false });
  };

  onFinishClose = () => {
    this.setState({ showForm: false });
    this.getCustomerList();
  };

  renderContent = () => {
    const {
      dataSource,
      totalPages,
      pageSize,
      pageIndex,
      showDetail,
      selectedCustomer,
      isNew,
      showForm,
      loading,
      searchTxt,
      restricted,
    } = this.state;
    return (
      <>
        <PageHeader
          className="site-page-header-responsive cont"
          title="我的客户"
          extra={[
            <PlusSquareFilled
              key="add"
              className="setIcon"
              onClick={this.addCustomer}
            />,
          ]}
        ></PageHeader>
        <SearchForm
          searchTxt={searchTxt}
          loading={loading}
          searchValue={this.searchValue}
          texts={text}
          placeholder="请输入客户名称或手机号码查询"
          refresh={this.refresh}
          refreshSearchTxt={this.refreshSearchTxt}
          restricted={restricted}
          onSearchClear={this.onSearchClear}
        />
        <Table
          rowKey="uid"
          columns={this.columns}
          dataSource={dataSource}
          bordered
          size="small"
          pagination={false}
          loading={loading}
        />
        <div className="pagination">
          <Pagination
            pageSize={pageSize}
            current={pageIndex}
            onChange={this.handlePaginationChange}
            total={totalPages}
            showTotal={(total) => `总共 ${total} 条数据`}
            size="small"
            showSizeChanger={false}
            disabled={loading}
          />
        </div>
        {showDetail ? (
          <CustomerView
            visible={showDetail}
            onClose={this.onDetailClose}
            selectedCustomer={selectedCustomer}
          />
        ) : null}
        {showForm ? (
          <CustomerEditForm
            visible={showForm}
            onClose={this.onClose}
            onFinishClose={this.onFinishClose}
            isNew={isNew}
            selectedCustomer={selectedCustomer}
          />
        ) : null}
      </>
    );
  };

  render() {
    const { initd } = this.state;
    return <>{initd ? this.renderContent() : <Loading />}</>;
  }
}

export default withRouter(Customer);
