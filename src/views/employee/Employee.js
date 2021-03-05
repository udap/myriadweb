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
  notification,
  Select,
  Tag,
  Switch,
  Divider,
  Transfer,
  Card,
} from "antd";
import {
  PlusSquareFilled,
  ExclamationCircleOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { employeeStatuses, roleTypes } from "@utils/constants";
import defaultValidateMessages from "@utils/comFormErrorAlert";
import storageUtils from "@utils/storageUtils";
import {
  reqPermit,
  reqGetEmployees,
  reqDelEmployee,
  reqAddEmployees,
  reqGetGroupsByOrg,
  reqGetEmployee,
  reqActivateEmployee,
  reqPutEmployee,
} from "@api";
import "@css/common.less";
import { Details, BranchSelect } from "./components";
import { EmployeeQueryFilter } from "@components";

const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;
const { Column } = Table;

class Employee extends Component {
  state = {
    employees: [],
    addNew: false,
    currentPage: 1,
    size: 20,
    total: 1,
    // 添加员工
    visible: false,
    isNew: true,
    name: "",
    cellphone: "",
    admin: false,
    desc: "",
    groupId: "",
    orgUid: "",
    code: "",
    groups: [],
    curInfo: {},
    includingSubsidiaries: false,
    // 员工详情
    detailsVisible: false,
    detailsLoading: false,
    // 修改组
    operationsData: [],
    targetKeys: [],
    selectedRows: null,
    isCurrentOrg: true,
    showListOfInstitutions: false,
  };

  componentDidMount() {
    this.getEmployees(1);
  }

  onQueryFinish = (value) => {
    this.setState({
      currentPage: 1,
      searchTxt: value.searchTxt,
    });
    this.getEmployees(1, value.searchTxt);
  };

  // 获取列表数据
  getEmployees = async (currentPage, searchTxt, includingSubsidiaries) => {
    const params = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      sort: ["org", "createTime,desc"],
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
      includingSubsidiaries:
        typeof includingSubsidiaries === "undefined"
          ? this.state.includingSubsidiaries
          : includingSubsidiaries,
    };
    const result = await reqGetEmployees(params);
    const cont = result && result.data ? result.data.content : [];

    this.totalPages =
      result && result.data ? result.data.content.totalElements : 1;
    this.setState({
      employees: cont.content,
      total: result && result.data ? result.data.content.totalElements : 1,
    });
  };

  //获取当前员工详情
  getEmployee = async (id, name) => {
    let curInfo = await reqGetEmployee(id);
    let cont = curInfo.data.content ? curInfo.data.content : [];
    let data = [];
    if (cont.groups.length !== 0) {
      for (let i = 0; i < cont.groups.length; i++) {
        data.push(cont.groups[i].id);
      }
    }
    let orgId = storageUtils.getUser().orgId;
    this.setState({
      curInfo: cont,
      targetKeys: data,
      [name]: true,
      admin: cont.admin,
      selectedRows: cont.org.id === orgId ? null : cont.org.uid,
      isCurrentOrg: cont.org.id === orgId ? true : false,
    });
  };

  // 分页
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getEmployees(page);
  };

  setItem = async (operate, permission, empItem) => {
    const result = await reqPermit(permission);
    if (result) {
      if (operate === "edit") {
        let orgUid = empItem.org.uid;
        this.getGroupsList(orgUid, false);
        // let orgId = storageUtils.getUser().orgId;
        // if (empItem.org.id !== orgId) {
        //   //不是当前机构的员工
        //   notification.info({
        //     message: "抱歉，您无权修改其它机构的员工信息！",
        //   });
        //   return false;
        // }
        this.getEmployee(empItem.uid, "visible");
        this.setState({
          //          isCurrentOrg:true,
          isNew: false,
        });
      } else {
        let orgUid = storageUtils.getUser().orgUid;
        this.getGroupsList(orgUid, false);
        // add
        this.setState({
          isCurrentOrg: true,
          curInfo: {},
          isNew: true,
          selectedRows: null,
          visible: true,
        });
      }
    }
  };

  // 显示详情
  showDetailDrawer = async (uid) => {
    this.setState({ detailsVisible: true, detailsLoading: true });
    try {
      const curInfo = await reqGetEmployee(uid);
      let cont = curInfo.data.content ? curInfo.data.content : [];
      let data = [];
      if (cont.groups.length !== 0) {
        for (let i = 0; i < cont.groups.length; i++) {
          data.push(cont.groups[i].id);
        }
      }
      let orgId = storageUtils.getUser().orgId;
      this.setState({
        curInfo: cont,
        targetKeys: data,
        admin: cont.admin,
        selectedRows: cont.org.id === orgId ? null : cont.org.uid,
        isCurrentOrg: cont.org.id === orgId ? true : false,
      });
    } catch (error) {}
    this.setState({ detailsLoading: false });
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
    this.setState({
      currentPage: 1,
    });
    if (resultDel.data.retcode === 0) {
      notification.success({ message: "删除成功" });
      this.getEmployees(1);
    }
  };

  backIndex = () => {
    this.props.history.push("/admin/myOrgs");
  };

  // 获取员工所在组
  getGroupsList = async (orgUid, template) => {
    const params = {
      page: 0,
      size: 200,
      orgUid: orgUid,
      template: template ? true : false,
    };
    let groups = await reqGetGroupsByOrg(params);
    let cont = groups.data.content ? groups.data.content.content : [];

    let data = [];
    if (cont.length !== 0) {
      for (let i = 0; i < cont.length; i++) {
        data.push({
          key: cont[i].id,
          title: cont[i].name,
          description: cont[i].description,
        });
      }
    }
    this.setState({
      operationsData: data,
      groups: cont,
    });
  };

  // add/edit
  onFinish = async (values) => {
    let { selectedRows } = this.state;
    let params = this.state.isNew
      ? {
          name: values.name,
          cellphone: values.cellphone,
          admin: values.admin,
          desc: values.desc,
          code: values.code,
          groupId: values.groupId,
          orgUid:
            selectedRows && selectedRows.length !== 0
              ? selectedRows[0].uid
              : storageUtils.getUser().orgUid,
        }
      : {
          name: values.name,
          cellphone: values.cellphone,
          admin: values.admin,
          desc: values.desc,
          code: values.code,
          groups: this.state.targetKeys,
          orgUid:
            selectedRows && selectedRows.length !== 0
              ? selectedRows[0].uid
              : storageUtils.getUser().orgUid,
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

  handleChoose = (nextTargetKeys) => {
    this.setState({
      targetKeys: nextTargetKeys,
    });
  };

  onSelectBranch = (selectedRows) => {
    let orgId = storageUtils.getUser().orgId;
    let isCurrentOrg = selectedRows[0].id === orgId ? true : false;
    this.setState({
      selectedRows: selectedRows,
      isCurrentOrg: isCurrentOrg,
      showListOfInstitutions: false,
    });
    this.getGroupsList(storageUtils.getUser().orgUid, true);
  };

  showBranchSelect = () => {
    this.setState({
      showListOfInstitutions: this.state.showListOfInstitutions ? false : true,
    });
  };

  onResetOrg = () => {
    let orgUid = storageUtils.getUser().orgUid;
    this.getGroupsList(orgUid, false);
    this.setState({
      isCurrentOrg: true,
      showListOfInstitutions: false,
    });
  };

  showBranchSelectButton = (isNew, selectBranch) => {
    if (!isNew) return null;
    if (selectBranch)
      return (
        <b className="ant-green-link cursor" onClick={this.showBranchSelect}>
          下属机构
        </b>
      );
    else
      return (
        <>
          <b className="ant-green-link cursor" onClick={this.showBranchSelect}>
            下属机构
          </b>
          <Divider className="ant-green-link" type="vertical" />
          <b className="ant-green-link cursor" onClick={this.onResetOrg}>
            重置
          </b>
        </>
      );
  };

  // 员工表单
  renderEmployeeForm = () => {
    const {
      curInfo: { name, cellphone, admin, desc, code, groups, operations, org },
    } = this.state;
    const onGenderChange = (value) => {};
    /*当前机构是admin   只可以为当前机构设置管理员 */
    //并且当前机构是顶级机构删除
    const isAdmin = storageUtils.getUser().admin;
    //&&JSON.stringify(storageUtils.getOrg().parent) === "{}";，并且是本机构的员工
    //如果是admin 不需要选择员工所在组
    //let isAdmin = this.state.admin;
    let { isNew, visible } = this.state;
    let groupOption = isNew ? "" : groups.length !== 0 ? groups[0].name : "";

    // 多选分组
    const {
      operationsData,
      targetKeys,
      selectedRows,
      isCurrentOrg,
      showListOfInstitutions,
    } = this.state;
    const selectedOrgName = isCurrentOrg
      ? storageUtils.getUser().orgName
      : org
      ? org.name
      : selectedRows[0].name;
    const selectedOrgUid = isCurrentOrg
      ? storageUtils.getUser().orgUid
      : org
      ? org.uid
      : selectedRows[0].uid;
    return (
      <Drawer
        width={480}
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
            operations: operations,
          }}
          onFinish={this.onFinish}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <div className="grey-block orgDesc" style={{ marginBottom: 16 }}>
            <>
              {this.state.isNew
                ? `${"您正在为【" + selectedOrgName + "】添加员工"}`
                : `${"您正在编辑【" + selectedOrgName + "】员工"}`}
            </>
            {this.showBranchSelectButton(this.state.isNew, isCurrentOrg)}
          </div>
          {showListOfInstitutions ? (
            <Card>
              <BranchSelect
                orgUid={selectedOrgUid}
                onSelectBranch={this.onSelectBranch}
              />
            </Card>
          ) : (
            <>
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
                  disabled={!isAdmin || !isCurrentOrg}
                  checked={this.state.admin}
                  onChange={this.onSwitchChange}
                />
              </Form.Item>
              {isNew ? (
                <Form.Item label="员工所在组" name="groupId">
                  <Select
                    placeholder="员工所在组"
                    disabled={this.state.admin}
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
              ) : (
                <Form.Item label="员工所在组" name="operations">
                  <Transfer
                    disabled={this.state.admin}
                    dataSource={operationsData}
                    onChange={this.handleChoose}
                    targetKeys={targetKeys}
                    render={(item) => item.title}
                  />
                </Form.Item>
              )}

              <Form.Item label="备注" name="desc">
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  提交
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      </Drawer>
    );
  };

  // Checkbox 切换
  onCheckboxChange = (e) => {
    this.setState({
      page: 0,
      includingSubsidiaries: e.target.value,
      currentPage: 1,
    });
    this.getEmployees(1, null, e.target.value);
  };

  render() {
    const {
      employees,
      size,
      currentPage,
      detailsVisible,
      visible,
      detailsLoading,
      includingSubsidiaries,
      loading,
    } = this.state;

    return (
      <>
        <PageHeader
          title="员工管理"
          extra={[
            <Button
              key="add"
              type="link"
              icon={<PlusSquareFilled style={{ fontSize: 24 }} />}
              onClick={() => this.setItem("add", "CREATE_EMPLOYEE")}
            />,
          ]}
          onBack={this.backIndex}
        />
        <EmployeeQueryFilter
          onFinish={this.onQueryFinish}
          includingSubsidiaries={includingSubsidiaries}
          onChange={this.onCheckboxChange}
          loading={loading}
        />
        <Table
          rowKey="uid"
          size="small"
          bordered
          dataSource={employees}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                {record.groups.length !== 0
                  ? record.groups.map((group) => (
                      <Tag color="blue" key={group.id}>
                        {group.name}
                      </Tag>
                    ))
                  : "-"}
              </div>
            ),
            onExpand: (expanded, record) => {
              if (expanded) {
                this.setState({ expandedRowKeys: [record.uid] });
              } else {
                this.setState({ expandedRowKeys: [] });
              }
            },
            expandedRowKeys: this.state.expandedRowKeys,
          }}
        >
          <Column title="姓名" dataIndex="name" key="name" width={120} />
          <Column
            title="手机号"
            dataIndex="cellphone"
            key="cellphone"
            width={120}
          />
          <Column title="员工编码" dataIndex="code" key="code" width={120} />
          <Column
            title="机构/部门"
            dataIndex="org"
            key="org"
            render={(text) => <span>{text ? text.name : "-"}</span>}
          />
          <Column
            title="登录账号"
            dataIndex="account"
            key="account"
            width={250}
            render={(text) => {
              return <>{text?.name}</>;
            }}
          />
          <Column
            title="分组"
            dataIndex="groups"
            key="groups"
            width={180}
            render={(groups) => (
              <>
                {groups.length !== 0
                  ? groups.map((group) => (
                      <Tag color="blue" key={group.id}>
                        {group.name}
                      </Tag>
                    ))
                  : "-"}
              </>
            )}
          />
          <Column
            title="角色"
            dataIndex="role"
            key="role"
            width={80}
            render={(text) => (
              <Tag color="green">
                {roleTypes.map((item, index) => (
                  <span key={index}>{item[text]}</span>
                ))}
              </Tag>
            )}
          />
          <Column
            title="状态"
            dataIndex="status"
            key="status"
            width={80}
            render={(text) => (
              <Tag color="green">
                {employeeStatuses.map((item, index) => (
                  <span key={index}>{item[text]}</span>
                ))}
              </Tag>
            )}
          />
          <Column
            title="操作"
            key="action"
            width={130}
            render={(chooseItem) => (
              <>
                <b
                  onClick={() => {
                    this.showDetailDrawer(chooseItem.uid);
                  }}
                  className="ant-green-link cursor"
                >
                  <EyeOutlined title="查看" />
                </b>
                <Divider type="vertical" />
                {chooseItem.status === "NEW" && (
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
                )}
                <b
                  onClick={() => {
                    this.setItem("edit", "UPDATE_EMPLOYEE", chooseItem);
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
              </>
            )}
          />
        </Table>
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
        {visible && this.renderEmployeeForm()}
        {detailsVisible && (
          <Details
            curInfo={this.state.curInfo}
            visible={detailsVisible}
            onClose={() => this.setState({ detailsVisible: false })}
            loading={detailsLoading}
          />
        )}
      </>
    );
  }
}

export default Employee;
