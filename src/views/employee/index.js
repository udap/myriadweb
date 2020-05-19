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
  Checkbox,
  Descriptions,
} from "antd";
import {
  PlusSquareFilled,
  ExclamationCircleOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { employeeStatuses, roleTypes } from "../../utils/constants";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import storageUtils from "../../utils/storageUtils";
import {
  reqPermit,
  reqGetEmployees,
  reqDelEmployee,
  reqAddEmployees,
  reqGetGroupsByOrg,
  reqGetEmployee,
  reqActivateEmployee,
  reqPutEmployee,
} from "../../api";
import { Loading } from "../../components";
import "../../css/common.less";

const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;

class Employee extends Component {
  state = {
    inited: false,
    employees: [],
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
    includingSubsidiaries: false,
    //员工详情
    showDetail: false,
  };
  componentDidMount() {
    this.getList(1);
  }
  getList = async () => {
    this.getEmployees(1);
  };

  searchValue = (value) => {
    this.setState({
      currentPage: 1,
      searchTxt: value.searchTxt,
    });
    this.getEmployees(1, value.searchTxt);
  };
  /*
获取列表数据
*/
  getEmployees = async (currentPage, searchTxt, includingSubsidiaries) => {
    console.log("Employee -> getEmployees -> includingSubsidiaries", includingSubsidiaries)
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
      includingSubsidiaries: typeof(includingSubsidiaries)==='undefined'?this.state.includingSubsidiaries:includingSubsidiaries,
    };
    const result = await reqGetEmployees(parmas);
    const cont = result && result.data ? result.data.content : [];

    this.totalPages =
      result && result.data ? result.data.content.totalElements : 1;
    this.setState({
      employees: cont.content,
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
  setItem = async (operate, permission, data) => {
    console.log("Employee -> setItem -> operate", operate);
    const result = await reqPermit(permission);
    if (result) {
      this.getGroups();
      if (operate === "edit") {
        this.getEmployee(data, "visible");
        this.setState({
          isNew: false,
        });
      } else {
        // add
        this.setState({
          curInfo: {},
          isNew: true,
          visible: true,
        });
      }
    }
  };
  //获取当前员工详情
  getEmployee = async (id, name) => {
    let curInfo = await reqGetEmployee(id);
    console.log("Employee -> getEmployee -> curInfo", curInfo);
    let cont = curInfo.data.content ? curInfo.data.content : [];
    this.setState({
      curInfo: cont,
      [name]: true,
    });
  };
  //显示详情
  showDetailDrawer = (uid) => {
    this.getEmployee(uid, "showDetail");
  };
  delConfirm = async (chooseItem) => {
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

  //获取员工所在组
  getGroups = async () => {
    let orgUid = storageUtils.getUser().orgUid;
    let groups = await reqGetGroupsByOrg(orgUid);
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
    if (this.state.isNew) {
      const result = await reqAddEmployees(params);
      if (result.data.retcode === 0) {
        notification.success({ message: "添加成功" });
        this.setState({
          visible: false,
        });
        this.getEmployees(1);
      }
    } else {
      let uid = this.state.curInfo.uid;
      const result = await reqPutEmployee(uid, params);
      if (result.data.retcode === 0) {
        notification.success({ message: "更新成功" });
        this.setState({
          visible: false,
        });
        this.getEmployees(1);
      }
    }
  };
  handleCancel = () => {
    this.setState({
      visible: false,
      showDetail: false,
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
  //员工表单
  renderEmpolyContent = (data) => {
    const {
      name,
      cellphone,
      admin,
      desc,
      groupId,
      code,
      groups,
    } = this.state.curInfo;
    const onGenderChange = (value) => {};
    /*当前机构是admin   可以设置是否管理员 */
    //并且当前机构是顶级机构删除
    const ableSetAdmin = storageUtils.getUser().admin;
    //&&JSON.stringify(storageUtils.getOrg().parent) === "{}";
    //如果是admin 不需要选择员工所在组
    let isAdmin = this.state.admin;
    //let  {groups} = this.state;
    console.log(
      "Employee -> onGenderChange -> this.state.isNew",
      this.state.isNew
    );

    console.log(
      "Employee -> renderEmpolyContent -> this.state.curInfo",
      this.state.curInfo
    );
    let { curInfo, isNew, visible } = this.state;
    let groupOption = isNew ? "" : groups.length !== 0 ? groups[0].name : "";
    return (
      <Drawer
        width={400}
        title={isNew ? "添加员工" : "修改员工"}
        visible={visible}
        onClose={this.handleCancel}
        footer={null}
      >
        <Form
          name="basic"
          layout="vertical"
          initialValues={{
            name: name,
            cellphone: cellphone,
            admin: admin,
            desc: desc,
            groupId: groupOption,
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
            <Input />
          </Form.Item>
          <Form.Item
            label="手机号码"
            name="cellphone"
            rules={[{ required: true }, { max: 13 }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="员工编号" name="code" rules={[{ max: 20 }]}>
            <Input />
          </Form.Item>
          <Form.Item label="是否管理员" name="admin">
            <Switch
              disabled={ableSetAdmin ? false : true}
              checked={this.state.admin}
              onChange={this.onSwitchChange}
            />
          </Form.Item>
          <Form.Item label="员工所在组" name="groupId">
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
          </Form.Item>

          <Form.Item label="备注" name="desc">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="default" onClick={this.handleCancel}>
              取消
            </Button>
            <Button className="margin-left" type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    );
  };
  /*Checkbox 切换*/
  onCheckboxChange = (e) => {
    console.log("Employee -> onCheckboxChange -> e", e)
    this.setState({
      page: 0,
      includingSubsidiaries: e.target.checked,
      currentPage: 1,
    });
    this.getEmployees(1, null, e.target.checked);
  };

  //员工详情
  renderDetail = () => {
    const {
      name,
      cellphone,
      admin,
      desc,
      org,
      code,
      groups,
      role,
      status,
    } = this.state.curInfo;
    const { showDetail } = this.state;
    return (
      <div>
        <Drawer
          width={400}
          title="员工详情"
          visible={showDetail}
          onClose={this.handleCancel}
          footer={null}
        >
          <Row>
            {/* 姓名 手机号 员工编码 分组 角色 状态 操作 */}
            <Col span={24}>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="姓名">{name}</Descriptions.Item>
                <Descriptions.Item label="手机号">
                  {cellphone}
                </Descriptions.Item>
                <Descriptions.Item label="员工编码">{code}</Descriptions.Item>
                <Descriptions.Item label="是否管理员">
                  {admin ? "是" : "否"}
                </Descriptions.Item>
                <Descriptions.Item label="部门">
                  {org && org.name ? org.name : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="分组">
                  {groups && groups.length !== 0
                    ? groups.map((item, index) => (
                        <span key={index}>{item["name"]}</span>
                      ))
                    : null}
                </Descriptions.Item>
                <Descriptions.Item label="角色">
                  {roleTypes.map((item, index) => (
                    <span key={index}>{item[role]}</span>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  {employeeStatuses.map((item, index) => (
                    <span key={index}>{item[status]}</span>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="备注">{desc}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Drawer>
      </div>
    );
  };
  renderContent = () => {
    const {
      employees,
      size,
      currentPage,
      total,
      showDetail,
      isNew,
      curInfo,
      visible,
    } = this.state;
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
        title: "部门",
        dataIndex: "org",
        key: "org",
        render: (text) => <span>{text ? text.name : "-"}</span>,
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
        width: 125,
        render: (chooseItem) => (
          <div>
            {/* <b onClick={() => {}} className="ant-green-link cursor">
              调用
            </b>
            <Divider type="vertical" />*/}

            <b
              onClick={() => {
                this.showDetailDrawer(chooseItem.uid);
              }}
              className="ant-green-link cursor"
            >
              <EyeOutlined title="查看" />
            </b>
            <Divider type="vertical" />
            {chooseItem.status === "NEW" ? (
              <b>
                <b
                  className="ant-orange-link cursor"
                  onClick={() => {
                    this.hasActivatePower(chooseItem);
                  }}
                >
                  <CheckCircleOutlined title="激活" />
                </b>
                <Divider type="vertical" />
              </b>
            ) : null}
            <b
              onClick={() => {
                this.setItem("edit", "UPDATE_EMPLOYEE", chooseItem.uid);
              }}
              className="ant-blue-link cursor"
            >
              <EditOutlined title="修改" />
            </b>
            <Divider type="vertical" />
            <b
              onClick={() => {
                this.delConfirm(chooseItem);
              }}
              className="ant-pink-link cursor"
            >
              <DeleteOutlined title="删除" />
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
              onClick={() => {
                this.setItem("add", "CREATE_EMPLOYEE");
              }}
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
            //includingSubsidiaries: false,
            searchTxt: "",
          }}
        >
          <Row>
            <Col>
              <Form.Item name="includingSubsidiaries" label="查询条件">
                <Checkbox
                  onChange={this.onCheckboxChange}
                  checked={this.state.includingSubsidiaries}
                >
                  包括下属机构员工
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item name="searchTxt">
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
          dataSource={employees}
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
        {visible ? this.renderEmpolyContent() : null}

        {showDetail ? this.renderDetail() : null}
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
