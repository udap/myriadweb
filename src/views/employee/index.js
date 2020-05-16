import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
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
  Divider,
} from "antd";
import { PlusSquareFilled, ExclamationCircleOutlined } from "@ant-design/icons";
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
  reqActivateEmployee,
} from "../../api";
import { Loading } from "../../components";
import "../../css/common.less";

const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;

class Employee extends Component {
  state = {
    inited: false,
    campaigns: [],
    addNew: false,
    currentPage: 1,
    size: 20,
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
    this.getEmployees(1);
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
  addItem = async () => {
    const result = await reqPermit("CREATE_EMPLOYEE");
    if (result) {
      this.setState({
        visible: true,
      });
      this.getGroups();
    }
  };
  hasPower = async (chooseItem) => {
    const result = await reqPermit("DELETE_EMPLOYEE");
    if (result) {
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
    }
  };
  hasActivatePower = async (chooseItem) => {
    const result = await reqPermit("UPDATE_EMPLOYEE");
    if (result) {
      let that = this;
        confirm({
        title: "确认激活员工【" + chooseItem.name + "】吗?",
        icon: <ExclamationCircleOutlined />,
        okText: "确认",
        cancelText: "取消",
        onOk() {
          that.activateEmployee(chooseItem.uid);
        },
      });
    }
  };
 
  deleteItem = async (id) => {
    let resultDel = await reqDelEmployee(id);
    if (resultDel.data.retcode === 0) {
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
  activateEmployee = async (uid) => {
    const result = await reqActivateEmployee(uid);
    if (result.data.retcode === 0) {
      notification.success({ message: "激活成功" });
      this.setState({
        visible: false,
      });
      this.getEmployees(1);
    }
  };
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
        name="basic"
        layout="vertical"
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
          <Form.Item>
            <Button type="default" onClick={this.handleCancel}>
              取消
            </Button>
            <Button className="margin-left" type="primary" htmlType="submit">
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
        title: "分组",
        dataIndex: "groups",
        key: "groups",
        render: (groups) => (
          <div>
            {groups.length !== 0
              ? groups.map((group) => (
                  <Tag color="blue" key={group.id}>
                    {group.name}
                  </Tag>
                ))
              : "-"}
          </div>
        ),
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
          <div>
            {/* <b onClick={() => {}} className="ant-green-link cursor">
              调用
            </b>
            <Divider type="vertical" />
             
            <b onClick={() => {}} className="ant-green-link cursor">
              查看
            </b>
            <Divider type="vertical" />*/}
            {chooseItem.status === "NEW" ? (
              <b>
                <b
                  className="ant-green-link cursor"
                  onClick={() => {
                    this.hasActivatePower(chooseItem);
                  }}
                >
                  激活
                </b>
                <Divider type="vertical" />
              </b>
            ) : null}

            <b
              onClick={() => {
                this.hasPower(chooseItem);
              }}
              className="ant-pink-link cursor"
            >
              删除
            </b>
          </div>
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
          rowKey="uid"
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
          width={400}
          title="添加员工"
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
