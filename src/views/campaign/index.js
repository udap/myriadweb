import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Tag,
  Divider,
  Modal,
  Popconfirm,
  Descriptions,
  notification,
  Pagination,
  Row,
  Col,
} from "antd";
import {
  PlusSquareFilled,
  UploadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import NumberFormat from 'react-number-format';
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
  reqGetCampaignById,
} from "../../api";
import ReactFileReader from "react-file-reader";
import { Loading } from "../../components";
import "./index.less";
import "../../css/common.less";
import CampaignDetail from "./campaignDetail";
import QueryForm from "./queryForm";
const { confirm } = Modal;
class Campaign extends Component {
  state = {
    inited: false,
    campaigns: [],
    addNew: false,
    showCSV: false,
    //分配与发放
    action: null,
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
    //我参与的与机构参与的
    value: "participant",
    showDetail: false,
    //当前列表操作的活动
    listItem: null,
  };
  componentDidMount() {
    this.initColumns("participant");
    this.getCampaigns(null, 1);
  }

  initColumns(value) {
    let btnWidth = value === "participant" ? 180 : 50;
    this.columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        //fixed: "left",
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
        responsive: ["lg"],
      },
      {
        title: "主办单位",
        dataIndex: "ownerName",
        key: "ownerName",
        ellipsis: true,
        responsive: ["lg"],
      },
      {
        title: "有效期",
        dataIndex: "effective",
        key: "effective",
        colSpan: 2,
        width: 110,
        responsive: ["md"],
      },
      {
        title: "终止时间",
        dataIndex: "expiry",
        colSpan: 0,
        key: "expiry",
        responsive: ["md"],
        width: 110,
        render: (text) => {
          return (
            <div>{text ? comEvents.getDateStr(-1, new Date(text)) : "-"}</div>
          );
        },
      },
      {
        title: "发行数量",
        dataIndex: "totalSupply",
        key: "totalSupply",
        width: 90,
        render: (value) => {
          return (
            <div style={{textAlign: "right"}}>
            <NumberFormat value={value} displayType={'text'} thousandSeparator={true} />
            </div>
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
        width: btnWidth,
        render: (chooseItem) => {
          const { id, status, name } = chooseItem;
          //INITIATED的时候前端可以查看/修改/发布；ACTIVATED的时候前端可以查看/分配票券
          //value==='participant' 才有按钮
          return (
            <span>
              <b
                onClick={() => this.showDetail(chooseItem)}
                className="ant-green-link cursor"
              >
                查看
              </b>
              {value === "participant" ? this.showExtraBtns(chooseItem) : null}
            </span>
          );
        },
      },
    ];
  }
  //展示按钮
  showExtraBtns = (chooseItem) => {
    const { id, status, name } = chooseItem;
    return (
      <div style={{ display: "inline" }}>
        <Divider type="vertical" />
        {status === "INITIATED" ? (
          <span>
            <b
              onClick={() => {
                this.props.history.push("/admin/campaign/edit/" + id);
              }}
              className="ant-blue-link cursor"
            >
              编辑
            </b>
            <Divider type="vertical" />
            <Popconfirm
              title="确认发布吗?"
              onConfirm={this.publishItem.bind(this, id)}
              okText="确认"
              cancelText="取消"
            >
              <b className="ant-green-link cursor">发布</b>
            </Popconfirm>

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
            <b
              onClick={() => {
                this.showCSV("transfer", chooseItem);
              }}
              className="ant-blue-link cursor"
            >
              配券
            </b>
            <Divider type="vertical" />
            <b
              onClick={() => {
                this.showCSV("distribution", chooseItem);
              }}
              className="ant-blue-link cursor"
            >
              发放
            </b>
          </span>
        ) : null}
      </div>
    );
  };
  //展示活动详情
  showDetail = (item) => {
    this.reqGetCampaignById(item.id);
  };
  //获取活动详情
  reqGetCampaignById = async (id) => {
    let curInfo = await reqGetCampaignById(id);
    let cont = curInfo && curInfo.data ? curInfo.data : [];
    console.log("FormDialog -> getEmployee -> cont", cont);
    this.setState({
      showDetail: true,
      listItem: cont,
    });
  };
  //关闭活动详情
  closeDetail = () => {
    this.setState({
      showDetail: false,
      listItem: null,
    });
  };
  /*radio 切换*/
  onChange = (e) => {
    //提交机构（participant，只显示在机构审批类)，审批机构（party，只显示在机构提交)
    this.setState({
      page: 0,
      value: e.target.value,
      title: e.target.value === "participant" ? "提交机构" : "审批机构",
      currentPage: 1,
    });
    this.initColumns(e.target.value);
    this.getCampaigns(null, 1, e.target.value);
  };
  searchValue = (value) => {
    this.setState({
      searchTxt: value.searchTxt,
      value: value.group,
      currentPage: 1,
    });
    this.getCampaigns(value.searchTxt, 1, this.state.value);
  };
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  addItem = async () => {
    this.props.history.push("/admin/campaign/edit/new");
  };

