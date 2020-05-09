import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Tag,
  Divider,
  Modal,
  Pagination,
  Form,
  Row,
  Col,
  Radio,
} from "antd";
import { PlusSquareFilled, ExclamationCircleOutlined } from "@ant-design/icons";
import storageUtils from "../../utils/storageUtils";
import { listType, listAddType } from "../../utils/memoryUtils";
import {
  reqPermit,
  reqGetList,
  reqDelSettlement,
  reqPutSettlement,
  reqAgreeSettlement,
} from "../../api";
import { Loading } from "../../components";
import "./index.less";

const { confirm } = Modal;
const renderContent = (value, row, index) => {
  const obj = {
    children: value,
    props: {},
  };
  return obj;
};
const renderCampaign = (value, row, index) => {
  const obj = {
    children: value?value.name:'-',
  };
  return obj;
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
    total: 0,
    /*搜索框 */
    searchTxt: "",
    loading: false,
    publisherId: storageUtils.getUser().orgId,
    ownerId: storageUtils.getUser().id,
    value: "merchant",
    title: "审批机构", //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
  };
  componentDidMount() {
    this.getList();
  }
  getList = async () => {
    const result = await reqPermit("LIST_SETTLEMENT");
    if (result) {
      this.getMarkets(null, 1);
    } else {
      this.setState({
        inited: true,
      });
    }
  };
  componentWillMount() {
    this.initColumns();
  }

  initColumns() {
    /*审批机构表头*/
    this.merchantColumns = [
      {
        title: "审批机构",
        dataIndex: "marketerName",
        key: "marketerName",
        //ellipsis: true,
      },
      {
        title: "结算类型",
        dataIndex: "type",
        key: "type",
        width: 110,
        render: (text) => {
          return (
            <div>
              <Tag color="blue" key={text}>
                {listAddType.map((item, index) =>
                  item.value === text ? (
                    <span key={index}>{item.name}</span>
                  ) : null
                )}
              </Tag>
            </div>
          );
        },
      },
      {
        title: "活动名称",
        dataIndex: "campaign",
        key: "campaign",
        render: renderCampaign,
      },
      {
        title: "交易周期",
        dataIndex: "beginDate",
        key: "beginDate",
        colSpan: 2,
        width: 110,
        render: renderContent,
      },
      {
        title: "终止时间",
        dataIndex: "endDate",
        colSpan: 0,
        key: "endDate",
        width: 110,
      },
      {
        title: "票券数量",
        dataIndex: "amount",
        key: "amount",
        width: 110,
      },
      {
        title: "结算时间",
        dataIndex: "settlementDate",
        key: "settlementDate",
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
                      let that = this;
                      that.hasPower(
                        id,
                        "确认提交该结算？",
                        "SUBMIT_SETTLEMENT",
                        "publishItem"
                      );
                    }}
                    className="ant-green-link cursor"
                  >
                    提交
                  </b>
                  <Divider type="vertical" />
                  <b
                    onClick={() => {
                      let that = this;
                      that.hasPower(
                        id,
                        "确认删除该结算",
                        "DELETE_SETTLEMENT",
                        "delItem"
                      );
                    }}
                    className="ant-pink-link cursor"
                  >
                    删除
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
    /*提交机构表头*/
    this.marketerColumns = [
      {
        title: "提交机构",
        dataIndex: "merchantName",
        key: "merchantName",
      },

      {
        title: "结算类型",
        dataIndex: "type",
        key: "type",
        width: 110,
        render: (text) => {
          return (
            <div>
              <Tag color="blue" key={text}>
                {listAddType.map((item, index) =>
                  item.value === text ? (
                    <span key={index}>{item.name}</span>
                  ) : null
                )}
              </Tag>
            </div>
          );
        },
      },
      {
        title: "活动名称",
        dataIndex: "campaign",
        key: "campaign",
        render: renderCampaign,
      },
      {
        title: "交易周期",
        dataIndex: "beginDate",
        key: "beginDate",
        colSpan: 2,
        width: 110,
        render: renderContent,
      },
      {
        title: "终止时间",
        dataIndex: "endDate",
        colSpan: 0,
        key: "endDate",
        width: 110,
      },
      {
        title: "票券数量",
        dataIndex: "amount",
        key: "amount",
        width: 110,
      },
      {
        title: "结算时间",
        dataIndex: "settlementDate",
        key: "settlementDate",
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
              {status === "SUBMITTED" ? (
                <span>
                  <b
                    onClick={() => {
                      let that = this;
                      that.hasPower(
                        id,
                        "确认批准该结算",
                        "APPROVE_SETTLEMENT",
                        "approveItem"
                      );
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

  /*radio 切换*/
  onChange = (e) => {
    //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    this.setState({
      page: 0,
      value: e.target.value,
      title: e.target.value === "merchant" ? "提交机构" : "审批机构",
    });
    this.getMarkets(null, 1, e.target.value);
  };
  /*搜索*/
  searchValue = (value) => {
    this.setState({
      searchTxt: value.searchTxt,
      value: value.group,
    });
    this.getMarkets(value.searchTxt, 1, this.state.value);
  };
  /*搜索loding*/
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  /*添加 */
  addItem = async () => {
    const result = await reqPermit("CREATE_SETTLEMENT");
    if (result) this.props.history.push("/admin/setting/new");
  };
  hasPower = async (id, title, str, handleName) => {
    let that = this;
    const result = await reqPermit(str);
    if (result) {
      confirm({
        title: title,
        icon: <ExclamationCircleOutlined />,
        okText: "确认",
        cancelText: "取消",
        onOk() {
          that[handleName](id);
        },
      });
    }
  };
  /*删除草稿 */
  delItem = async (id) => {
    const result = await reqDelSettlement(id);
    this.getMarkets(null, 1, this.state.value);
  };
  /*提交草稿 */
  publishItem = async (id) => {
    const params = {
      merchantId: storageUtils.getUser().orgId,
    };
    const result = await reqPutSettlement(id, params);
    this.setState({
      currentPage: 1,
    });
    this.getMarkets(null, 1);
  };
  /*批准 */
  approveItem = async (id) => {
    const params = {
      marketerId: storageUtils.getUser().orgId,
    };
    const result = await reqAgreeSettlement(id, params);
    this.setState({
      currentPage: 1,
    });
    this.getMarkets(null, 1);
  };

  /*
获取列表数据
*/
  getMarkets = async (value, currentPage, type) => {
    let typeStr = type ? type : this.state.value;
    // merchantId 商户id
    // marketerId 机构id
    //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    //提交机构（INITIATED，只显示在机构审批类)，审批机构（SUBMITTED，只显示在机构提交)
    const parmas =
      typeStr === "merchant"
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
    const cont =
      result && result.data && result.data.content
        ? result.data.content.entries
        : [];
    this.totalPages =
      result && result.data && result.data.content
        ? result.data.content.totalElements
        : 0;

    this.setState({
      inited: true,
      campaigns: cont,
      total:
        result && result.data && result.data.content
          ? result.data.content.totalElements
          : 0,
      searchTxt: null,
      loading: false,
    });
  };
  /*分页 */
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getMarkets(null, page);
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
            searchTxt: searchTxt,
            group: "merchant",
          }}
        >
          <Row>
            <Col>
              <Form.Item name="group" label="查询条件">
                <Radio.Group onChange={this.onChange}>
                  <Radio value="merchant">提交</Radio>
                  <Radio value="marketer">审批</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item name="searchTxt">
                <Input
                  value={searchTxt}
                  placeholder="请输入活动名称或标签进行搜索"
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
          tableLayout="auto"
          style={{ wordBreak: "break-all" }}
          size="small"
          bordered
          showSizeChanger={false}
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
