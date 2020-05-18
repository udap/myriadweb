import React, { Component } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  DatePicker,
  Input,
  Row,
  Col,
  Pagination,
  Table,
  PageHeader,
  notification,
} from "antd";
import moment from "moment";
import storageUtils from "../../utils/storageUtils";
import { settlementTypes } from "../../utils/constants";
/*公共表单验证提示 */
import defaultValidateMessages from "../../utils/comFormErrorAlert";
/*公共事件 */
import comEvents from "../../utils/comEvents";
import { reqGetOrgLists, reqGetCampaigns, reqAddSettlement } from "../../api";
import "./index.less";

const { Option } = Select;
class SettlementNew extends Component {
  state = {
    /**发布客户 */
    visible: false,
    current: 1,
    listSize: 5,
    listTotal: 1,
    listData: [],
    partyId: "",
    clientId: "",
    /*搜索框 */
    searchClientTxt: "",
    loading: false,
    /*公共modal部分 */
    modalTitle: "activity",
    orgName: "",
    merchantName: "",
    /*表单数据 */
    recurringType: "MONTHLY",
    marketerId: "",
    campaignId: "",
    beginDate: "",
    currentItem: "",
  };
  componentDidMount() {
    this.initColumns();
    this.setState({
      beginDate: comEvents.formatDate(
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      ),
    });
  }
  onFinish = async (values) => {
    if (values.recurringType !== "NONE" && !this.state.marketerId) {
      notification.info({
        message: "请选择营销机构",
      });
      return false;
    }
    if (values.recurringType === "NONE" && !this.state.campaignId) {
      notification.info({
        message: "请选择营销活动",
      });
      return false;
    }
    let params =
      values.recurringType === "NONE"
        ? {
            recurringType: values.recurringType,
            merchantId: storageUtils.getUser().orgId,
            //marketerId: this.state.marketerId,
            campaignId: this.state.campaignId,
          }
        : {
            recurringType: values.recurringType,
            merchantId: storageUtils.getUser().orgId,
            marketerId: this.state.marketerId,
            beginDate: this.state.beginDate,
          };
    const result = await reqAddSettlement(params);
    if (result.data.retcode === 0) {
      notification.success({ message: "创建成功！" });
      this.props.history.push("/admin/settlement");
    }
  };