  delItem = async (id) => {
    const result = await reqDelCampaign(id);
    this.setState({
      currentPage:1
    })
    this.getCampaigns(null, 1);
  };
  publishItem = async (id) => {
    const result = await reqPublishCampaign(id);
    this.setState({
      currentPage: 1,
    });
    this.getCampaigns("", 1, "participant");
  };
  /*
获取列表数据
*/
  getCampaigns = async (value, currentPage, type) => {
    let typeStr = type ? type : this.state.value;
    //一个是“我参与的”，另一个是“机构参与的”前者只传participantId，后者只传partyId
    //都需要传status=NON_EXPIRED
    const parmas =
      typeStr === "participant"
        ? {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: this.state.size,
            participantId: storageUtils.getUser().id,
            status: "NEW_OR_EFFECTIVE",
            searchTxt: value ? value : this.state.searchTxt,
            sort: "updatedAt,desc",
          }
        : {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: this.state.size,
            partyId: storageUtils.getUser().orgId,
            status: "NON_EXPIRED",
            searchTxt: value ? value : this.state.searchTxt,
            sort: "updatedAt,desc",
          };
    const result = await reqGetCampaigns(parmas);
    const cont = result && result.data ? result.data.content : [];
    this.totalPages = result && result.data ? result.data.totalElements : 1;

    this.setState({
      inited: true,
      campaigns: cont,
      total: result && result.data ? result.data.totalElements : 1,
      //searchTxt: "",
      loading: false,
    });
  };
  showCSV = (action, chooseItem) => {
    this.getNumber(chooseItem.id, action);
    this.setState({
      action: action,
      showCSV: true,
      chooseItem: chooseItem,
    });
  };
  getNumber = async (campaignId, action) => {
    const owner = storageUtils.getUser().id;
    const result = await reqGetNumber(campaignId, owner, action);
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
    if (this.state.action === "transfer") {
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
    this.getCampaigns(null, page);
  };
  //分配发放票券
  showCSVModal = () => {
    const { action } = this.state;
    const typeName = action === "transfer" ? "票券分配文件" : "票券发放文件";
    const typeTitle = action === "transfer" ? "分配票券" : "发放票券";
    return (
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
              {action === "transfer" ? "员工号,数量" : "客户手机号 "}
            </Descriptions.Item>
            {action === "transfer" ? (
              <Descriptions.Item label="最大许可">100个 员工</Descriptions.Item>
            ) : (
              <Descriptions.Item label=""></Descriptions.Item>
            )}

            <Descriptions.Item label="数据示例">
              {action === "transfer" ? "001,300" : "18512342534"}
            </Descriptions.Item>
            {/* {action === "distributions" ? (
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
    );
  };

  renderContent = () => {
    const {
      campaigns,
      size,
      currentPage,
      showCSV,
      //活动详情
      showDetail,
      listItem,
    } = this.state;
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="营销活动"
          extra={[
            <PlusSquareFilled
              key="add"
              className="setIcon"
              onClick={() => {
                let self = this;
                comEvents.hasPower(
                  self,
                  reqPermit,
                  "CREATE_CAMPAIGN",
                  "addItem"
                );
              }}
            />,
          ]}
        ></PageHeader>
        {/* --搜索栏-- */}
        <QueryForm
          loading={this.state.loading}
          onChangeType={this.onChange}
          enableLoading={this.enterLoading}
          onFinish={this.searchValue}
        />
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
        {showCSV ? this.showCSVModal() : null}
        {showDetail ? (
          <CampaignDetail
            listItem={listItem}
            closeDetail={this.closeDetail}
            visible={showDetail}
          />
        ) : null}
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

export default Campaign;
