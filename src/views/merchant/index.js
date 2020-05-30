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
  Tag,
  Radio,
  Divider,
} from "antd";
import { PlusSquareFilled, ExclamationCircleOutlined } from "@ant-design/icons";
import comEvents from "../../utils/comEvents";
import { tagStatuses } from "../../utils/constants";
import {
  reqPermit,
  reqAddMerchant,
  reqDelMerchant,
  reqPutMerchantTags,
  reqGetTags,
} from "../../api";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import storageUtils from "../../utils/storageUtils";
import { reqGetMerchants } from "../../api";
import {
  Loading,
  EditableTagGroup,
  TreeSelectComponent,
  TransferComponent,
} from "../../components";
import "../../css/common.less";
import "./index.less";
const { confirm } = Modal;

class Merchant extends Component {
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
    chooseItem: null,
    showTagForm: false,
    radio: "common",
    tagsData: [],
    targetKeys: [],
    targetTitles: [],
    totalTagPages: 0,
    currentTagPage: 1,
  };
  componentDidMount() {
    this.getMerchant(1);
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
      radio: "common",
    });
  };
  /*
获取列表数据
*/
  getMerchant = async (currentPage, value) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt: value ? value : this.state.searchTxt,
    };
    const result = await reqGetMerchants(parmas);
    const cont = result && result.data ? result.data.content : [];
    let list = [];
    if (cont && cont.content && cont.content.length !== 0) {
      //处理一下数据格式
      for (var i = 0; i < cont.content.length; i++) {
        let item = cont.content[i].merchant;

        list.push({
          id: item.id,
          uid: item.uid,
          address: item.address,
          name: item.name,
          phone: item.phone,
          upCode: item.upCode,
          authorizedAt: cont.content[i].authorizedAt,
          tags: cont.content[i].tags,
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
    this.getMerchant(1, value.searchTxt);
  };

  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  addItem = () => {
    let isAdmin = storageUtils.getUser().admin;
    if (!isAdmin) {
      notification.info({ message: "对不起，您没有权限！" });
      return false;
    }
    this.props.history.push("/admin/merchant/edit/new");
  };
  delItem = async (uid) => {
    let isAdmin = storageUtils.getUser().admin;
    if (!isAdmin) {
      notification.info({ message: "对不起，您没有权限！" });
      return false;
    }
    const result = await reqDelMerchant(uid);
    this.getMerchant(1);
  };
  onFinish = async (values) => {
    let params = {
      apCode: values.apCode,
      wpCode: values.wpCode,
      upCode: values.upCode,
      authCode: values.authCode,
      orgUid: storageUtils.getUser().orgUid,
    };

    const result = await reqAddMerchant(params);
    if (result) {
      this.setState({
        visible: false,
      });
      this.getMerchant(1);
    }
  };
  //授权码
  renderForm = () => {
    const { apCode, wpCode, upCode, authCode } = this.state;
    return (
      <Form
        layout="vertical"
        name="basic"
        initialValues={{
          apCode: apCode,
          wpCode: wpCode,
          upCode: upCode,
          authCode: authCode,
        }}
        onFinish={this.onFinish}
        onFinishFailed={this.onFinishFailed}
        validateMessages={defaultValidateMessages.defaultValidateMessages}
      >
        <p class="description">
          添加入驻商户需要获得相关商户授权。请向相关商户索取授权码及银联商户码。
        </p>
        <Form.Item label="授权码" name="authCode" rules={[{ required: true }]}>
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>
        <Form.Item
          label="银联商户码"
          name="upCode"
          rules={[{ required: true }, { max: 45 }]}
        >
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>
        {/* <Form.Item label="微信收付款号" name="wpCode" rules={[{ max: 45 }]}>
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>

        <Form.Item label="阿里收付款号" name="apCode" rules={[{ max: 45 }]}>
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item> */}

        {this.state.isNew ? (
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={this.state.loading}
            >
              提交
            </Button>
          </Form.Item>
        ) : null}
      </Form>
    );
  };
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getMerchant(page);
  };
  showDetalConfirm = (item) => {
    let that = this;
    return confirm({
      title: "确认删除商户【" + item.name + "】?",
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
  //提交数据
  newTags = async (newTags) => {
    let result;
    let { tagsData, radio, chooseItem, targetKeys, targetTitles } = this.state;
    if (radio === "common" && targetKeys.length === 0) {
      notification.error({ message: "权限不能为空" });
      return false;
    }
    let arr = comEvents.compareTwoArrayEqual(targetKeys, tagsData);
    let tag = radio === "free" ? newTags : arr;
    result = await reqPutMerchantTags(chooseItem.uid, tag);
    if (result.data.retcode !== 1) {
      //刷新列表数据
      this.getMerchant(1);
      if (radio === "common") {
        notification.success({ message: "添加成功" });
        this.setState({
          showTagForm: false,
        });
      }
    }
  };
  //添加展示抽屉
  addTags = (item) => {
    this.setState({
      showTagForm: true,
      chooseItem: item,
      targetKeys: item.tags,
    });
    this.reqGetTags(1);
  };
  //组织树控件的数据
  tree = (cont) => {
    const list = [];
    for (let i = 0; i < cont.length; i++) {
      const key = cont[i].name; //`${path}-${i}`;
      const treeNode = {
        title: cont[i].name,
        key,
        description: cont[i].description,
        tag: cont[i].type,
      };
      list.push(treeNode);
    }
    return list;
  };
  //获取公共标签
  reqGetTags = async (currentPage) => {
    let { size } = this.state;
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentTagPage,
      size: 1000//size,
    };
    const result = await reqGetTags(parmas);
    let cont =
      result &&
      result.data &&
      result.data.content &&
      result.data.content.content
        ? result.data.content.content
        : [];
    const tree = this.tree(cont);
    this.totalTagPages = cont.totalElements ? cont.totalElements : 1;
    this.setState({
      tagsData: tree,
      //totalTagPages:
    });
  };
  onRadioChange = (e) => {
    this.setState({
      radio: e.target.value,
    });
  };
  choosehandle = (value, arr) => {
    this.setState({
      targetKeys: value,
      targetTitles: arr,
    });
  };
  /*分页 */
  handleTagTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getTags(page);
  };
  renderTagForm = () => {
    const {
      showTagForm,
      radio,
      chooseItem,
      tagsData,
      targetKeys,
      totalTagPages,
    } = this.state;
    return (
      <Drawer
        width={480}
        title="添加标签"
        visible={showTagForm}
        onClose={this.handleCancel}
        footer={null}
      >
        <Form
          layout="vertical"
          name="basic"
          initialValues={{
            radio: radio,
            tag: [],
          }}
          onFinish={this.newTags}
        >
          <Form.Item name="radio" label="标签类型">
            <Radio.Group onChange={this.onRadioChange}>
              <Radio value="common">公共标签</Radio>
              <Radio value="free">新标签</Radio>
            </Radio.Group>
          </Form.Item>
          {radio === "free" ? (
            <Form.Item label="标签" name="tag">
              <EditableTagGroup
                tags={chooseItem.tags ? chooseItem.tags : []}
                newTags={this.newTags}
              />
            </Form.Item>
          ) : (
            <Form.Item label="标签" name="tag">
              <TreeSelectComponent
                mockData={tagsData}
                targetKeys={chooseItem.tags ? chooseItem.tags : targetKeys}
                choosehandle={this.choosehandle}
                showSearch={true}
                //totalTagPages={totalTagPages}
                //handleTagTableChange={this.handleTagTableChange}
              />
            </Form.Item>
          )}
          {radio === "free" ? (
            <Form.Item>
              <Button type="primary" onClick={this.handleCancel}>
                取消
              </Button>
            </Form.Item>
          ) : (
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={this.state.loading}
              >
                提交
              </Button>
            </Form.Item>
          )}
        </Form>
      </Drawer>
    );
  };
  renderContent = () => {
    const {
      merchants,
      size,
      currentPage,
      total,
      searchTxt,
      showTagForm,
    } = this.state;
    //名字 银联商户码(upCode) 电话 地址
    const columns = [
      {
        title: "商户名",
        dataIndex: "name",
        key: "name",
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
        width: 120,
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
        title: "入驻时间",
        dataIndex: "authorizedAt",
        key: "authorizedAt",
        width: 120,
        responsive: ["lg"],
      },
      {
        title: "操作",
        width: 100,
        render: (item) => {
          return (
            <div>
              <b
                className="ant-green-link cursor"
                onClick={this.addTags.bind(this, item)}
              >
                标签
              </b>
              <Divider type="vertical" />
              <b
                onClick={() => {
                  let self = this;
                  comEvents.hasPower(
                    self,
                    reqPermit,
                    "MANAGE_ORGANIZATION",
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
          title="入驻商户"
          extra={[
            <PlusSquareFilled
              key="add"
              className="setIcon"
              onClick={() => {
                let self = this;
                comEvents.hasPower(
                  self,
                  reqPermit,
                  "MANAGE_ORGANIZATION",
                  "showModal"
                );
              }}
            />,
          ]}
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
                <Input
                  placeholder="输入名字/标签/商户号/电话/地址搜索"
                  allowClear
                />
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
          rowKey="id"
          size="small"
          bordered
          dataSource={merchants}
          columns={columns}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                <EditableTagGroup
                  tags={record.tags ? record.tags : []}
                  newTags={this.newTags.bind(this, record)}
                />
              </div>
            ),
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
        <Drawer
          width={400}
          title="添加入驻商户"
          visible={this.state.visible}
          onClose={this.handleCancel}
          footer={null}
        >
          {this.renderForm()}
        </Drawer>

        {showTagForm ? this.renderTagForm() : null}
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

export default Merchant;
