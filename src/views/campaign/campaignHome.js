import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Tag,
  Divider,
  Modal,
  Popconfirm,
  Descriptions,
  notification,
  Pagination,
  Form,
  Row,
  Col,
  Radio,
} from "antd";
import {
  PlusSquareFilled,
  UploadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import storageUtils from "../../utils/storageUtils";
import { campaignStatuses } from "../../utils/constants";
import comEvents from "../../utils/comEvents";
import {
  reqPermit,
  reqGetCampaigns,
  reqDelCampaign,
  reqPublishCampaign,
  reqBatchTransfer,
  reqBatchDistribution,
  reqGetNumber,
} from "../../api";
import ReactFileReader from "react-file-reader";
import { Loading } from "../../components";
import "./index.less";
import "../../css/common.less";
const {confirm} = Modal
// const renderContent = (value, row, index) => {
//   const obj = {
//     children: value,
//     props: {},
//   };
//   return obj;
// };
class CampaignHome extends Component {
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
    number: 0,
    value: "merchant",
  };
  componentDidMount() {
    this.initColumns();
    this.getMarkets(null, 1);
  }

  initColumns() {
    this.columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        //ellipsis: true,
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        render: (text) => {
          return <div>优惠券活动</div>;
        },
        width: 110,
      },
      {
        title: "主办单位",
        dataIndex: "ownerName",
        key: "ownerName",
        // width: 150,
      },
      {
        title: "有效期",
        dataIndex: "effective",
        key: "effective",
        colSpan: 2,
        width: 110,
        //render: renderContent,
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
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 80,
        render: (text) => {
          return (
            <div>
              <Tag color="green" key={text}>
                {campaignStatuses.map((item, index) => (
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
          const { id, status,name } = chooseItem;
          //INITIATED的时候前端可以查看/修改/发布；ACTIVATED的时候前端可以查看/分配票券
          return (
            <span>
              {status === "INITIATED" ? (
                <span>
                  {/* <b
                    onClick={() => {
                      this.props.history.push("/admin/campaign/edit/" + id);
                    }}
                    className="ant-green-link cursor"
                  >
                    查看
                  </b>
                  <Divider type="vertical" /> */}
                  <Popconfirm
                    title="确认发布吗?"
                    onConfirm={this.publishItem.bind(this, id)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <b className="ant-green-link cursor">发布</b>
                  </Popconfirm>

                  {/*<Divider type="vertical" />
                   <b
                    onClick={() => {
                      this.props.history.push("/admin/campaign/edit/" + id);
                    }}
                    className="ant-blue-link"
                  >
                    修改
                  </b> */}

                  <Divider type="vertical" />
                   <b
                    onClick={() => {
                      let that = this;
                      confirm({
                        title: "确认删除【" + name + "】?",
                        icon: <ExclamationCircleOutlined />,
                        okText: "确认",
                        okType: "danger",
                        cancelText: "取消",
                        onOk() {
                          that.delItem(id);
                        },
                      });
                    }}
                    className="ant-pink-link cursor"
                  >
                    删除
                  </b> 
                </span>
              ) : status === "ACTIVATED" ? (
                <span>
                  {/* <b
                    onClick={() => {
                      this.props.history.push("/admin/campaign/detail/" + id);
                    }}
                    className="ant-green-link cursor"
                  >
                    查看
                  </b><Divider type="vertical" /> */}
                  <b
                    onClick={() => {
                      this.showCSV("transfer", chooseItem);
                    }}
                    className="ant-blue-link cursor"
                  >
                    分配票券
                  </b>
                  <Divider type="vertical" />
                  <b
                    onClick={() => {
                      this.showCSV("distributions", chooseItem);
                    }}
                    className="ant-blue-link cursor"
                  >
                    发放票券
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
      currentPage: 1,
    });
    this.getMarkets(null, 1, e.target.value);
  };
  searchValue = (value) => {
    this.setState({
      searchTxt: value.searchTxt,
      value: value.group,
    });
    this.getMarkets(value.searchTxt, 1, this.state.value);
  };
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  addItem = () => {
    if (storageUtils.getUser().orgId === 1) {
      this.props.history.push("/admin/campaign/edit/new");
    } else {
      notification.error({
        message: "目前只支持【重庆农商行总行】创建活动。",
      });
    }
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
    this.getMarkets("", 1, "merchant");
  };
  /*
获取列表数据
*/
  getMarkets = async (value, currentPage, type) => {
    let typeStr = type ? type : this.state.value;
    //一个是“我参与的”，另一个是“机构参与的”前者只传participantId，后者只传partyId
    //都需要传status=NON_EXPIRED
    const parmas =
      typeStr === "merchant"
        ? {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: this.state.size,
            participantId: storageUtils.getUser().id,
            status: "NEW_OR_EFFECTIVE",
            searchTxt: value,
            sort:'updatedAt,desc'
          }
        : {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: this.state.size,
            partyId: storageUtils.getUser().orgId,
            status: "NON_EXPIRED",
            searchTxt: value,
            sort:'updatedAt,desc'
          };
    const result = await reqGetCampaigns(parmas);
    const cont = result && result.data ? result.data.content : [];
    this.totalPages = result && result.data ? result.data.totalElements : 1;

    this.setState({
      inited: true,
      campaigns: cont,
      total: result && result.data ? result.data.totalElements : 1,
      searchTxt: "",
      loading: false,
    });
  };
  showCSV = (type, chooseItem) => {
    this.getNumber(chooseItem.id);
    this.setState({
      typeStr: type,
      showCSV: true,
      chooseItem: chooseItem,
    });
  };
  getNumber = async (campaignId) => {
    const owner = storageUtils.getUser().id;
    const result = await reqGetNumber(campaignId, owner);
    this.setState({
      number: result.data,
    });
  };
  handleCancel = () => {
    this.setState({
      showCSV: false,
    });
  };
  handleFiles = async (files) => {
    var reader = new FileReader();
    reader.onload = function (e) {
      // Use reader.result
      console.log(reader.result);
      //3506005,1   3309005,2
    };
    reader.readAsText(files[0]);

    let formData = new FormData();
    formData.append("csvFile", files[0]);
    formData.append("campaignId", this.state.chooseItem.id);
    let result;
    if (this.state.typeStr === "transfer") {
      //transfer 批量分配
      result = await reqBatchTransfer(formData);
      if (result && result.data && result.data.status === "IN_PROGRESS") {
        let str0 =
          "申请分配" + result.data.requestedAmount + "张票券，后台正在处理中！";
        notification.success({
          message: str0,
        });
      } else {
        let str1 = "申请分配票券失败";
        notification.error({
          message: str1,
        });
      }
    } else {
      //distributions 批量发券
      // formData.append("customerOnly", this.state.customerOnly);
      result = await reqBatchDistribution(formData);
      if (result && result.data && result.data.customerCount) {
        let str0 =
          "申请发放票券给" +
          result.data.customerCount +
          "个客户，后台正在处理中！";
        notification.success({
          message: str0,
        });
      }
    }
    this.setState({
      showCSV: false,
      chooseItem: null,
    });
    //IN_PROGRESS
  };

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
      total,
      currentPage,
      searchTxt,
    } = this.state;
    const typeName = typeStr === "transfer" ? "票券分配文件" : "票券发放文件";
    const typeTitle = typeStr === "transfer" ? "分配票券" : "发放票券";
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="营销活动"
          extra={[
            <PlusSquareFilled key="add" className="setIcon" onClick={() => {
                let self = this;
                comEvents.hasPower(
                  self,
                  reqPermit,
                  "CREATE_CAMPAIGN",
                  "addItem"
                );
              }} />,
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
            group: "merchant",
          }}
        >
          <Row>
            <Col>
              <Form.Item name="group" label="查询条件">
                <Radio.Group onChange={this.onChange}>
                  <Radio value="merchant">我参与的</Radio>
                  <Radio value="marketer">机构参与的</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item name="searchTxt">
                <Input placeholder="请输入名称进行搜索" allowClear />
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
          rowKey="uid"
          size="small"
          bordered
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
            showTotal={(total) => `总共 ${total} 条数据`}
            size="small"
            showSizeChanger={false}
          />
        </div>
        <Modal
          title={typeTitle}
          visible={this.state.showCSV}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <div>
            <div class="market-number">
              {typeTitle === "分配票券" ? (
                <span>当前可分配数量：{this.state.number}</span>
              ) : (
                <span>当前可发放数量：{this.state.number}</span>
              )}
            </div>
            <Descriptions title={"请上传" + `${typeName}`} column={2}>
              <Descriptions.Item label="格式">csv</Descriptions.Item>
              <Descriptions.Item label="表头">
                {typeStr === "transfer" ? "员工号,数量" : "客户手机号 "}
              </Descriptions.Item>
              {typeStr === "transfer" ? (
                <Descriptions.Item label="最大许可">
                  100个 员工
                </Descriptions.Item>
              ) : (
                <Descriptions.Item label=""></Descriptions.Item>
              )}

              <Descriptions.Item label="数据示例">
                {typeStr === "transfer" ? "001,300" : "18512342534"}
              </Descriptions.Item>
              {/* {typeStr === "distributions" ? (
                <Descriptions.Item label="是否只发自己的客户">
                  <Switch defaultChecked onChange={this.onSwitchChange} />
                </Descriptions.Item>
              ) : (
                ""
              )} */}
            </Descriptions>
            <Row>
              <Col>
                <ReactFileReader
                  handleFiles={this.handleFiles}
                  fileTypes={".csv"}
                >
                  <Button
                    type="primary"
                    disabled={this.state.number === 0 ? true : false}
                  >
                    <UploadOutlined />
                    选择文件并上传
                  </Button>
                </ReactFileReader>
              </Col>
              <Col>
                {this.state.number === 0 ? (
                  <Button
                    type="primary"
                    style={{
                      marginLeft: "10px",
                    }}
                    onClick={this.handleCancel}
                  >
                    关闭
                  </Button>
                ) : null}
              </Col>
            </Row>
          </div>
        </Modal>
      </div>
    );
  };
  render() {
    return (
      <div
        style={{
          height: "100%",
        }}
      >
        {this.state.inited ? this.renderContent() : <Loading />}
      </div>
    );
  }
}

export default CampaignHome;
