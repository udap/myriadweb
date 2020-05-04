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
  Popconfirm,
  Descriptions,
  Switch,
  notification,
  Pagination,
  Form,
  Row,
  Col,
  Radio,
  DatePicker,
} from "antd";
import { Select } from "antd";

import {
  SearchOutlined,
  PlusSquareFilled,
  FolderViewOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import storageUtils from "../../utils/storageUtils";
import { listType, listAddType } from "../../utils/memoryUtils";
import {
  reqGetList,
  reqDelCampaign,
  reqPublishCampaign,
  reqTransfer,
  reqDistributions,
} from "../../api";
import ReactFileReader from "react-file-reader";
import { Loading } from "../../components";
import comEvents from "../../utils/comEvents";
import "./index.less";
import "../../css/common.less";

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;
const Product = [];
const renderContent = (value, row, index) => {
  const obj = {
    children: value,
    props: {},
  };
  return obj;
};
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: {
    offset: 4,
    span: 16,
  },
};
class Setting extends Component {
  state = {
    inited: false,
    campaigns: [],
    addNew: false,
    showCSV: false,
    typeStr: null,
    customerOnly: true,
    chooseItem: {
      name: "活动",
    },
    currentPage: 1,
    size: 20,
    total: 1,
    /*搜索框 */
    searchTxt: "",
    loading: false,
    publisherId: storageUtils.getUser().orgId,
    ownerId: storageUtils.getUser().id,
    value: "marketer",
    title: "审批机构", //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
  };
  componentDidMount() {
    this.getMarkets(null, 1);
  }
  componentWillMount() {
    this.initColumns();
  }

