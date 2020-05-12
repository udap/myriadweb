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
} from "antd";
import {
  PlusSquareFilled,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { reqAddMerchant, reqDelMerchant } from "../../api";
import defaultValidateMessages from "../../utils/comFormErrorAlert";

import storageUtils from "../../utils/storageUtils";
import { reqGetMerchants } from "../../api";
import { Loading } from "../../components";
import "../../css/common.less";

const { confirm } = Modal;
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

class Merchant extends Component {
  state = {
    visible: false,
    inited: false,
    campaigns: [],
    isNew: true,
    apCode: "",
    wpCode: "",
    upCode: "",
    authCode: "",
    orgUid: "",
    currentPage: 1,
    size: 15,
    total: 1,
    searchTxt: "",
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
      searchTxt: value, //this.state.searchTxt,
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
          upCode: cont.content[i].upCode,
        });
      }
    }

    this.totalPages =
      result && result.data && result.data.content
        ? result.data.content.totalElements
        : 1;
    this.setState({
      campaigns: list,
      total:
        result && result.data && result.data.content
          ? result.data.content.totalElements
          : 1,
      inited: true,
      searchTxt: "",
      loading: false,
    });
  };
  searchValue = (value) => {
    this.setState({
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
    this.props.history.push("/admin/merchant/edit/new");
  };
  delItem = async (uid) => {
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

  renderForm = () => {
    const { apCode, wpCode, upCode, authCode } = this.state;

    return (
      <Form
        {...layout}
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
          <Form.Item {...tailLayout}>
            <Button
              type="primary"
              htmlType="submit"
              loading={this.state.loading}
            >
              保存
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
  renderContent = () => {
    const { campaigns, size, currentPage, total, searchTxt } = this.state;
    //名字 银联商户码(upCode) 电话 地址
    const columns = [
      {
        title: "名字",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "银联商户号",
        dataIndex: "upCode",
        key: "upCode",
      },

      {
        title: "电话",
        dataIndex: "phone",
        key: "phone",
      },
      {
        title: "地址",
        dataIndex: "address",
        key: "address",
      },
      {
        title: "操作",
        width: 100,
        render: (item) => {
          return (
            <b
              onClick={() => {
                let that = this;
                confirm({
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
              }}
              className="ant-pink-link cursor"
            >
              删除
            </b>
          );
        },
      },
    ];
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="商户列表"
          extra={[
            <PlusSquareFilled className="setIcon" onClick={this.showModal} />,
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
            <Col span={9}>
              <Form.Item name="searchTxt" label="查询条件">
                <Input
                  placeholder="请输入名字、银联商户号 、电话或地址进行搜索"
                  // name="searchTxt"
                  //value={searchTxt}
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
        <Modal
          title="添加入驻商户"
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          {this.renderForm()}
        </Modal>
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
