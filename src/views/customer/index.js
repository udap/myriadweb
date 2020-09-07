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
} from "../../api";
import "../../css/common.less";
import { Loading, SearchForm } from "../../components";
import storageUtils from "../../utils/storageUtils";
import CustomerView from "./customerView";
import CustomerEditForm from "./customerEditForm";
const { confirm } = Modal;

@withRouter
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
    isNew: true,
    showForm: false,
    tableLoading: false,
  };
  componentDidMount() {
    this.getCustomerList(1);
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
        render: (employee) => <div>{employee?employee.name:''}</div>,
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
        render: (ranking) => <div>{ranking?ranking:'-'}</div>,
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
            {this.state.restricted ? (
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
  refresh = (searchTxt, restricted) => {
    this.setState({
      tableLoading: true,
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
      tableLoading: false,
    });
  };
  getCustomerDetail = async (customer, name) => {
    let result = await reqGetCustomer(customer.uid);
    if (result.data.retcode === 0) {
      this.setState({
        isNew: false,
        [name]: true,
        selectedCustomer: result.data.content,
      });
    }
  };
  searchValue = (searchTxt, restricted) => {
    this.setState({
      currentPage: 1,
      loading: true,
      tableLoading: true,
    });
    this.getCustomerList(1, searchTxt, restricted);
  };
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getCustomerList(page, this.state.searchTxt, this.state.restricted);
  };
  showDetailDrawer = (customer) => {
    this.getCustomerDetail(customer, "showDetail");
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
      this.getCustomerDetail(customer, "showForm");
    }
  };
  deleteCustomer = async (chooseItem) => {
    let that = this;
    const result = await reqPermit("DELETE_CUSTOMER");
    if (result) {
      confirm({
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
    let resultDel = await reqDelCustomer(uid);
    this.setState({
      tableLoading: true,
      currentPage: 1,
    });
    if (resultDel.data.retcode === 0) {
      notification.success({ message: "删除成功" });
      this.getCustomerList(1);
    }
  };
  onDetailClose = () => {
    this.setState({
      showDetail: false,
    });
  };
  onClose = () => {
    this.setState({
      tableLoading: true,
      showForm: false,
    });
    this.getCustomerList(1);
  };

  renderContent = () => {
    //搜索栏要展示的字段
    const text = [
      { name: "我的客户", value: true },
      { name: "机构客户", value: false },
    ];
    let {
      size,
      currentPage,
      showDetail,
      selectedCustomer,
      isNew,
      showForm,
      tableLoading,
    } = this.state;
    return (
      <div>
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
        {/* --搜索栏-- */}
        <SearchForm
          searchTxt={this.state.searchTxt}
          loading={this.state.loading}
          searchValue={this.searchValue}
          defaultValue={true} //true->默认选中我的客户
          texts={text}
          placeholder="请输入客户名称或手机号码查询"
          refresh={this.refresh}
        />
        <Table
          rowKey="uid"
          columns={this.columns}
          dataSource={this.data}
          bordered
          size="small"
          pagination={false}
          loading={tableLoading}
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
            isNew={isNew}
            selectedCustomer={selectedCustomer}
          />
        ) : null}
      </div>
    );
  };
  render() {
    const { inited } = this.state;
    return <div>{inited ? this.renderContent() : <Loading />}</div>;
  }
}

export default Customer;
