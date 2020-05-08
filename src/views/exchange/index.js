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
import {
  reqPermit,
  reqGetExchangeLists,
  reqPublishDis,
  reqGetClients,
} from "../../api";
import { Loading } from "../../components";
import { couponType } from "../../utils/memoryUtils";
import comEvents from "../../utils/comEvents";
import "../../css/common.less";

const { Option } = Select;

class Exchange extends Component {
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
    /*是否有权限 */
    hasAuthority:false
  };
  componentDidMount() {
    this.getList();
  }
  getList = async () => {
    const result = await reqPermit("VIEW_REDEMPTION");
    if (result) {//有权限
      this.setState({
        hasAuthority: true,
      });
      this.getMarkets(null, 1);
    } else {
      this.setState({
        inited: true,
        hasAuthority: false,
      });
    }
  };
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
    // name: cont[i].merchantName,
    //       customerName: cont[i].customerName,
    //       campaignName: cont[i].campaign.name,
    //       voucher: cont[i].voucher.code,
    //       status: cont[i].status,
    //       updatedAt: cont[i].updatedAt,
    this.columns = [
      {
        title: "券号",
        dataIndex: "voucher",
        key: "voucher",
      },
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "营销活动",
        dataIndex: "campaignName",
        key: "campaignName",
      },
      {
        title: "顾客",
        dataIndex: "customerName",
        key: "customerName",
      },
      {
        title: "有效期",
        dataIndex: "updatedAt",
        key: "updatedAt",
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
      //   {
      //     title: "操作",
      //     render: (chooseItem) => {
      //       return (
      //         <div>
      //           {chooseItem.status === "NEW" ? (
      //             <b
      //               onClick={() => {
      //                 //this.showList(chooseItem.id);
      //               }}
      //               className="ant-blue-link cursor"
      //             >
      //               -
      //             </b>
      //           ) : (
      //             "-"
      //           )}
      //         </div>
      //       );
      //     },
      //   },
    ];
  }

  /*
获取列表数据
*/
  getMarkets = async (values, currentPage, searchTxt) => {
    //owner 我的
    let parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      merchantId: this.state.ownerId,
      searchTxt: searchTxt,
    };

    const result = await reqGetExchangeLists(parmas);
    const cont =
      result && result.data && result.data.content
        ? result.data.content.entries
        : [];
    let data = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.length; i++) {
        data.push({
          key: i,
          id: cont[i].id,
          name: cont[i].merchantName,
          customerName: cont[i].customerName,
          campaignName: cont[i].campaign.name,
          voucher: cont[i].voucher.code,
          status: cont[i].status,
          updatedAt: cont[i].updatedAt,
        });
      }
    }
    this.totalPages =
      result && result.data && result.data.content
        ? result.data.content.totalElements
        : 0;
    this.setState({
      inited: true,
      campaigns: data,
      total:
        result && result.data && result.data.content
          ? result.data.content.totalElements
          : 0,
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
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  onFinish = (values) => {
    this.setState({
      searchTxt: values.searchTxt,
    });
    console.log("CouponHome -> onFinish -> values", values);
    this.getMarkets(null, 1, values.searchTxt);
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
  /*radio 切换*/
  onRadioChange = (e) => {
    //提交机构（merchant，只显示在机构审批类)，审批机构（marketer，只显示在机构提交)
    this.setState({
      page: 0,
      chooseRadio: e.target.value,
      currentPage: 1,
    });
    this.getMarkets(null, 1, null, e.target.value);
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
    this.totalListPages = result && result.data ? cont.totalElements : 0;
    this.setState({
      listData: data,
      tolistTotaltal: result && result.data ? cont.totalElements : 0,
      searchClientTxt: "",
      loading: false,
      // inited: true,
    });
  };

  renderContent = () => {
    const {
      campaigns,
      size,
      total,
      currentPage,
      /*客户 */
      current,
      listSize,
      listTotal,
      listData,
      searchClientTxt,
      hasAuthority,
    } = this.state;

    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="核销记录"
        ></PageHeader>
        {hasAuthority? <Form
          onFinish={this.onFinish}
          layout="horizontal"
          name="advanced_search"
          className="ant-advanced-search-form"
          initialValues={{
            searchTxt: "",
            group: "owner",
          }}
        >
          <Row>
            <Col>
              <Form.Item name="group" label="查询条件">
                <Radio.Group onChange={this.onRadioChange}>
                  <Radio value="owner">我的</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item name="searchTxt">
                <Input
                  placeholder="请输入活动名、标签、票券号进行搜索"
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
        </Form>:null}
       
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

export default Exchange;