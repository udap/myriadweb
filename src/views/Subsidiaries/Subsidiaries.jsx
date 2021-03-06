import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Modal,
  Row,
  Col,
  Form,
  Drawer,
  notification,
  Divider,
  Cascader,
  Descriptions,
  message,
  Card,
  Checkbox,
} from "antd";
import { PlusSquareFilled, ExclamationCircleOutlined } from "@ant-design/icons";

import comEvents from "@utils/comEvents";
import { ChinaRegions } from "@utils/china-regions";
import { orgStatusesList } from "@utils/constants";
import {
  reqPermit,
  reqGetSubsidiaries,
  reqAddOrg,
  reqDelOrg,
  reqPutOrg,
  reqGetOrg,
} from "@api";
import defaultValidateMessages from "@utils/comFormErrorAlert";
import storageUtils from "@utils/storageUtils";
import "@css/common.less";
import { BranchSelect } from "@/components";

const { Column } = Table;

class Subsidiaries extends Component {
  state = {
    visible: false,
    initd: false,
    merchants: [],
    isNew: true,
    apCode: "",
    wpCode: "",
    upCode: "",
    authCode: "",
    orgUid: "",
    currentPage: 1,
    size: 20,
    total: 1,
    searchTxt: "",
    organization: {},
    showView: false,
    currentOrg: {
      uid: storageUtils.getUser().orgUid,
      name: storageUtils.getUser().orgFullName,
    },
    isBranchSelect: false,
    nested: false,
  };

