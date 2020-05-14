import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Divider,
  Modal,
  Drawer,
  Pagination,
  Form,
  Row,
  Col,
  notification,
  Select,
  Tag,
  Switch,
} from "antd";
import {
  SearchOutlined,
  PlusSquareFilled,
  FolderViewOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Operations } from "../../utils/constants";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import storageUtils from "../../utils/storageUtils";
import {
  reqPermit,
  reqGetPermissions,
  reqGetGroups,
  reqDelGroup,
  reqPostGroup,
  reqGetEmployee,
} from "../../api";
import { Loading, TransferComponent } from "../../components";
import "../../css/common.less";
const layout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
    lg: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
    lg: { span: 20 },
  },
};
const tailLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
    lg: {
      span: 20,
      offset: 4,
    },
  },
};

const { Search } = Input;
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;

class Groups extends Component {
  state = {
    inited: false,
    groups: [],
    addNew: false,
    currentPage: 1,
    size: 8,
    total: 1,
    /*添加组 */
    visible: false,
    isNew: true,
    name: "",
    description: "",
    template: "",
    operations: "",
    mockData: [],
  };
  componentDidMount() {
    this.getList(1);
    this.getPermissions();
  }
  getList = async () => {
    const result = await reqPermit("LIST_GROUPS");
    if (result) {
      this.getGroups(1);
    } else {
      this.setState({
        inited: true,
      });
    }
  };

