import React, { Component } from "react";
import {
  Table,
  PageHeader,
  Tag,
  Divider,
  Modal,
  Popconfirm,
  Pagination,
  Popover,
} from "antd";
import { PlusSquareFilled, ExclamationCircleOutlined } from "@ant-design/icons";

import storageUtils from "@utils/storageUtils";
import { campaignStatuses, couponSubTypeMethods } from "@utils/constants";
import comEvents from "@utils/comEvents";
import {
  reqPermit,
  reqGetCampaigns,
  reqDelCampaign,
  reqPublishCampaign,
  reqGetCampaignById,
  reqTerminate,
} from "@api";
import "./Campaign.less";
import "@css/common.less";
import { CampaignDetail, QueryForm } from "./components";

class Campaign extends Component {
  constructor(props) {
    super(props);
    this.state = {
      campaigns: [],
      chooseItem: {
        name: "活动",
      },
      currentPage: 1,
      size: 20,
      total: 1,
      searchTxt: "",
      loading: false,
      value: "participant",
      showDetail: false,
      listItem: null,
      effective: "valid",
    };
  }

  componentDidMount() {
    this.initColumns("participant");
    this.getCampaigns(null, 1);
  }

  initColumns(element) {
    this.columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "类型",
        dataIndex: "subType",
        key: "subType",
        render: (text) => {
          return (
            <>
              {couponSubTypeMethods.map((item, index) => (
                <span key={index}>{item[text]}</span>
              ))}
            </>
          );
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
        title: "标签",
        dataIndex: "category",
        key: "category",
        width: 140,
        render: (value) => {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {value &&
                value.split(",").map((item, index) => (
                  <div style={{ flex: 1 }}>
                    <Tag key={index} color="cyan">
                      {item}
                    </Tag>
                  </div>
                ))}
            </div>
          );
        },
      },
      {
        title: "发布时间",
        dataIndex: "activationTime",
        key: "activationTime",
        width: 100,
        render: (value) => {
          return <div style={{ textAlign: "right" }}>{value}</div>;
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
        key: "ops",
        width: 150,
        render: (chooseItem) => {
          const { id, status } = chooseItem;
          // element === 'participant' 才有按钮
          return (
            <span>
              <b
                onClick={() => this.showDetail(chooseItem)}
                className="ant-green-link cursor"
              >
                查看
              </b>
              {status !== "ACTIVATING" ? (
                <span>
                  <Divider type="vertical" />
                  <b
                    onClick={() => {
                      this.props.history.push("/admin/campaign/edit/" + id);
                    }}
                    className="ant-blue-link cursor"
                  >
                    编辑
                  </b>
                </span>
              ) : null}
              <Divider type="vertical" />
              <Popover
                content={
                  element.includes("participant")
                    ? this.showExtraBtns(chooseItem)
                    : "无"
                }
                trigger="hover"
              >
                <b className="ant-blue-link cursor">更多</b>
              </Popover>
            </span>
          );
        },
      },
    ];
  }

  // 展示按钮
  showExtraBtns = (chooseItem) => {
    const { id, status, name } = chooseItem;
    return (
      <div style={{ display: "inline" }}>
        {status === "INITIATED" ? (
          <span>
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
                Modal.confirm({
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
                let that = this;
                Modal.confirm({
                  title: "确认终止【" + name + "】吗?",
                  icon: <ExclamationCircleOutlined />,
                  okText: "确认",
                  okType: "danger",
                  cancelText: "取消",
                  onOk() {
                    that.onTerminate(id);
                  },
                });
              }}
              className="ant-blue-link cursor"
            >
              终止
            </b>
          </span>
        ) : (
          "无"
        )}
      </div>
    );
  };

  // 终止活动
  onTerminate = async (element) => {
    await reqTerminate(element);
    this.setState({ currentPage: 1 });
    this.getCampaigns(null, 1);
  };

  // 展示活动详情
  showDetail = async (item) => {
    this.setState({ showDetail: true });

    const curInfo = await reqGetCampaignById(item.id);
    let cont = curInfo && curInfo.data ? curInfo.data : [];
    cont.id = item.id;

    this.setState({ listItem: cont });
  };

  // 关闭活动详情
  closeDetail = () => {
    this.setState({ showDetail: false, listItem: null });
  };

  // radio 切换
  onChange = (element) => {
    // 提交机构（participant，只显示在机构审批类)，审批机构（party，只显示在机构提交)
    this.setState({
      page: 0,
      value: element,
      title: element === "participant" ? "提交机构" : "审批机构",
      currentPage: 1,
    });
    this.initColumns(element);
    this.getCampaigns(null, 1, element);
  };

  onChangeEffective = (e) => {
    this.setState({
      page: 0,
      currentPage: 1,
      effective: e.target.value,
    });
    this.getCampaigns(null, 1, null, e.target.value);
  };

  searchValue = (elements) => {
    const { value } = this.state;
    this.setState({
      searchTxt: elements.searchTxt,
      value: elements.group,
      currentPage: 1,
    });
    this.getCampaigns(elements.searchTxt, 1, value);
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
    await reqDelCampaign(id);
    this.setState({
      currentPage: 1,
    });
    this.getCampaigns(null, 1);
  };

  publishItem = async (id) => {
    await reqPublishCampaign(id);
    this.setState({
      currentPage: 1,
    });
    this.getCampaigns("", 1, "participant");
  };

  // 获取列表数据
  getCampaigns = async (value, currentPage, type, effective) => {
    const typeStr = type || this.state.value;
    const typeEff = effective || this.state.effective;
    // 一个是“我参与的”，另一个是“机构参与的”前者只传participantId，后者只传partyId
    // 都需要传status=NON_EXPIRED
    let params = typeStr.includes("participant")
      ? {
          page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
          size: this.state.size,
          participantId: storageUtils.getUser().id,
          status: typeEff !== "all" ? "NEW_OR_EFFECTIVE" : "",
          searchTxt: value ? value : this.state.searchTxt,
          sort: "updatedAt,desc",
        }
      : {
          page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
          size: this.state.size,
          partyId: storageUtils.getUser().orgId,
          status: typeEff !== "all" ? "NON_EXPIRED" : "",
          searchTxt: value ? value : this.state.searchTxt,
          sort: "updatedAt,desc",
        };
    if (typeStr === "partyCreate") {
      params = { ...params, partyType: "HOST" };
    }
    if (typeStr === "participantCreate") {
      params = { ...params, participantType: "OWNER" };
    }
    this.setState({ loading: true });
    const result = await reqGetCampaigns(params);
    const cont = result && result.data ? result.data.content : [];
    this.totalPages = result && result.data ? result.data.totalElements : 1;

    this.setState({
      campaigns: cont,
      total: result && result.data ? result.data.totalElements : 1,
      // searchTxt: "",
      loading: false,
    });
  };

  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getCampaigns(null, page);
  };

  render() {
    const {
      campaigns,
      size,
      currentPage,
      showDetail,
      listItem,
      loading,
    } = this.state;
    return (
      <>
        <PageHeader
          title="营销活动"
          extra={[
            <PlusSquareFilled
              key="add"
              className="setIcon"
              onClick={() => {
                const self = this;
                comEvents.hasPower(
                  self,
                  reqPermit,
                  "CREATE_CAMPAIGN",
                  "addItem"
                );
              }}
            />,
          ]}
        />
        <QueryForm
          loading={loading}
          onChangeType={this.onChange}
          onChangeEffective={this.onChangeEffective}
          enableLoading={this.enterLoading}
          onFinish={this.searchValue}
        />
        <Table
          rowKey="id"
          size="small"
          bordered
          dataSource={campaigns}
          columns={this.columns}
          pagination={false}
          loading={loading}
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
            disabled={loading}
          />
        </div>
        {showDetail && (
          <CampaignDetail
            campaign={listItem}
            onClose={this.closeDetail}
            visible={showDetail}
          />
        )}
      </>
    );
  }
}

export default Campaign;
