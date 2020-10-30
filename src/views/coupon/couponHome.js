import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Tag,
  Divider,
  Modal,
  notification,
  Row,
  Col,
  Pagination,
} from "antd";
import NumberFormat from "react-number-format";
import storageUtils from "../../utils/storageUtils";
import {
  reqGetCoupons,
  reqGetVoucherById,
  reqPublishDis,
  reqGetClients,
} from "../../api";
import { Loading } from "../../components";
import { couponStatuses, couponSubTypes } from "../../utils/constants";
import comEvents from "../../utils/comEvents";
import VoucherQueryForm from "./queryForm";
import CouponDetails from "./couponDetails";
import "../../css/common.less";
import "./index.less";

class CouponHome extends Component {
  state = {
    inited: false,
    vouchers: [],
    addNew: false,
    publisherId: storageUtils.getUser().orgId,
    ownerId: storageUtils.getUser().id,
    hasChoose: false,
    merchantCode: "",
    codeType: "UPCODE",
    currentPage: 1,
    size: 20,
    total: 0,
    visible: false,
    /**发布客户 */
    current: 1,
    listSize: 8,
    listTotal: 0,
    listData: [],
    partyId: "",
    clientId: "",
    /*搜索框 */
    searchClientTxt: "",
    loading: false,
    typeSelection: "owner",
    searchTxt: "",
    // voucher details panel
    showVoucherPanel: false,
    voucher: null,
  };
  componentDidMount() {
    this.initColumns();
    this.getVouchers(null, 1);
  }
  publishItem = async (clientId) => {
    const parmas = {
      voucherId: this.state.partyId,
      customerId: clientId,
    };
    //customerId-客户弹窗选择
    const result = await reqPublishDis(parmas);
    //status;票券发券
    this.getVouchers(null, this.state.currentPage);
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
        title: "券名",
        dataIndex: "name",
        key: "name",
        responsive: ["lg"],
        ellipsis: true,
      },
      {
        title: "类型",
        dataIndex: "subType",
        key: "subType",
        width: 80,
        responsive: ["lg"],
        render: (text) => {
          return (
            <Tag color="green" key={text}>
              {couponSubTypes.map((item, index) => (
                <span key={index}>{item[text]}</span>
              ))}
            </Tag>
          );
        },
      },
      {
        title: "营销活动",
        dataIndex: "campaign",
        responsive: ["lg"],
        render: (campaign) => {
          return <div>{campaign.name}</div>;
        },
      },
      {
        title: "标签",
        dataIndex: "tags",
        width: 120,
        responsive: ["lg"],
        render: (tags) => {
          return (
            <div>
              {tags
                ? tags.split(",").map((t, index) => (
                    <Tag color="cyan" key={index}>
                      {t}
                    </Tag>
                  ))
                : ""}
            </div>
          );
        },
      },
      {
        title: "有效期",
        colSpan: 2,
        dataIndex: "effective",
        width: 110,
        responsive: ["md"],
      },
      {
        title: "end",
        colSpan: 0,
        dataIndex: "end",
        width: 110,
        responsive: ["md"],
        render: (text) => {
          return <div>{text}</div>;
        },
      },
      {
        title: "优惠金额",
        dataIndex: "valueOff",
        width: 100,
        render: (value, row) => {
          if (row.subType === "COUPON") {
            if (row.type === "AMOUNT")
              return (
                <div style={{ textAlign: "right" }}>
                  <NumberFormat
                    value={value / 100}
                    displayType={"text"}
                    thousandSeparator={true}
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix={"(¥"}
                    suffix={")"}
                  />
                </div>
              );
            else if (row.type === "PERCENT")
              return (
                <div style={{ textAlign: "right" }}>
                  <NumberFormat
                    value={value}
                    displayType={"text"}
                    prefix={"优惠 "}
                    suffix={"%"}
                  />
                </div>
              );
            else return <div style={{ textAlign: "right" }}>{value}</div>;
          } else if (row.subType === "GIFT")
            return (
              <div style={{ textAlign: "right" }}>
                <NumberFormat
                  value={value / 100}
                  thousandSeparator={true}
                  decimalScale={2}
                  fixedDecimalScale={true}
                  displayType={"text"}
                  prefix={"(¥"}
                  suffix={")"}
                />
              </div>
            );
          else return <div style={{ textAlign: "right" }}>{value}</div>;
        },
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 60,
        render: (text) => {
          return (
            <Tag color="green" key={text}>
              {couponStatuses.map((item, index) => (
                <span key={index}>{item[text]}</span>
              ))}
            </Tag>
          );
        },
      },
      {
        title: "操作",
        width: 100,
        //fixed: "right",
        render: (chooseItem) => {
          return (
            <div>
              <b
                onClick={() => {
                  this.showVoucherPanel(chooseItem.id);
                }}
                className="ant-green-link cursor"
              >
                查看
              </b>
              {this.state.typeSelection === "owner" &&
              chooseItem.status === "NEW" ? (
                <>
                  <Divider type="vertical" />
                  <b
                    onClick={() => {
                      this.showList(chooseItem.id);
                    }}
                    className="ant-blue-link cursor"
                  >
                    发放
                  </b>
                </>
              ) : null}
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
  getVouchers = async (values, currentPage, size, typeSelection) => {
    let typeStr = typeSelection ? typeSelection : this.state.typeSelection;
    //owner 我的
    let parmas =
      typeStr === "owner"
        ? {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: size ? size : this.state.size,
            //            orgUid: storageUtils.getUser().orgUid,
            ownerId: this.state.ownerId,
            //            codeType: this.state.codeType,
            status: "NEW",
            searchTxt: values ? values.searchTxt : this.state.searchTxt,
          }
        : {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: size ? size : this.state.size,
            //            orgUid: storageUtils.getUser().orgUid,
            issuerId: this.state.publisherId,
            //            merchantCode: values ? values.merchantCode : "",
            //            codeType: this.state.codeType,
            status: "NEW",
            searchTxt: values ? values.searchTxt : this.state.searchTxt,
          };
    this.setState({ loading: true });
    const result = await reqGetCoupons(parmas);
    const cont = result && result.data ? result.data.entries : [];
    let data = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.length; i++) {
        let type = cont[i].config.discount ? cont[i].config.discount.type : "";
        data.push({
          key: i,
          id: cont[i].id,
          owner: cont[i].owner,
          code: cont[i].code,
          type,
          subType: cont[i].config.type,
          tags: cont[i].category,
          name: cont[i].config.name,
          valueOff:
            cont[i].config.type === "COUPON" && cont[i].config.discount
              ? cont[i].config.discount.valueOff
              : cont[i].config.type === "GIFT" &&
                cont[i].config.productExchangePrice
              ? cont[i].config.productExchangePrice
              : null,
          effective: cont[i].effective,
          end: comEvents.formatExpiry(cont[i].expiry),
          status: cont[i].status,
          campaign: cont[i].campaign,
        });
      }
    }
    this.totalPages = result && result.data ? result.data.totalElements : 0;
    this.setState({
      inited: true,
      vouchers: data,
      total: result.data ? result.data.totalElements : 0,
      merchantCode: "",
      loading: false,
    });
  };
  // onChange = (values) => {
  //   if (values.length !== 0) {
  //     this.setState({
  //       hasChoose: true,
  //       chooseValue: values,
  //       merchantCode: values.merchantCode,
  //     });
  //     //this.getVouchers(values, 0);
  //   }
  // };
  handleChange = (value) => {
    this.setState({
      codeType: value,
    });
  };

  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  onFinish = (values) => {
    this.setState({
      currentPage: 1,
      searchTxt: values.searchTxt,
    });
    this.getVouchers(values, 1);
  };
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getVouchers(null, page);
  };

