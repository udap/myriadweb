import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Tag,
  Modal,
  notification,
  Radio,
  Form,
  Row,
  Col,
  Select,
  Pagination,
} from "antd";
import storageUtils from "../../utils/storageUtils";
import { reqGetCoupons, reqPublishDis, reqGetClients } from "../../api";
import { Loading } from "../../components";
import { couponStatuses } from "../../utils/constants";
import comEvents from "../../utils/comEvents";
import "../../css/common.less";
import "./index.less";

const { Option } = Select;

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
    listSize: 5,
    listTotal: 0,
    listData: [],
    partyId: "",
    clientId: "",
    /*搜索框 */
    searchClientTxt: "",
    loading: false,
    chooseRadio: "owner",
    searchCouponTxt: "",
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
        title: "营销活动",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "标签",
        dataIndex: "tags",
        render: (tags) => {
          return <div>{tags ? tags.split(",").map((t,index)=><Tag color="cyan">{t}</Tag>) : ""}</div>
        },
      },
      {
        title: "有效期",
        colSpan: 2,
        dataIndex: "effective",
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
        render: (text) => {
          return <div>{text}</div>;
        },
      },
      {
        title: "状态",
        dataIndex: "status",
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
  getVouchers = async (values, currentPage, size, chooseRadio) => {
    let typeStr = chooseRadio ? chooseRadio : this.state.chooseRadio;
    //owner 我的
    let parmas =
      typeStr === "owner"
        ? {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: size ? size : this.state.size,
            orgUid: storageUtils.getUser().orgUid,
            ownerId: this.state.ownerId,
            issuerId: "",
            merchantCode: values ? values.merchantCode : "",
            codeType: this.state.codeType,
            searchTxt: values
              ? values.searchCouponTxt
              : this.state.searchCouponTxt,
          }
        : {
            page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
            size: size ? size : this.state.size,
            orgUid: storageUtils.getUser().orgUid,
            ownerId: "",
            issuerId: this.state.publisherId,
            merchantCode: values ? values.merchantCode : "",
            codeType: this.state.codeType,
            searchTxt: values
              ? values.searchCouponTxt
              : this.state.searchCouponTxt,
          };

    const result = await reqGetCoupons(parmas);
    const cont = result && result.data ? result.data.entries : [];
    let data = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.length; i++) {
        let discountType = cont[i].config.discount.type;
        let valueOff = cont[i].config.discount.valueOff;
        if (discountType === "AMOUNT")
          valueOff = "¥"+comEvents.formatCurrency(valueOff);
        else if (discountType === "PERCENT")
          valueOff = valueOff + "%";
        data.push({
          key: i,
          id: cont[i].id,
          owner: cont[i].owner,
          code: cont[i].code,
          tags: cont[i].category,
          name: cont[i].campaign.name,
          valueOff: valueOff,
          effective: cont[i].effective,
          expiry: cont[i].expiry,
          status: cont[i].status,
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
      searchCouponTxt: values.searchCouponTxt,
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
      chooseRadio: e.target.value,
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

  renderContent = () => {
    const {
      vouchers,
      size,
      total,
      currentPage,
      /*客户 */
      current,
      listSize,
      listTotal,
      listData,
      searchClientTxt,
      merchantCode,
      searchCouponTxt,
    } = this.state;

    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="票券管理"
        ></PageHeader>

        <Form
          onFinish={this.onFinish}
          layout="horizontal"
          name="advanced_search"
          className="ant-advanced-search-form"
          initialValues={{
            merchantCode: "",
            searchCouponTxt: "",
            group: "owner",
          }}
        >
          <Row>
            <Col>
              <Form.Item name="group" label="查询条件">
                <Radio.Group onChange={this.onRadioChange}>
                  <Radio value="owner">我的</Radio>
                  <Radio value="publisherId">机构发行的</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Form.Item name="searchCouponTxt">
                <Input
                  placeholder="输入券号、活动名或活动标签查询"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="merchantCode">
                <Input placeholder="请输入商户编码" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item className="mid">
                <Select defaultValue="UPCODE" onChange={this.handleChange}>
                  <Option value="UPCODE">银联码</Option>
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
        <Table
          rowKey="key"
          size="small"
          bordered
          dataSource={vouchers}
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
            showTotal={(total) => `总共 ${total} 条数据`}
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
