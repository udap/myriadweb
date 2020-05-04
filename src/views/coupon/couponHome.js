import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Tag,
  Divider,
  message,
  Modal,
  notification,
  Checkbox,
  Popconfirm,
  Form,
  Row,
  Col,
  Select,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FolderViewOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import storageUtils from "../../utils/storageUtils";
import {
  reqGetCoupons,
  reqDelCampaign,
  reqPublishDis,
  reqGetClients,
} from "../../api";
import { Loading } from "../../components";
import { couponType } from "../../utils/memoryUtils";
import comEvents from "../../utils/comEvents";
import "../../css/common.less";
import "./index.less";

const style = {
  fontSize: "20px",
  color: "#1890ff",
  marginLeft: "10px",
};
const formItemLayout = {
  labelCol: {
    //span: 6,
  },
  wrapperCol: {
    //span: 6,
  },
};
const { Search } = Input;
const { confirm } = Modal;
const { Option } = Select;

const renderContent = (value, row, index) => {
  const obj = {
    children: value,
    props: {},
  };
  return obj;
};

class CouponHome extends Component {
  state = {
    inited: false,
    campaigns: [],
    addNew: false,
    publisherId: storageUtils.getUser().orgId,
    ownerId: storageUtils.getUser().id,
    hasChoose: false,
    merchantCode: "",
    codeType: "UPCODE",
    currentPage: 1,
    size: 20,
    total: 0,
    owner: true,
    publisher: false,
    visible: false,
    /**发布客户 */
    current: 1,
    listSize: 5,
    listTotal: 1,
    listData: [],
    partyId: "",
    clientId: "",
    /*搜索框 */
    searchClientTxt: "",
    loading:false
  };
  componentDidMount() {
    this.getMarkets(null, 1);
  }
  componentWillMount() {
    this.initColumns();
  }
  publishItem = async (clientId) => {
    const parmas = {
      voucherId: this.state.partyId,
      customerId: clientId,
    };
    //customerId-客户弹窗选择
    const result = await reqPublishDis(parmas);
    console.log("CouponHome -> publishItem -> result", result);
    //status;票券发券
    this.getMarkets(null, this.state.currentPage);
    this.setState({
      visible: false,
    });
    if (result && result.data && result.data.status === "SUCCESS") {
      //PENDING表示正在分配或者发放，FAILED表示数据错误，终止处理，SUCCESS表示处理成功
      notification.success({
        message: "票券发放成功",
      });
    } else {
      notification.error({
        message: "票券发放失败",
        onClick: () => {},
      });
      
    }
  };
  initColumns() {
    //券号，关联的活动名称，券的类型，有效期，状态，拥有者
    this.columns = [
      {
        title: "券号",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "营销活动",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "标签",
        dataIndex: "type",
        key: "type",
        render: (text) => {
          return <div>{text ? text : "-"}</div>;
        },
      },
      {
        title: "有效期",
        colSpan: 2,
        dataIndex: "effective",
        key: "effective",
        render: renderContent,
        width: 110,
      },
      {
        title: "expiry",
        colSpan: 0,
        dataIndex: "expiry",
        width: 110,
        render: (text) => {
          return (
            <div>{text ? comEvents.getDateStr(-1, new Date(text)) : "-"}</div>
          );
        },
      },
      {
        title: "折扣",
        dataIndex: "valueOff",
        key: "valueOff",
        render: (text) => {
          return <div>¥{text}</div>;
        },
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (text) => {
          return (
            <Tag color="green" key={text}>
              {couponType.map((item, index) => (
                <span key={index}>{item[text]}</span>
              ))}
            </Tag>
          );
        },
      },
      {
        title: "操作",
        //fixed: "right",
        render: (chooseItem) => {
          return (
            <div>
              {chooseItem.status === "NEW" ? (
                <b
                  onClick={() => {
                    this.showList(chooseItem.id);
                  }}
                  className="ant-blue-link cursor"
                >
                  发放
                </b>
              ) : (
                "-"
              )}
            </div>
          );
        },
      },
    ];
    this.listColumns = [
      {
        title: "客户名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "手机号码",
        dataIndex: "cellphone",
        key: "cellphone",
      },
      {
        title: "操作",
        width: "160",
        render: (item) => {
          const { id } = item;
          return (
            <span>
              <b
                onClick={() => {
                  this.publishItem(id);
                }}
                className="ant-green-link cursor"
              >
                发放
              </b>
            </span>
          );
        },
      },
    ];
  }