  handleListTableChange = (page) => {
    this.setState({
      current: page,
    });
    this.getClient(page);
  };
  /*radio 切换*/
  onRadioChange = (e) => {
    //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    this.setState({
      page: 0,
      typeSelection: e.target.value,
      currentPage: 1,
    });
    this.getVouchers(null, 1, null, e.target.value);
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
  handleClientChange = (e) => {
    this.setState({
      searchClientTxt: e.target.value,
    });
  };
  searchValue = () => {
    this.getClient(1, this.state.searchClientTxt);
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
      searchTxt: searchTxt ? searchTxt : this.state.searchClientTxt,
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
    this.totalListPages = result && result.data ? cont.totalElements : 0;
    this.setState({
      listData: data,
      tolistTotaltal: result && result.data ? cont.totalElements : 0,
      loading: false,
      // inited: true,
    });
  };

  getVoucherById = async (id) => {
    let res = await reqGetVoucherById(id);
    let voucher = res && res.data ? res.data.content : {};
    console.log("getVoucherById -> ", voucher);
    this.setState({
      voucher: voucher,
    });
  };

  showVoucherPanel = (id) => {
    this.setState({
      showVoucherPanel: true,
    });
    this.getVoucherById(id);
    console.log("state", this.state);
  };

  closeVoucherPanel = () => {
    this.setState({
      showVoucherPanel: false,
      voucher: null,
    });
  };

  renderContent = () => {
    const {
      vouchers,
      size,
      currentPage,
      /*客户 */
      current,
      listSize,
      listData,
      searchClientTxt,
      showVoucherPanel,
      voucher,
      loading,
    } = this.state;

    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="票券管理"
        ></PageHeader>
        <VoucherQueryForm
          loading={loading}
          onChangeType={this.onRadioChange}
          enableLoading={this.enterLoading}
          onFinish={this.onFinish}
        />
        <Table
          rowKey="key"
          size="small"
          bordered
          dataSource={vouchers}
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
            showSizeChanger={false}
            size="small"
            showTotal={(total) => `总共 ${total} 条数据`}
            disabled={loading}
          />
        </div>
        {showVoucherPanel ? (
          <CouponDetails
            voucher={voucher}
            onClose={this.closeVoucherPanel}
            visible={showVoucherPanel}
          />
        ) : null}
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
                  placeholder="输入姓名、手机号或客户标签搜索"
                  allowClear
                />
              </Col>
              <Col span={6} offset={1}>
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
              className="tableFont"
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
