import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Divider,
  Modal,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  PlusSquareFilled,
  FolderViewOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import storageUtils from "../../utils/storageUtils";
import { reqGetEmployees } from "../../api";
import { Loading } from "../../components";
import "../../css/common.less";

const { Search } = Input;
const { confirm } = Modal;

class Employees extends Component {
  state = {
    inited: false,
    campaigns: [],
    addNew: false,
    currentPage: 1,
    size: 8,
    total: 1,
  };
  componentDidMount() {
    this.getEmployees(1);
  }
  /*
获取列表数据
*/
  getEmployees = async (currentPage) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
    };
    const result = await reqGetEmployees(parmas);
    console.log("Employees -> getEmployees -> result", result)
    const cont = result && result.data ? result.data.content : [];
    
    this.totalPages =
      result && result.data ? result.data.content.totalElements : 1;
    this.setState({
      campaigns: cont.content,
      total: result && result.data ? result.data.content.totalElements : 1,
      inited: true,
    });
  };
  searchValue = (value) => {};
  addItem = () => {
   // this.props.history.push("/admin/employees/" + "new");
  };
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getEmployees(page);
  };
  renderContent = () => {
    const { campaigns, size, currentPage, total } = this.state;
    const columns = [
      {
        title: "姓名",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        render: (text, record) => (
          <b
            onClick={() => {
              this.props.history.push("/admin/employees/detail/" + record._id);
            }}
            className="ant-green-link cursor"
          >
            {text}
          </b>
        ),
      },
      {
        title: "手机号",
        dataIndex: "cellphone",
        key: "cellphone",
      },
      {
        title: "员工编码",
        dataIndex: "code",
        key: "code",
        ellipsis: true,
      },
      {
        title: "操作",
        dataIndex: "action",
        key: "action",
        render: (text, record) => (
          <span>
            <b onClick={() => {}} className="ant-green-link cursor">
              调用
            </b>
            <Divider type="vertical" />
            <b
              onClick={() => {
                // let that = this;
                // confirm({
                //   title: "确认离职吗?",
                //   icon: <ExclamationCircleOutlined />,
                //   content: "离职之后将不可恢复，请谨慎操作！",
                //   okText: "确认",
                //   okType: "danger",
                //   cancelText: "取消",
                //   onOk() {
                //     console.log("OK");
                //   },
                //   onCancel() {
                //     console.log("Cancel");
                //   },
                // });
              }}
              className="ant-pink-link cursor"
            >
              离职
            </b>
          </span>
        ),
      },
    ];
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="员工管理"
          // subTitle={
          //   <Search
          //     placeholder="请输入信息查询"
          //     onSearch={(value) => {
          //       this.searchValue(value);
          //     }}
          //     enterButton
          //   />
          // }
          extra={[
            <PlusSquareFilled className="setIcon" onClick={this.addItem} />,
          ]}
        ></PageHeader>
        <Table
          size="middle"
          bordered
          dataSource={campaigns}
          columns={columns}
          pagination={false}
        />
        <div class="pagination">
          <Pagination
            pageSize={size}
            current={currentPage}
            onChange={this.handleTableChange}
            total={this.totalPages}
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

export default Employees;
