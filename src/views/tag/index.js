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
  Row,
  Col,
} from "antd";
import {
  PlusSquareFilled,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import { reqPermit, reqPostTags, reqDelTag, reqGetTags } from "../../api";
import { tagStatuses } from "../../utils/constants";
import { Loading } from "../../components";
import comEvents from "../../utils/comEvents";
import "../../css/common.less";
const { confirm } = Modal;
const { Option } = Select;
class myTag extends Component {
  state = {
    inited: false,
    tags: [],
    addNew: false,
    currentPage: 1,
    size: 20,
    total: 1,
    //new
    name: "",
    desc: "",
    type: "CUSTOMER",
    visible: false,
    searchTxt: null,
    searchType: null,
    loading: false,
  };
  componentDidMount() {
    this.getTags(1);
  }
  getTags = async (currentPage, searchTxt, searchType) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
      type: searchType ? searchType : this.state.searchType,
    };
    const result = await reqGetTags(parmas);
    const cont = result && result.data  && result.data.content? result.data.content : [];
    this.totalPages =
      result && result.data&& result.data.content ? result.data.content.totalElements : 1;
    this.setState({
      tags: cont.content,
      total: result && result.data&& result.data.content ? result.data.content.totalElements : 1,
      inited: true,
      loading: false,
    });
  };
  newTag = () => {
    this.setState({
      visible: true,
    });
  };
  onFinish = async (values) => {
    let params = {
      name: values.name,
      desc: values.desc,
      type: values.type,
    };
    const result = await reqPostTags(params);
    if (result.data.retcode === 0) {
      notification.success({ message: "添加成功" });
      this.setState({
        visible: false,
      });
      this.getTags(1);
    }
  };
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };
  //标签表单
  renderForm = (data) => {
    const { name, desc, type, visible } = this.state;
    return (
      <Drawer
        width={480}
        title="添加标签"
        visible={visible}
        onClose={this.handleCancel}
        footer={null}
      >
        <Form
          name="basic"
          layout="vertical"
          initialValues={{
            name: name,
            desc: desc,
            type: type,
          }}
          onFinish={this.onFinish}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select placeholder="请选择类型" allowClear>
              {tagStatuses.map((item) => {
                return <Option value={item.value}>{item.name}</Option>;
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true }, { max: 10 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="desc" rules={[{ max: 64 }]}>
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    );
  };
  delConfirm = async (chooseItem) => {
    let that = this;
    confirm({
      title: "确认删除标签【" + chooseItem.name + "】吗?",
      icon: <ExclamationCircleOutlined />,
      okText: "确认",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        that.deleteItem(chooseItem.id);
      },
    });
  };
  deleteItem = async (id) => {
    let resultDel = await reqDelTag(id);
    if (resultDel.data.retcode === 0) {
      notification.success({ message: "删除成功" });
      this.getTags(1);
    }
  };
  /*分页 */
  handleTableChange = (page) => {
    this.setState({
      inited: false,
      currentPage: page,
    });
    this.getTags(page);
  };
  renderContent = () => {
    const { size, currentPage, visible, tags } = this.state;
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "描述",
        dataIndex: "desc",
      },
      {
        title: "类型",
        width: 100,
        render: (chooseItem) => {
          let { type } = chooseItem;
          return (
            <span>
              <Tag color="green">
                <span key="type">
                  {tagStatuses.map((item, index) =>
                    type === item.value ? item.name : null
                  )}
                </span>
              </Tag>
            </span>
          );
        },
      },
      {
        title: "操作",
        key: "action",
        width: 100,
        render: (chooseItem) => (
          <div>
            <b
              onClick={() => {
                let self = this;
                comEvents.hasPower(
                  self,
                  reqPermit,
                  "DELETE_TAG",
                  "delConfirm",
                  chooseItem
                );
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
        <Table
          rowKey="id"
          size="small"
          bordered
          dataSource={tags}
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
        {visible ? this.renderForm() : null}
      </div>
    );
  };
  /*搜索*/
  searchValue = (value) => {
    console.log("myTag -> searchValue -> value", value)
    this.setState({
      searchTxt: value.searchTxt,
      searchType: value.searchType,
      currentPage: 1,
    });
    this.getTags(1, value.searchTxt, value.searchType);
  };
  /*搜索loding*/
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  render() {
    let { searchTxt, searchType } = this.state;
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="公共标签"
          extra={[
            <PlusSquareFilled
              key="add"
              className="setIcon"
              onClick={() => {
                let self = this;
                comEvents.hasPower(self, reqPermit, "CREATE_TAG", "newTag");
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
            searchTxt: searchTxt,
          }}
        >
          <Row>
            <Col span={8}>
              <Form.Item name="searchTxt" label="查询条件">
                <Input
                  value={searchTxt}
                  placeholder="请输入名称查询"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="searchType" >
                <Select placeholder="请选择标签类型" allowClear>
                  {tagStatuses.map((item) => {
                    return <Option value={item.value}>{item.name}</Option>;
                  })}
                </Select>
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
        {this.state.inited ? this.renderContent() : <Loading />}
      </div>
    );
  }
}
export default myTag;