  initColumns() {
    this.listColumns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "操作",
        width: 120,
        render: (item) => {
          const { id } = item;
          return (
            <span>
              <b
                onClick={() => {
                  this.chooseItem(item);
                }}
                className="ant-green-link cursor"
              >
                选择
              </b>
            </span>
          );
        },
      },
    ];
  }
  chooseItem = (item) => {
    this.setState({
      visible: false,
      currentItem: item,
    });
    if (this.state.modalTitle === "activity") {
      this.setState({
        merchantName: item.name,
        campaignId: item.id,
      });
    } else {
      this.setState({
        orgName: item.name,
        marketerId: item.id,
      });
    }
  };
  /*返回上一页*/
  backIndex = () => {
    this.props.history.push("/admin/settlement");
  };
  /*选择客户机构 */
  choose = (title) => {
    this.setState({
      visible: true,
      modalTitle: title,
    });
    this.getLists(1, "", title);
  };
  /*关闭弹窗 */
  handleCancel = () => {
    this.setState({
      visible: false,
      searchClientTxt: "",
      current: 0,
    });
  };
  /*搜索框输入 */
  handleClientChange = (e) => {
    this.setState({
      searchClientTxt: e.target.value,
    });
  };
  /*查询操作*/
  searchValue = () => {
    this.getLists(1, this.state.searchClientTxt);
  };
  /*
获取选择列表数据 加号
*/
  getLists = async (currentPage, searchTxt, title) => {
    // get /merchants/{uid}/orgs
    // 参数： searchTxt
    let parmas;
    let result;
    let data = [];
    let str = title ? title : this.state.modalTitle;
    if (str === "activity") {
      /*营销活动*/
      const id = storageUtils.getUser().orgId;
      parmas = {
        page: currentPage >= 0 ? currentPage - 1 : this.state.current,
        size: this.state.listSize,
        searchTxt: searchTxt ? searchTxt : "",
        partyId: id,
        partyType: "MERCHANT",
      };

      result = await reqGetCampaigns(parmas);
      const cont = result && result.data ? result.data.content : [];
      if (cont.length !== 0) {
        for (let i = 0; i < cont.length; i++) {
          data.push({
            key: i,
            uid: cont[i].uid,
            id: cont[i].id,
            name: cont[i].name,
          });
        }
      }
      this.totalListPages =
        result && result.data ? result.data.totalElements : 1;
      this.setState({
        listData: data,
        tolistTotaltal: result && result.data ? result.data.totalElements : 1,
        searchClientTxt: "",
        loading: false,
        // inited: true,
      });
    } else {
      /*营销机构*/
      parmas = {
        page: currentPage >= 0 ? currentPage - 1 : this.state.current,
        size: this.state.listSize,
        searchTxt: searchTxt ? searchTxt : "",
      };
      const uid = storageUtils.getUser().orgUid;
      result = await reqGetOrgLists(uid, parmas);
      const cont = result && result.data ? result.data.content : [];
      if (cont.length !== 0) {
        for (let i = 0; i < cont.content.length; i++) {
          data.push({
            key: i,
            uid: cont.content[i].org.uid,
            id: cont.content[i].org.id,
            name: cont.content[i].org.name,
          });
        }
      }
      this.totalListPages = result && result.data ? cont.totalElements : 1;
      this.setState({
        listData: data,
        tolistTotaltal: result && result.data ? cont.totalElements : 1,
        searchClientTxt: "",
        loading: false,
        // inited: true,
      });
    }
  };
  /*日期选择 */
  changeDate = (data, dataStr) => {
    this.setState({
      beginDate: dataStr,
    });
  };
  /*分页切换 */
  handleListTableChange = (page) => {
    this.setState({
      current: page,
    });
    this.getLists(page, "", this.state.modalTitle);
  };
  render() {
    const dateFormat = "YYYY-MM-DD";
    const {
      /*客户 */
      current,
      listSize,
      listTotal,
      listData,
      searchClientTxt,
      marketerId,
      campaignId,
    } = this.state;
    const begin = comEvents.formatDate(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    );
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive"
          title="新增结算"
          onBack={this.backIndex}
        ></PageHeader>
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 12 }}
          name="control-hooks"
          onFinish={this.onFinish}
          initialValues={{
            marketerId: marketerId,
            campaignId: campaignId,
            group: "marketer",
            recurringType: "MONTHLY",
          }}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <Form.Item name="recurringType" label="结算类型">
            <Select
              placeholder="请选择结算类型"
              onChange={this.onGenderChange}
              allowClear
            >
              {settlementTypes.map((item) => {
                return <Option value={item.value}>{item.name}</Option>;
              })}
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.recurringType !== currentValues.recurringType
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("recurringType") !== "NONE" ? (
                <div>
                  <Form.Item name="marketerId" label="营销机构">
                    <Row>
                      <Col span={19}>
                        <Input disabled value={this.state.orgName} />
                      </Col>
                      <Col span={5} className="fr">
                        <Button
                          type="primary"
                          onClick={this.choose.bind(this, "org")}
                        >
                          选择营销机构
                        </Button>
                      </Col>
                    </Row>
                  </Form.Item>
                  <Form.Item name="time" label="交易起始时间">
                    <DatePicker
                      defaultValue={moment(begin, dateFormat)}
                      onChange={this.changeDate}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
              ) : (
                <Form.Item name="campaignId" label="营销活动">
                  <Row>
                    <Col span={19}>
                      <Input disabled value={this.state.merchantName} />
                    </Col>
                    <Col span={5} className="fr">
                      <Button
                        type="primary"
                        onClick={this.choose.bind(this, "activity")}
                      >
                        选择营销活动
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item
            wrapperCol={{ span: 16, offset: 6 }}
            style={{ marginTop: "24px" }}
          >
            <Button type="primary" htmlType="submit">
              创建
            </Button>
          </Form.Item>
        </Form>
        <Modal
          title={
            this.state.modalTitle === "activity"
              ? "选择营销活动"
              : "选择营销机构"
          }
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
                  placeholder={
                    this.state.modalTitle === "activity"
                      ? "请输入名称进行搜索"
                      : "请输入名字进行搜索"
                  }
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
              />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default SettlementNew;