  /*
获取列表数据
*/
  getMarkets = async (values, currentPage, size) => {
    let parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: size ? size : this.state.size,
      orgUid: storageUtils.getUser().orgUid,
      ownerId: this.state.owner ? this.state.ownerId : "",
      issuerId: this.state.publisher ? this.state.publisherId : "",
      merchantCode: values ? values.merchantCode : "",
      codeType: this.state.codeType,
    };
    if (!this.state.owner && !this.state.publisher) {
      message.info("请选择查询条件");
      return false;
    }
    const result = await reqGetCoupons(parmas);
    const cont = result && result.data ? result.data.entries : [];
    let data = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.length; i++) {
        data.push({
          key: i,
          id: cont[i].id,
          owner: cont[i].owner,
          code: cont[i].code,
          type: cont[i].category,
          name: cont[i].campaign.name,
          valueOff: (cont[i].config.discount.valueOff / 100).toFixed(2),
          effective: cont[i].effective,
          expiry: cont[i].expiry,
          status: cont[i].status,
        });
      }
    }
    this.totalPages =
      result && result.data ? result.data.total * result.data.size : 1;
    this.setState({
      inited: true,
      campaigns: data,
      //total: result.data ? result.data.total * result.data.size : "",
      searchTxt: "",
      loading: false,
    });
    //parseInt((this.receipts.length - 1) / PAGE_SIZE) + 1;//
  };
  onChange = (values) => {
    if (values.length !== 0) {
      this.setState({
        hasChoose: true,
        chooseValue: values,
        merchantCode: values.merchantCode,
      });
      //this.getMarkets(values, 0);
    }
  };
  handleChange = (value) => {
    this.setState({
      codeType: value,
    });
  };
  handleClientChange = (e) => {
    console.log("CouponHome -> handleClientChange -> value", e.target);
    this.setState({
      searchClientTxt: e.target.value,
    });
  };
  searchValue = (value) => {
    // this.setState({
    //   searchClientTxt: value.searchClientTxt,
    // });
    this.getClient(1, this.state.searchClientTxt);
  };
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  onFinish = (values) => {
    console.log("CouponHome -> onFinish -> values", values)
    this.getMarkets(values, 1);
  };
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getMarkets(null, page);
  };

  handleListTableChange = (page) => {
    this.setState({
      current: page,
    });
    this.getClient(page);
  };
  onCheckBoxChange = (e) => {
    this.setState({
      [e.target.name]: e.target.checked,
    });
  };
  showList = (partyId) => {
    this.setState({
      partyId: partyId,
      visible: true,
      searchClientTxt: "",
    });
    this.getClient(1, "");
  };
  handleCancel = () => {
    this.setState({
      visible: false,
      searchClientTxt: "",
    });
  };
  /*
获取选择列表数据 加号
*/
  getClient = async (currentPage, searchTxt) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.current,
      size: this.state.listSize,
      orgUid: storageUtils.getUser().orgUid,
      restricted: true,
      searchTxt: searchTxt ? searchTxt : "",
    };
    const result = await reqGetClients(parmas);
    const cont = result && result.data ? result.data.content : [];
    let data = [];
    if (cont.length !== 0) {
      for (let i = 0; i < cont.content.length; i++) {
        data.push({
          key: i,
          uid: cont.content[i].uid,
          id: cont.content[i].id,
          name: cont.content[i].name,
          cellphone: cont.content[i].cellphone,
        });
      }
    }
    this.totalListPages = result && result.data ? cont.totalElements : 1;
    this.setState({
      listData: data,
      tolistTotaltal: result && result.data ? cont.totalElements : 1,
      searchClientTxt:'',
      loading: false,
      // inited: true,
    });
  };

  renderContent = () => {
    const {
      campaigns,
      size,
      owner,
      ownerId,
      publisher,
      publisherId,
      total,
      currentPage,
      /*客户 */
      current,
      listSize,
      listTotal,
      listData,
      searchClientTxt,
    } = this.state;

    this.options = [
      { label: "我的", name: "ownerId", value: ownerId },
      { label: "我的机构", name: "publisherId", value: publisherId },
    ];
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="票券管理"
        ></PageHeader>

        <Form
          {...formItemLayout}
          onFinish={this.onFinish}
          layout="horizontal"
          name="advanced_search"
          className="ant-advanced-search-form"
          initialValues={{
            merchantCode: "",
            group: [ownerId],
          }}
        >
          <Row>
            <Col>
              <Form.Item name="group" label="查询条件">
                <Checkbox
                  name="owner"
                  value={ownerId}
                  checked={owner}
                  onChange={this.onCheckBoxChange}
                >
                  我的
                </Checkbox>
                <Checkbox
                  name="publisher"
                  value={publisherId}
                  checked={publisher}
                  onChange={this.onCheckBoxChange}
                >
                  我的机构
                </Checkbox>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="merchantCode">
                <Row>
                  <Col span={16}>
                    <Input placeholder="请输入商户编码" allowClear />
                  </Col>
                  <Col span={8} className="mid">
                    <Select
                      defaultValue="UPCODE"
                      style={{ width: 120 }}
                      onChange={this.handleChange}
                    >
                      <Option value="UPCODE">银联码</Option>
                    </Select>
                  </Col>
                </Row>
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
        <Table
          tableLayout="auto"
          style={{ wordBreak: "break-all" }}
          size="small"
          bordered
          rowKey="_id"
          dataSource={campaigns}
          columns={this.columns}
          pagination={false}
        />
        <div className="pagination">
          <Pagination
            pageSize={size}
            current={currentPage}
            onChange={this.handleTableChange}
            total={this.totalPages}
            showSizeChanger={false}
            size="small"
            //showTotal={(total) => `总共 ${total} 条数据`}
          />
        </div>
        <Modal
          title="票券发放"
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <div>
            <Row style={{ marginBottom: "24px" }}>
              <Col span={14}>
                <Input
                  name="searchClientTxt"
                  value={searchClientTxt}
                  onChange={this.handleClientChange}
                  placeholder="请输入客户姓名、手机号搜索"
                  allowClear
                />
              </Col>
              <Col span={6}>
                <Button
                  type="primary"
                  className="cursor"
                  onClick={this.searchValue}
                >
                  查询
                </Button>
              </Col>
            </Row>
            <Table
              size="small"
              columns={this.listColumns}
              dataSource={listData}
              pagination={false}
              responsive={true}
              // scroll={{
              //   y: 300,
              // }}
            />

            <div className="pagination">
              <Pagination
                pageSize={listSize}
                current={current}
                onChange={this.handleListTableChange}
                total={this.totalListPages}
                showTotal={(listTotal) => `总共 ${listTotal} 条数据`}
                showSizeChanger={false}
                size="small"
                //onShowSizeChange={this.onShowSizeChange}
              />
            </div>
          </div>
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

export default CouponHome;