  initColumns() {
    this.merchantColumns = [
      {
        title: "提交机构",
        dataIndex: "name",
        key: "name",
        //ellipsis: true,
      },

      {
        title: "交易周期",
        dataIndex: "effective",
        key: "effective",
        colSpan: 2,
        width: 110,
        render: renderContent,
      },
      {
        title: "终止时间",
        dataIndex: "expiry",
        colSpan: 0,
        key: "expiry",
        //render: renderContent,
        width: 110,
        render: (text) => {
          return (
            <div>{text ? comEvents.getDateStr(-1, new Date(text)) : "-"}</div>
          );
        },
      },
      {
        title: "结算类型",
        dataIndex: "type",
        key: "type",
        width: 110,
      },
      {
        title: "结算时间",
        dataIndex: "time",
        key: "time",
        width: 110,
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 80,
        render: (text) => {
          return (
            <div>
              <Tag color="green" key={text}>
                {listType.map((item, index) => (
                  <span key={index}>{item[text]}</span>
                ))}
              </Tag>
            </div>
          );
        },
      },
      {
        title: "操作",
        //fixed: "right",
        width: 150,
        render: (chooseItem) => {
          //操作（状态为草稿是，可以删除和提交操作，其中“提交”按钮只显示在机构提交页；状态为提交时，对于机构审批页，只有“批准”操作按钮）
          const { id, status } = chooseItem;
          return (
            <span>
              {status === "INITIATED" ? (
                <span>
                  <b
                    onClick={() => {
                      //this.props.history.push("/admin/market/edit/" + id);
                    }}
                    className="ant-green-link cursor"
                  >
                    提交
                  </b>
                  <Divider type="vertical" />
                  <b
                    onClick={() => {
                      let that = this;
                      confirm({
                        title: "确认删除该结算?",
                        icon: <ExclamationCircleOutlined />,
                        okText: "确认",
                        okType: "danger",
                        cancelText: "取消",
                        onOk() {
                          that.delItem(id);
                        },
                        onCancel() {},
                      });
                    }}
                    className="ant-pink-link"
                  >
                    删除
                  </b>
                </span>
              ) : status === "SUBMITTED" ? (
                <span>
                  <b
                    onClick={() => {
                      //this.showCSV("distributions", chooseItem);
                    }}
                    className="ant-blue-link cursor"
                  >
                    批准
                  </b>
                </span>
              ) : (
                "-"
              )}
            </span>
          );
        },
      },
    ];
    this.marketerColumns = [
      {
        title: "审批机构",
        dataIndex: "name",
        key: "name",
        //ellipsis: true,
      },

      {
        title: "交易周期",
        dataIndex: "effective",
        key: "effective",
        colSpan: 2,
        width: 110,
        render: renderContent,
      },
      {
        title: "终止时间",
        dataIndex: "expiry",
        colSpan: 0,
        key: "expiry",
        //render: renderContent,
        width: 110,
        render: (text) => {
          return (
            <div>{text ? comEvents.getDateStr(-1, new Date(text)) : "-"}</div>
          );
        },
      },
      {
        title: "结算类型",
        dataIndex: "type",
        key: "type",
        width: 110,
      },
      {
        title: "结算时间",
        dataIndex: "time",
        key: "time",
        width: 110,
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 80,
        render: (text) => {
          return (
            <div>
              <Tag color="green" key={text}>
                {listType.map((item, index) => (
                  <span key={index}>{item[text]}</span>
                ))}
              </Tag>
            </div>
          );
        },
      },
      {
        title: "操作",
        //fixed: "right",
        width: 150,
        render: (chooseItem) => {
          //操作（状态为草稿是，可以删除和提交操作，其中“提交”按钮只显示在机构提交页；状态为提交时，对于机构审批页，只有“批准”操作按钮）
          const { id, status } = chooseItem;
          return (
            <span>
              {status === "INITIATED" ? (
                <span>
                  <b
                    onClick={() => {
                      //this.props.history.push("/admin/market/edit/" + id);
                    }}
                    className="ant-green-link cursor"
                  >
                    提交
                  </b>
                  <Divider type="vertical" />
                  <b
                    onClick={() => {
                      let that = this;
                      confirm({
                        title: "确认删除该结算?",
                        icon: <ExclamationCircleOutlined />,
                        okText: "确认",
                        okType: "danger",
                        cancelText: "取消",
                        onOk() {
                          that.delItem(id);
                        },
                        onCancel() {},
                      });
                    }}
                    className="ant-pink-link"
                  >
                    删除
                  </b>
                </span>
              ) : status === "SUBMITTED" ? (
                <span>
                  <b
                    onClick={() => {
                      this.showCSV("distributions", chooseItem);
                    }}
                    className="ant-blue-link cursor"
                  >
                    批准
                  </b>
                </span>
              ) : (
                "-"
              )}
            </span>
          );
        },
      },
    ];
  }