  searchValue = (value) => {
    this.getGroups(1, value.searchTxt);
  };
  tree = (cont) => {
    //组织树控件的数据
    const list = [];
    for (let i = 0; i < cont.length; i++) {
      const key = cont[i].operation || cont[i]; //`${path}-${i}`;
      const treeNode = {
        title: Operations[key],
        key,
      };
      if (cont[i].children && cont[i].children.length > 0) {
        treeNode.children = this.tree(cont[i].children);
      }
      list.push(treeNode);
    }
    return list;
  };
  //获取权限reqGetPermissions
  getPermissions = async () => {
    const result = await reqGetPermissions();
    let cont =
      result && result.data && result.data.content ? result.data.content : [];
    const tree = this.tree(cont);
    this.setState({
      mockData: tree,
    });
  };
  /*
获取组列表数据
*/
  getGroups = async (currentPage, searchTxt) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt: searchTxt,
    };
    const result = await reqGetGroups(parmas);
    const cont =
      result && result.data && result.data.content ? result.data.content : [];

    this.totalPages =
      result && result.data ? result.data.content.totalElements : 1;
    this.setState({
      groups: cont.content,
      total: result && result.data ? result.data.content.totalElements : 1,
      inited: true,
    });
  };
  /*分页 */
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getGroups(page);
  };
  addItem = () => {
    this.setState({
      visible: true,
    });
    this.getPermissions();
  };
  deleteItem = async (id) => {
    let result = await reqDelGroup(id);
    if (result.data.retcode === 0) {
      notification.success({ message: "删除成功" });
      this.getGroups(1);
    }
  };

  backIndex = () => {
    this.props.history.push("/admin/myOrgs");
  };
  //获取当前员工详情
  getEmployee = async (id) => {
    let curInfo = await reqGetEmployee(id);
    let cont = curInfo.data.content ? curInfo.data.content : [];
    this.setState({
      inited: true,
      curInfo: cont,
    });
  };
  // _validate = () => {
  //   var constraints = {
  //     name: { presence: { message: "^名称不能为空" } },
  //     description: { presence: { message: "^描述不能为空" } },
  //     operations: { presence: { message: "^权限不能为空" } },
  //   };
  //   let { name, description, operations } = this.state;
  //   var attributes = {
  //     name: name,
  //     description: description,
  //     operations: operations,
  //   };
  //   var errors = validate(attributes, constraints);
  //   if (errors) {
  //     var result = "",
  //       attr;
  //     for (attr in errors) {
  //       result = result + "<li><span>" + errors[attr] + "</span></li>";
  //     }
  //     result = result + "";
  //     return (
  //       <div
  //         style={{ color: "red", textAlign: "center" }}
  //         dangerouslySetInnerHTML={{ __html: result }}
  //       ></div>
  //     );
  //   }
  //   var newGroup = {};
  //   if (!this.state.isNew)
  //   newGroup.name = name;
  //   newGroup.description = description;
  //   newGroup.operations = operations;
  //   this.newGroup = newGroup;
  //   return false;
  // };
  onFinish = async (values) => {
    console.log("Groups -> onFinish -> values", values)
    if (this.state.operations.length === 0) {
      notification.error({ message: "权限不能为空" });
      return false;
    }
    let { operations } = this.state;
    let params = {
      name: values.name,
      description: values.description,
      operations: operations,
      orgUid: storageUtils.getUser().orgUid,
    };
    const result = await reqPostGroup(params);
    if (result.data.retcode === 0) {
      notification.success({ message: "添加成功" });
      this.setState({
        visible: false,
      });
      this.getGroups(1);
    }
    //}
  };
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };
  onSwitchChange = (value) => {
    this.setState({
      admin: value,
    });
  };
  choosehandle = (value) => {
    console.log("Groups -> choosehandle -> value", value);
    this.setState({
      operations: value,
    });
  };
  renderAddForm = () => {
    const {
      name,
      description,
      operations,
      //分组权限
      mockData,
    } = this.state;
    return (
      <Form
        {...layout}
        name="basic"
        initialValues={{
          name: name,
          description: description,
          operations: operations,
        }}
        onFinish={this.onFinish}
        validateMessages={defaultValidateMessages.defaultValidateMessages}
      >
        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true }, { max: 45 }]}
        >
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>
        <Form.Item
          label="描述"
          name="description"
          rules={[{ max: 255 }]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="权限"
          name="operations"
        >
          <TransferComponent
            treeData={mockData}
            chooseItem={this.choosehandle}
          />
        </Form.Item>
        {this.state.isNew ? (
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        ) : null}
      </Form>
    );
  };
  renderContent = () => {
    const { groups, size, currentPage, total } = this.state;
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "描述",
        dataIndex: "desc",
        key: "desc",
      },
      {
        title: "操作",
        key: "action",
        render: (chooseItem) => (
          <span>
            {/* <b
              onClick={() => {
                let that = this;
                confirm({
                  title: "确认删除分组【" + chooseItem.name + "】吗?",
                  icon: <ExclamationCircleOutlined />,
                  okText: "确认",
                  okType: "danger",
                  cancelText: "取消",
                  onOk() {
                    that.deleteItem(chooseItem.id);
                  },
                });
              }}
              className="ant-pink-link cursor"
            >
              删除
            </b> */}
          </span>
        ),
      },
    ];
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="权限与分组"
          extra={[
            <PlusSquareFilled
              key="add"
              className="setIcon"
              onClick={this.addItem}
            />,
          ]}
          onBack={this.backIndex}
        ></PageHeader>
        {/* --搜索栏-- */}
        <Form
          onFinish={this.searchValue}
          layout="horizontal"
          name="advanced_search"
          className="ant-advanced-search-form"
          initialValues={{
            searchTxt: "",
          }}
        >
          <Row>
            <Col span={9}>
              <Form.Item name="searchTxt" label="查询条件">
                <Input placeholder="请输入名称进行搜索" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Button
                  type="primary"
                  className="cursor searchBtn"
                  htmlType="submit"
                  loading={this.state.loading}
                  onClick={this.enterLoading}
                >
                  搜索
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {/* --搜索栏-- */}
        <Table
          size="small"
          bordered
          dataSource={groups}
          columns={columns}
          pagination={false}
        />
        <div className="pagination">
          <Pagination
            size="small"
            pageSize={size}
            current={currentPage}
            onChange={this.handleTableChange}
            total={this.totalPages}
            showTotal={(total) => `总共 ${total} 条数据`}
          />
        </div>

        <Drawer
          title="新增权限与分组"
          width={620}
          visible={this.state.visible}
          onClose={this.handleCancel}
          footer={null}
        >
          {this.renderAddForm()}
        </Drawer>
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

export default Groups;
