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
import { employeeStatuses, roleTypes } from "../../utils/constants";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import storageUtils from "../../utils/storageUtils";
import {
  reqPermit,
  reqGetEmployees,
  reqDelEmployee,
  reqAddEmployees,
  reqGetGroup,
  reqGetEmployee,
} from "../../api";
import { Loading } from "../../components";
import "../../css/common.less";
const layout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
    lg: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
    lg: { span: 12 },
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
      span: 12,
      offset: 6,
    },
  },
};

const { Search } = Input;
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;

class Employee extends Component {
  state = {
    inited: false,
    campaigns: [],
    addNew: false,
    currentPage: 1,
    size: 8,
    total: 1,
    /*添加员工 */
    visible: false,
    isNew: true,
    name: "",
    cellphone: "",
    admin: "",
    desc: "",
    groupId: "",
    orgUid: "",
    code: "",
    groups: [],
    curInfo: {},
  };
  componentDidMount() {
    this.getList(1);
  }
  getList = async () => {
    const result = await reqPermit("LIST_EMPLOYEES");
    if (result) {
      this.getEmployees(1);
    } else {
      this.setState({
        inited: true,
      });
    }
  };

  searchValue = (value) => {
    this.getEmployees(1, value.searchTxt);
  };
  /*
获取列表数据
*/
  getEmployees = async (currentPage, searchTxt) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt: searchTxt,
    };
    const result = await reqGetEmployees(parmas);
    const cont = result && result.data ? result.data.content : [];

    this.totalPages =
      result && result.data ? result.data.content.totalElements : 1;
    this.setState({
      campaigns: cont.content,
      total: result && result.data ? result.data.content.totalElements : 1,
      inited: true,
    });
  };
  /*分页 */
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getEmployees(page);
  };
  addItem = () => {
    this.setState({
      visible: true,
    });
    this.getGroups();
  };
  deleteItem = async (id) => {
    let result = await reqDelEmployee(id);
    if (result.data.retcode === 0) {
      notification.success({ message: "删除成功" });
      this.getEmployees(1);
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
  //获取员工所在组
  getGroups = async () => {
    let orgUid = storageUtils.getUser().orgUid;
    let groups = await reqGetGroup(orgUid);
    let cont = groups.data.content ? groups.data.content.content : [];
    this.setState({
      inited: true,
      groups: cont,
      orgUid: orgUid,
    });
  };
  onFinish = async (values) => {
    let params = {
      name: values.name,
      cellphone: values.cellphone,
      admin: values.admin,
      desc: values.desc,
      code: values.code,
      groupId: values.groupId,
      orgUid: storageUtils.getUser().orgUid,
    };
    const result = await reqAddEmployees(params);
    if (result.data.retcode === 0) {
      notification.success({ message: "添加成功" });
      this.setState({
        visible: false,
      });
      this.getEmployees(1);
    }
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
  onFinishFailed = (errorInfo) => {};
  renderEmpolyContent = () => {
    const {
      name,
      cellphone,
      admin,
      desc,
      groupId,
      orgUid,
      code,
      groups,
    } = this.state.curInfo;
    const onGenderChange = (value) => {};
    /*当前机构是admin  并且当前机构是顶级机构 可以设置是否管理员 */
    const ableSetAdmin =
      storageUtils.getUser().admin &&
      JSON.stringify(storageUtils.getOrg().parent) === "{}";
    //如果是admin 不需要选择员工所在组
    let isAdmin = this.state.admin;
    return (
      <Form
        {...layout}
        name="basic"
        initialValues={{
          name: name,
          cellphone: cellphone,
          admin: admin,
          desc: desc,
          groupId: this.state.isNew ? groupId : groups[0].name,
          code: code,
        }}
        onFinish={this.onFinish}
        validateMessages={defaultValidateMessages.defaultValidateMessages}
      >
        <Form.Item
          label="员工姓名"
          name="name"
          rules={[{ required: true }, { max: 32 }]}
        >
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>
        <Form.Item
          label="手机号码"
          name="cellphone"
          rules={[{ required: true }, { max: 13 }]}
        >
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>
        <Form.Item label="员工编号" name="code" rules={[{ max: 20 }]}>
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>

        {ableSetAdmin ? (
          <Form.Item label="是否管理员" name="admin">
            <Switch checked={this.state.admin} onChange={this.onSwitchChange} />
          </Form.Item>
        ) : null}
        {isAdmin ? (
          <Form.Item
            label="员工所在组"
            name="groupId"
            rules={[
              {
                required: false,
              },
            ]}
          >
            {this.state.isNew ? (
              <Select
                placeholder="员工所在组"
                onChange={onGenderChange}
                allowClear
              >
                {this.state.groups.map((item, index) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            ) : (
              <Input disabled={this.state.isNew ? false : true} />
            )}
          </Form.Item>
        ) : (
          <span>
            <Form.Item
              label="员工所在组"
              name="groupId"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              {this.state.isNew ? (
                <Select
                  placeholder="员工所在组"
                  onChange={onGenderChange}
                  allowClear
                >
                  {this.state.groups.map((item, index) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input disabled={this.state.isNew ? false : true} />
              )}
            </Form.Item>
          </span>
        )}

        <Form.Item label="备注" name="desc">
          <TextArea rows={4} />
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
              //this.props.history.push("/admin/employees/detail/" + record._id);
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
        render: (text) => <span>{text ? text : "-"}</span>,
      },
      {
        title: "角色",
        dataIndex: "role",
        key: "role",
        render: (text) => (
          <span>
            <Tag color="green" key={text}>
              {roleTypes.map((item, index) => (
                <span key={index}>{item[text]}</span>
              ))}
            </Tag>
          </span>
        ),
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (text) => (
          <span>
            <Tag color="green" key={text}>
              {employeeStatuses.map((item, index) => (
                <span key={index}>{item[text]}</span>
              ))}
            </Tag>
          </span>
        ),
      },
      {
        title: "操作",
        key: "action",
        render: (chooseItem) => (
          <span>
            {/* <b onClick={() => {}} className="ant-green-link cursor">
              调用
            </b>
            <Divider type="vertical" />
             */}
            <b
              onClick={() => {
                let that = this;
                confirm({
                  title: "确认删除员工【" + chooseItem.name + "】吗?",
                  icon: <ExclamationCircleOutlined />,
                  okText: "确认",
                  okType: "danger",
                  cancelText: "取消",
                  onOk() {
                    that.deleteItem(chooseItem.uid);
                  },
                });
              }}
              className="ant-pink-link cursor"
            >
              删除
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
                <Input placeholder="请输入名称或手机号进行搜索" allowClear />
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
          dataSource={campaigns}
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
          title="添加员工"
          width={620}
          visible={this.state.visible}
          onClose={this.handleCancel}
          footer={null}
        >
          {this.renderEmpolyContent()}
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

export default Employee;
