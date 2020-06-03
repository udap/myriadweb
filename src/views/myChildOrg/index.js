import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Modal,
  Pagination,
  Row,
  Col,
  Form,
  Drawer,
  notification,
  Divider,
  Cascader,
  Descriptions,
} from "antd";
import { PlusSquareFilled, ExclamationCircleOutlined } from "@ant-design/icons";
import comEvents from "../../utils/comEvents";
import { ChinaRegions } from "../../utils/china-regions";
import { orgStatusesList } from "../../utils/constants";
import {
  reqPermit,
  reqGetChildOrgs,
  reqAddChildOrg,
  reqDelChildOrg,
  reqPutChildOrg,
  regGetCurOrg,
} from "../../api";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import storageUtils from "../../utils/storageUtils";
import {
  Loading,
} from "../../components";
import "../../css/common.less";
const { confirm } = Modal;

class ChildOrg extends Component {
  state = {
    visible: false,
    inited: false,
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
  /*
获取列表数据
*/
  getChildOrg = async (currentPage, value) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      uid: storageUtils.getUser().orgUid,
      searchTxt: value ? value : this.state.searchTxt,
    };
    const result = await reqGetChildOrgs(storageUtils.getUser().orgUid, parmas);
    const cont = result && result.data ? result.data.content : [];
    let list = [];
    if (cont && cont.content && cont.content.length !== 0) {
      //处理一下数据格式
      for (var i = 0; i < cont.content.length; i++) {
        let item = cont.content[i];
        list.push({
          id: item.uid,
          uid: item.uid,
          address: item.address,
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
      inited: true,
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
    const result = await reqDelChildOrg(uid);
    this.setState({
      currentPage: 1,
    });
    this.getChildOrg(1);
  };
  //机构详情
  renderOrgDetailDrawer = () => {
    const DescriptionItem = ({ title, content }) => (
      <div className="site-description-item-profile-wrapper">
        <p className="site-description-item-profile-p-label">{title}:</p>
        {content ? content : "-"}
      </div>
    );
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
          title="下属机构详情"
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
  showDetalConfirm = (item) => {
    let that = this;
    return confirm({
      title: "确认删除下属机构【" + item.name + "】?",
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
    let curInfo = await regGetCurOrg(uid);
    let cont = curInfo.data.content ? curInfo.data.content : [];
    this.setState({
      organization: cont,
      [name]: true,
    });
  };
  
  backIndex = () => {
    this.props.history.push("/admin/myOrgs");
  };
  renderContent = () => {
    const {
      merchants,
      size,
      currentPage,
      total,
      searchTxt,
      showTagForm,
      showEdit,
      showView,
    } = this.state;
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "机构编码",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "银联商户号",
        dataIndex: "upCode",
        key: "upCode",
        responsive: ["md"],
      },
      {
        title: "电话",
        dataIndex: "phone",
        key: "phone",
        width: 130,
        responsive: ["md"],
      },
      {
        title: "地址",
        dataIndex: "address",
        key: "address",
        ellipsis: true,
        responsive: ["lg"],
      },
      {
        title: "操作",
        width: 250,
        render: (item) => {
          return (
            <div>
              <b
              onClick={() => {
                this.props.history.push({
                  pathname: "/admin/myChildEmployee/" + item.uid,
                  state: { item },
                });
              }}
              className="ant-green-link cursor"
            >
              下属机构员工
            </b>
            <Divider type="vertical" />
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
                    "showDetalConfirm",
                    item
                  );
                }}
                className="ant-pink-link cursor"
              >
                删除
              </b>
            </div>
          );
        },
      },
    ];
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="下属机构管理"
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
            <Col span={7}>
              <Form.Item name="searchTxt" label="查询条件">
                <Input placeholder="输入名称/编码/地址搜索" allowClear />
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
          rowKey={(record) => record.id}
          size="small"
          bordered
          dataSource={merchants}
          columns={columns}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                {record.address}
              </div>
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

        {showTagForm ? this.renderTagForm() : null}
        {showEdit ? this.renderOrgEditDrawer() : null}
        {showView ? this.renderOrgDetailDrawer() : null}
      </div>
    );
  };
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
  //编辑机构表单
  renderOrgEditDrawer = () => {
    return (
      <Drawer
        width={480}
        title={this.state.isNew ? "新增下属机构" : "编辑下属机构"}
        onClose={this.handleCancel}
        visible={this.state.showEdit}
      >
        {this._renderFormCont()}
      </Drawer>
    );
  };

  //机构编辑表单
  _renderFormCont = () => {
    const {
      province,
      city,
      district,
      fullName,
      name,
      licenseNo,
      phone,
      postalCode,
      street,
      address,
      code,
      upCode,
    } = this.state.organization;
    const orgName = storageUtils.getUser().orgName
    return (
      <div className="OrgFormDialog">
        <div class="grey-block">
        {this.state.isNew?`${'您正在为'+orgName+'创建下属机构'}`:`${'您正在编辑'+orgName+'的下属机构'}`}
          </div>
        <Form
          layout="vertical"
          name="basic"
          initialValues={{
            residence: [province, city, district],
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
                rules={[{ required: true },{min:8}]}
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
                <Input />
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
                <Cascader options={ChinaRegions} onChange={this.onChange} />
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
        </Form>
      </div>
    );
  };
  //提交更新请求
  onFinish = async (values) => {
    let that = this;
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
      upCode: values.upCode,
      parentOrgUid: storageUtils.getUser().orgUid,
    };
    let result;
    if (this.state.isNew) {
      result = await reqAddChildOrg(params);
    } else {
      result = await reqPutChildOrg(this.state.organization.uid, params);
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

  render() {
    return (
      <div style={{ height: "100%" }}>
        {this.state.inited ? this.renderContent() : <Loading />}
      </div>
    );
  }
}

export default ChildOrg;