  searchValue = (value) => {
    console.log("Setting -> searchValue -> value", value)
    this.setState({
      searchTxt: value.searchTxt,
      value: value.group,
    });
    console.log("value", value);
    this.getMarkets(value.searchTxt, 1);
  };
  onChange = (e) => {
    console.log("radio checked", e.target.value);
    //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    this.setState({
      page: 0,
      value: e.target.value,
      title: e.target.value === "merchant" ? "提交机构" : "审批机构",
    });
    this.getMarkets(null, 1, e.target.value);
  };
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  addItem = () => {
    //this.props.history.push("/admin/market/edit/new");
    this.setState({
      showCSV: true,
    });
  };

  delItem = async (id) => {
    const result = await reqDelCampaign(id);
    this.getMarkets(null, 1);
  };
  publishItem = async (id) => {
    const result = await reqPublishCampaign(id);
    this.setState({
      currentPage: 1,
    });
    this.getMarkets(null, 1);
  };
  /*
获取列表数据
*/
  getMarkets = async (value, currentPage, type) => {
    // merchantId 商户id
    // marketerId 机构id
    // status 结算状态
    // searchTxt 搜索框
    //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    //提交机构（INITIATED，只显示在机构审批类)，审批机构（SUBMITTED，只显示在机构提交)
    const parmas =
      type === "merchant"
        ? {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: this.state.size,
            merchantId: storageUtils.getUser().orgId,
            //status: "INITIATED",
            searchTxt: this.state.searchTxt,
          }
        : {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: this.state.size,
            marketerId: storageUtils.getUser().orgId,
            //status: "SUBMITTED",
            searchTxt: this.state.searchTxt,
          };
    const result = await reqGetList(parmas);
    console.log("Setting -> getMarkets -> result", result)
    const cont = result && result.data ? result.data.content.entries : [];
    this.totalPages = result && result.data ? result.data.content.total : 1;

    this.setState({
      inited: true,
      campaigns: cont,
      total: result && result.data ? result.data.content.total : 1,
      searchTxt: "",
      loading: false,
    });
  };
  showCSV = (type, chooseItem) => {
    this.setState({
      typeStr: type,
      showCSV: true,
      chooseItem: chooseItem,
    });
  };
  handleCancel = () => {
    this.setState({ showCSV: false });
  };

  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getMarkets(null, page);
  };
 onFinish = values => {
    console.log(values);
  };
  onGenderChange = value => {
  console.log(`selected ${value}`);
  };
  renderContent = () => {
    const {
      campaigns,
      size,
      typeStr,
      chooseItem,
      total,
      currentPage,
      searchTxt,
      ownerId,
      publisherId,
      value,
    } = this.state;
    //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    let columns =
      value === "merchant" ? this.merchantColumns : this.marketerColumns;
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="结算中心"
          extra={[
            <PlusSquareFilled className="setIcon" onClick={this.addItem} />,
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
            group: "marketer",
          }}
        >
          <Row>
            <Col>
              <Form.Item name="group" label="查询条件">
                <Radio.Group onChange={this.onChange}>
                  <Radio value="marketer">机构审批</Radio>
                  <Radio value="merchant">机构提交</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item name="searchTxt">
                <Input placeholder="请输入活动名称或标签进行搜索" allowClear />
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
          tableLayout="auto"
          style={{ wordBreak: "break-all" }}
          size="small"
          bordered
          showSizeChanger
          dataSource={campaigns}
          columns={columns}
          pagination={false}
        />
        <div className="pagination">
          <Pagination
            pageSize={size}
            current={currentPage}
            onChange={this.handleTableChange}
            total={this.totalPages}
            showTotal={(total) => `总共 ${total} 条数据`}
            size="small"
          />
        </div>
        <Modal
          title="新增结算"
          visible={this.state.showCSV}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <Form
            {...layout}
            name="control-hooks"
            onFinish={this.onFinish}
            initialValues={{
              org: storageUtils.getUser().orgName,
              group: "marketer",
              gender: "MONTHLY",
            }}
          >
            <Form.Item
              name="who"
              label="营销机构"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                placeholder="请选择营销机构"
                onChange={this.onGenderChange}
                allowClear
              >
                <Option value="q">重庆农商行</Option>
                {/* {listAddType.map((item) => {
                  return <Option value={item.value}>{item.name}</Option>;
                })} */}
              </Select>
            </Form.Item>
            <Form.Item
              name="gender"
              label="结算类型"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                placeholder="请选择结算类型"
                onChange={this.onGenderChange}
                allowClear
              >
                {listAddType.map((item) => {
                  return <Option value={item.value}>{item.name}</Option>;
                })}
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.gender !== currentValues.gender
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("gender") !== "NONE" ? (
                  <Form.Item
                    name="period"
                    label="交易日期"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <DatePicker />
                    {/* <RangePicker
                      picker={
                        getFieldValue("gender") === "MONTHLY"
                          ? "month"
                          : getFieldValue("gender") === "ANNUAL"
                          ? "year"
                          : "quarter"
                      }
                    /> */}
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="period"
                    label="营销活动"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      placeholder="请选择营销活动"
                      onChange={this.onGenderChange}
                      allowClear
                    >
                      {listAddType.map((item) => {
                        return <Option value={item.value}>{item.name}</Option>;
                      })}
                    </Select>
                  </Form.Item>
                )
              }
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Form.Item>
          </Form>
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

export default Setting;