  componentDidMount() {
    this.getChildOrg(1);
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
      showTagForm: false,
      showEdit: false,
      showView: false,
    });
  };

  // 获取列表数据
  getChildOrg = async (currentPage, _searchTxt, _nested) => {
    const { nested, searchTxt } = this.state;
    const params = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      uid: storageUtils.getUser().orgUid,
      searchTxt: _searchTxt ?? searchTxt,
      nested: _nested ?? nested,
    };
    const result = await reqGetSubsidiaries(
      storageUtils.getUser().orgUid,
      params
    );
    const cont = result && result.data ? result.data.content : [];
    let list = [];
    if (cont && cont.content && cont.content.length !== 0) {
      for (var i = 0; i < cont.content.length; i++) {
        let item = cont.content[i];
        list.push({
          id: item.uid,
          uid: item.uid,
          address: item.address,
          fullName: item.fullName,
          name: item.name,
          phone: item.phone,
          upCode: item.upCode,
          code: item.code,
        });
      }
    }

    this.totalPages =
      result && result.data && result.data.content
        ? result.data.content.totalElements
        : 1;
    this.setState({
      merchants: list,
      total:
        result && result.data && result.data.content
          ? result.data.content.totalElements
          : 1,
      initd: true,
      loading: false,
    });
  };

  searchValue = (value) => {
    this.setState({
      currentPage: 1,
      searchTxt: value.searchTxt,
    });
    this.getChildOrg(1, value.searchTxt);
  };

  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };

  delItem = async (uid) => {
    try {
      const result = await reqDelOrg(uid);
      if (result.data && result.data.retcode === 0) {
        notification.success({ message: "删除机构成功", description: "" });
        this.setState({
          currentPage: 1,
        });
        this.getChildOrg(1);
      }
    } catch (error) {}
  };

  //机构详情
  renderOrgDetailDrawer = () => {
    const {
      fullName,
      name,
      licenseNo,
      phone,
      address,
      code,
      upCode,
      postalCode,
      parent,
      status,
    } = this.state.organization;
    return (
      <div>
        <Drawer
          width={480}
          title="机构详情"
          onClose={this.handleCancel}
          visible={this.state.showView}
        >
          <Row>
            <Col span={24}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="名称">{fullName}</Descriptions.Item>
                <Descriptions.Item label="简称">{name}</Descriptions.Item>
                <Descriptions.Item label="机构编码">{code}</Descriptions.Item>
                <Descriptions.Item label="营业执照号码">
                  {licenseNo}
                </Descriptions.Item>
                <Descriptions.Item label="银联商户码">
                  {upCode}
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">{phone}</Descriptions.Item>
                <Descriptions.Item label="地址">{address}</Descriptions.Item>
                <Descriptions.Item label="邮政编码">
                  {postalCode}
                </Descriptions.Item>
                {parent.name ? (
                  <Descriptions.Item label="上级机构">
                    {parent.name}
                  </Descriptions.Item>
                ) : null}
                <Descriptions.Item label="机构状态">
                  {orgStatusesList.map((item, index) => (
                    <span key={index}>{item[status]}</span>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Drawer>
      </div>
    );
  };

  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getChildOrg(page);
  };

  showDetailConfirm = (item) => {
    let that = this;
    return Modal.confirm({
      title: "确认删除机构【" + item.name + "】?",
      icon: <ExclamationCircleOutlined />,
      okText: "确认",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        that.delItem(item.uid);
      },
      onCancel() {},
    });
  };

  //显示详情
  showDetailDrawer = (uid) => {
    this.getCurrentItemDetail(uid, "showView");
  };

  //获取详情
  getCurrentItemDetail = async (uid, name) => {
    let curInfo = await reqGetOrg(uid);
    let cont = curInfo.data.content ? curInfo.data.content : [];
    this.setState({
      organization: cont,
      [name]: true,
    });
  };

  backIndex = () => {
    this.props.history.push("/admin/myOrgs");
  };

  renderContent = () => {};

  addItem = () => {
    this.setState({
      showEdit: true,
      organization: {},
    });
  };

  showEdit = (item) => {
    this.setState({
      isNew: false,
    });
    this.getCurrentItemDetail(item.uid, "showEdit");
  };

  onDrawerClose = () => {
    this.setState({
      showEdit: false,
      // 重置为当前登录的机构
      currentOrg: {
        uid: storageUtils.getUser().orgUid,
        name: storageUtils.getUser().orgFullName,
      },
    });
  };

  //编辑机构表单
  renderOrgEditDrawer = () => {
    return (
      <Drawer
        width={480}
        title={this.state.isNew ? "新增机构" : "编辑机构"}
        onClose={this.onDrawerClose}
        visible={this.state.showEdit}
        destroyOnClose
      >
        {this._renderFormCont()}
      </Drawer>
    );
  };

  showBranchSelect = () => {
    const { isBranchSelect } = this.state;
    this.setState({ isBranchSelect: !isBranchSelect });
  };

  onSelectBranch = (selectedRows) => {
    this.setState({
      isBranchSelect: false,
      currentOrg: { uid: selectedRows[0].uid, name: selectedRows[0].fullName },
    });
  };

  onResetOrg = () => {
    this.setState({
      isBranchSelect: false,
      currentOrg: {
        uid: storageUtils.getUser().orgUid,
        name: storageUtils.getUser().orgFullName,
      },
    });
  };

  //机构编辑表单
  _renderFormCont = () => {
    const {
      currentOrg,
      isNew,
      isBranchSelect,
      organization: {
        fullName,
        name,
        licenseNo,
        phone,
        postalCode,
        street,
        address,
        code,
        upCode,
      },
    } = this.state;
    return (
      <Form
        layout="vertical"
        name="basic"
        initialValues={{
          residence: ["重庆市", "重庆市", "渝中区"],
          fullName: fullName,
          name: name,
          licenseNo: licenseNo,
          phone: phone,
          postalCode: postalCode,
          street: street,
          address: address,
          code: code,
          upCode: upCode,
        }}
        onFinish={this.onFinish}
        onFinishFailed={this.onFinishFailed}
        validateMessages={defaultValidateMessages.defaultValidateMessages}
      >
        <div className="grey-block" style={{ marginBottom: 24 }}>
          {isNew ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                您正在为【
                <span style={{ fontWeight: "bold" }}>{currentOrg.name}</span>】
                创建下属机构
              </div>
              <div style={{ padding: "0 6px" }}>
                <b
                  className="ant-green-link cursor"
                  onClick={this.showBranchSelect}
                >
                  下属机构
                </b>
                {currentOrg.uid !== storageUtils.getUser().orgUid && (
                  <>
                    <Divider type="vertical" />
                    <b
                      className="ant-green-link cursor"
                      onClick={this.onResetOrg}
                    >
                      重置
                    </b>
                  </>
                )}
              </div>
            </div>
          ) : (
            `${"您正在编辑" + fullName + "的信息"}`
          )}
        </div>
        {isBranchSelect ? (
          <Card>
            <BranchSelect
              orgUid={currentOrg.uid}
              onSelectBranch={this.onSelectBranch}
            />
          </Card>
        ) : (
          <>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="名称"
                  name="fullName"
                  rules={[{ required: true }, { max: 45 }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="简称"
                  name="name"
                  rules={[{ required: true }, { max: 20 }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="联系电话"
                  name="phone"
                  rules={[{ required: true }, { min: 8 }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="机构编码" name="code">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="营业执照号码" name="licenseNo">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="银联商户码" name="upCode">
                  <Input maxLength={15} placeholder="请输入15位银联商户码" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="residence"
                  label="地区"
                  rules={[
                    {
                      type: "array",
                      required: true,
                    },
                  ]}
                >
                  <Cascader options={ChinaRegions} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="邮政编码"
                  name="postalCode"
                  rules={[{ max: 6 }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="详细地址"
                  name="street"
                  rules={[{ required: true }, { max: 45 }]}
                >
                  <Input.TextArea allowClear />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    提交
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Form>
    );
  };

  //提交更新请求
  onFinish = async (values) => {
    const { currentOrg } = this.state;
    if (values.upCode && values.upCode.length !== 15) {
      message.error({
        content: "请输入15位银联商户码！",
      });
      return;
    }
    let params = {
      fullName: values.fullName,
      name: values.name,
      phone: values.phone ? values.phone : storageUtils.getUser().cellphone,
      licenseNo: values.licenseNo,
      postalCode: values.postalCode,
      street: values.street,
      province: values.residence[0],
      city: values.residence[1],
      district: values.residence[2],
      code: values.code,
      parentOrgUid: currentOrg.uid,
    };
    if (values.upCode) {
      params.upCode = values.upCode;
    }
    let result;
    if (this.state.isNew) {
      result = await reqAddOrg(params);
    } else {
      result = await reqPutOrg(this.state.organization.uid, params);
    }
    if (result.data.retcode === 0) {
      notification.success({
        message: "操作成功！",
      });
      //刷新一下新的机构信息
      this.getChildOrg(1);
      this.handleCancel();
    }
  };

  onCheckboxChange = (element) => {
    const { checked } = element.target;
    this.setState({ nested: checked });
    this.getChildOrg(1, null, checked);
  };

  render() {
    const {
      merchants,
      size,
      currentPage,
      showTagForm,
      showEdit,
      showView,
      loading,
      nested,
    } = this.state;
    return (
      <>
        <PageHeader
          className="site-page-header-responsive cont"
          title="下属机构"
          extra={[
            <PlusSquareFilled
              key="add"
              className="setIcon"
              onClick={() => {
                let self = this;
                self.setState({
                  isNew: true,
                });
                comEvents.hasPower(
                  self,
                  reqPermit,
                  "CREATE_SUBSIDIARY",
                  "addItem"
                );
              }}
            />,
          ]}
          onBack={this.backIndex}
        />
        <Form
          onFinish={this.searchValue}
          layout="horizontal"
          name="advanced_search"
          className="ant-advanced-search-form"
          initialValues={{
            searchTxt: "",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col>
              <Form.Item name="nested" label="查询条件">
                <Checkbox onChange={this.onCheckboxChange} checked={nested}>
                  包含下属机构
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="searchTxt" label="搜索">
                <Input placeholder="请输入机构名、编号、地址" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Button
                  type="primary"
                  className="cursor searchBtn"
                  htmlType="submit"
                  loading={loading}
                  onClick={this.enterLoading}
                >
                  查询
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Table
          rowKey={(record) => record.id}
          size="small"
          bordered
          dataSource={merchants}
          // columns={columns}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>{record.address}</div>
            ),
            onExpand: (expanded, record) => {
              if (expanded) {
                this.setState({ expandedRowKeys: [record.id] });
              } else {
                this.setState({ expandedRowKeys: [] });
              }
            },
            expandedRowKeys: this.state.expandedRowKeys,
          }}
          pagination={{
            showSizeChanger: true,
            pageSize: size,
            current: currentPage,
            onChange: this.handleTableChange,
            total: this.totalPages,
            showTotal: (total) => `总共 ${total} 条数据`,
          }}
        >
          <Column
            title="机构名"
            dataIndex="fullName"
            key="fullName"
            width={200}
          />
          <Column title="简称" dataIndex="name" key="name" />
          <Column title="编号" dataIndex="code" key="code" />
          <Column title="编号" dataIndex="code" key="code" />
          {/* <Column title="营业执照" dataIndex="licenseNo" key="licenseNo" /> */}
          <Column
            title="银联商户号"
            dataIndex="upCode"
            key="upCode"
            responsive={["md"]}
          />
          <Column
            title="电话"
            dataIndex="phone"
            key="phone"
            width={130}
            responsive={["md"]}
          />
          <Column
            title="地址"
            dataIndex="address"
            key="address"
            ellipsis={true}
            responsive={["lg"]}
          />
          <Column
            title="操作"
            width={180}
            render={(item) => {
              return (
                <div>
                  <b
                    className="ant-green-link cursor"
                    onClick={() => {
                      this.showDetailDrawer(item.uid);
                    }}
                  >
                    查看
                  </b>
                  <Divider type="vertical" />
                  <b
                    className="ant-blue-link cursor"
                    onClick={() => {
                      let self = this;
                      comEvents.hasPower(
                        self,
                        reqPermit,
                        "UPDATE_ORGANIZATION",
                        "showEdit",
                        item
                      );
                    }}
                  >
                    编辑
                  </b>
                  <Divider type="vertical" />
                  <b
                    onClick={() => {
                      let self = this;
                      comEvents.hasPower(
                        self,
                        reqPermit,
                        "DELETE_SUBSIDIARY",
                        "showDetailConfirm",
                        item
                      );
                    }}
                    className="ant-pink-link cursor"
                  >
                    删除
                  </b>
                </div>
              );
            }}
          />
        </Table>
        {showTagForm && this.renderTagForm()}
        {showEdit && this.renderOrgEditDrawer()}
        {showView && this.renderOrgDetailDrawer()}
      </>
    );
  }
}

export default Subsidiaries;
