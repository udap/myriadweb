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
  Radio,
} from "antd";
import { PlusSquareFilled, ExclamationCircleOutlined } from "@ant-design/icons";
import comEvents from "../../utils/comEvents";
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
} from "../../components";
import MerchantSelect from "./merchantSelect";
import "../../css/common.less";
import "./index.less";
const { confirm } = Modal;

const leftTableColumns = [
  {
    dataIndex: "title",
    title: "可选公共标签",
  },
  // {
  //   dataIndex: "tag",
  //   title: "类型",
  //   render: (tag) => <Tag>{tag}</Tag>,
  // },
];
const rightTableColumns = [
  {
    dataIndex: "title",
    title: "已选公共标签",
  },
];

class Merchant extends Component {
  state = {
    visible: false,
    inited: false,
    addMode: 1,
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
    expandedRowKeys: [],
  };
  componentDidMount() {
    this.getMerchants(1);
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
  getMerchants = async (currentPage, value) => {
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
    this.getMerchants(1, value.searchTxt);
  };

  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  addItem = () => {
    // let isAdmin = storageUtils.getUser().admin;
    // if (!isAdmin) {
    //   notification.info({ message: "对不起，您没有权限！" });
    //   return false;
    // }
    this.props.history.push("/admin/merchant/edit/new");
  };
  delItem = async (uid) => {
    // let isAdmin = storageUtils.getUser().admin;
    // if (!isAdmin) {
    //   notification.info({ message: "对不起，您没有权限！" });
    //   return false;
    // }
    const result = await reqDelMerchant(uid);
    this.setState({
      currentPage: 1,
    });
    this.getMerchants(1);
  };
  onFinish = async (values) => {
    let params = {
      apCode: values.apCode,
      wpCode: values.wpCode,
      upCode: values.upCode,
      authCode: values.authCode,
      merchantUid: values.merchantUid,
      orgUid: storageUtils.getUser().orgUid,
    };

    const result = await reqAddMerchant(params);
    if (result) {
      this.setState({
        visible: false,
      });
      this.getMerchants(1);
    }
  };
  //授权码
  renderAddForm = () => {
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
          rules={[
            { max: 45 },
            {
              message: "银联商户码格式不正确",
              pattern: /^[0-9a-zA-Z]*$/g,
            },
          ]}
        >
          <Input disabled={this.state.isNew ? false : true} />
        </Form.Item>

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
    this.getMerchants(page);
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

  addNewTags = async (chooseItem, newTags) => {
    let result = await reqPutMerchantTags(chooseItem.uid, newTags);
    if (result.data.retcode !== 1) {
      //刷新列表数据
      this.getMerchant(this.state.currentPage);
      notification.success({ message: "标签设置成功" });
    }
  };

  //提交数据
  submitCommonTags = async () => {
    this.setState({
      inited: false,
    });
    let result;
    let { chooseItem, targetKeys } = this.state;
    result = await reqPutMerchantTags(chooseItem.uid, targetKeys);
    if (result.data.retcode !== 1) {
      //刷新列表数据
      this.getMerchant(this.state.currentPage);
      notification.success({ message: "标签设置成功" });
      this.setState({
        showTagForm: false,
        chooseItem: {
          tags: targetKeys,
        },
      });
    }
  };
  //添加展示抽屉
  showTagsDrawer = (item) => {
    this.setState({
      showTagForm: true,
      chooseItem: item,
      targetKeys: item.tags,
    });
    this.reqGetTags(1);
  };
  //树控件的数据
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
      type: "MERCHANT",
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentTagPage,
      size: 1000, //size,
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
        title="设置标签"
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
          onFinish={this.submitCommonTags}
        >
          <div class="grey-block">选择公共标签设置</div>
          <Form.Item name="tag">
            <TreeSelectComponent
              mockData={tagsData}
              targetKeys={chooseItem.tags ? chooseItem.tags : targetKeys}
              choosehandle={this.choosehandle}
              showSearch={true}
              leftTableColumns={leftTableColumns}
              rightTableColumns={rightTableColumns}
              //totalTagPages={totalTagPages}
              //handleTagTableChange={this.handleTagTableChange}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={this.state.loading}
            >
              提交
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    );
  };

  onChangeAddMode = (e) => {
    this.setState({
      addMode: e.target.value,
    });
  };

  onSelectMerchant = async (selectedRows) => {
    let orgId = storageUtils.getUser().orgId;
    // let isCurrentOrg = selectedRows[0].id === orgId ? true : false;
    let params = {
      merchantUid: selectedRows[0].uid,
      orgUid: storageUtils.getUser().orgUid,
    };
    const result = await reqAddMerchant(params);
    if (result) {
      this.setState({
        visible: false,
        addMode: 1,
      });
      this.getMerchants(1);
    } else {
      this.setState({
        visible: false,
      })
    }
  };


  renderMerchantSelect = () => {
    return  <MerchantSelect onSelectMerchant={this.onSelectMerchant} />
  }

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
                onClick={this.showTagsDrawer.bind(this, item)}
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
                    "DELETE_MERCHANT",
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
                  "CREATE_MERCHANT",
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
          rowKey={(record) => record.id}
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
                  onChange={this.addNewTags.bind(this, record)}
                />
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
        <Drawer
          width={480}
          title="添加入驻商户"
          visible={this.state.visible}
          onClose={this.handleCancel}
          footer={null}
        >
          <Radio.Group onChange={this.onChangeAddMode} value={this.state.addMode}>
            <Radio value={1}>使用商户授权码添加</Radio>
            <Radio value={2}>选择上级机构的入驻商户</Radio>
          </Radio.Group>
          { this.state.addMode == 1 ? this.renderAddForm() : this.renderMerchantSelect()}
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
