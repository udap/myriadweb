import React, { Component } from "react";
import {
  Button,
  Input,
  PageHeader,
  Col,
  Row,
  Table,
  Modal,
} from "antd";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";

import {
  reqPostParties,
  reqDelParty,
  reqGetMerchants,
  reqShowParties,
} from "../../api";
import storageUtils from "../../utils/storageUtils";
import { withRouter } from "react-router-dom";
import { Loading } from "../../components";
import "../../css/common.less";

const { confirm } = Modal;

@withRouter

//没有数据组件
class JoinOrg extends Component {
  state = {
    currentPage: 1,
    listSize: 10,
    size: 6,
    total: 10,
    data: [],
    selectedRowKeys: [], // Check here to configure the default column
    loading: false,
    value: 1,
    list: [],
    isNew: true,
    id: null,
    parties: [],
    visible: false,
    inited: false,
  };
  componentDidMount() {
    let id = this.props.id;
    if (id) {
      this.setState({
        id: this.props.id,
        // parties: this.props.parties,
      });
      this.getMarket(id);
    }
    this.getOrgs(1); //this.state.currentPage
  }
  componentWillMount() {
    this.initColumns();
  }
  initColumns() {
    this.columns = [
      {
        title: "商户名称",
        dataIndex: "partyName",
        key: "partyName",
      },
      {
        title: "操作",
        render: (item) => {
          const { partyId } = item;
          return (
            <span>
              <b
                onClick={() => {
                  let that = this;
                  confirm({
                    title: "确认删除该商户?",
                    icon: <ExclamationCircleOutlined />,
                    okText: "确认",
                    okType: "danger",
                    cancelText: "取消",
                    onOk() {
                      that.delItem(partyId);
                    },
                    onCancel() {},
                  });
                }}
                className="ant-pink-link cursor"
              >
                删除
              </b>
            </span>
          );
        },
      },
    ];
    this.listColumns = [
      {
        title: "商户名称",
        dataIndex: "fullName",
        key: "fullName",
      },
      {
        title: "简称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "操作",
        render: (item) => {
          const { partyId } = item;
          return (
            <span>
              <b
                onClick={() => {
                  this.addOneItem(partyId);
                }}
                className="ant-green-link cursor"
              >
                添加
              </b>
            </span>
          );
        },
      },
    ];
  }
  /*
获取添加选择列表数据 加号
*/
  getOrgs = async (currentPage, searchTxt) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
      excludeCampaignId: this.state.id,
      searchTxt: searchTxt,
    };
    const result = await reqGetMerchants(parmas);
    const cont = result && result.data ? result.data.content : [];
    let data = [];
    if (cont && cont.length !== 0) {
      for (let i = 0; i < cont.content.length; i++) {
        data.push({
          key: cont.content[i].merchant.id.toString(),
          partyId: cont.content[i].merchant.id,
          uid: cont.content[i].merchant.uid,
          name: cont.content[i].merchant.name,
          fullName: cont.content[i].merchant.fullName,
          code: cont.content[i].merchant.code,
        });
      }
    }
    this.totalPages =
      result && result.data && result.data.content ? cont.totalElements : 1;
    this.setState({
      data: data,
      total:
        result && result.data && result.data.content ? cont.totalElements : 1,
      loading: false,
      inited: true,
    });
  };
  showList = () => {
    this.setState({
      visible: true,
      searchTxt:''
    });
    this.getOrgs(1);
  };
  handleCancel = () => {
    this.setState({
      visible: false,
      currentPage: 1,
    });
  };
  //获取当前添加商户 list type=MERCHANT
  getMarket = async (id) => {
    let curInfo = await reqShowParties(id);
    let cont = curInfo.data ? curInfo.data : [];
    this.setState({
      parties: cont.parties,
      loading: false,
    });
  };

  onSelectChange = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys,
    });
  };

  start = () => {
    this.setState({ loading: true });
    let data = this.state.data; //获取的参与商户列表数据
    let selectedRowKeys = this.state.selectedRowKeys;
    if (selectedRowKeys.length !== 0) {
      for (var i = 0; i < selectedRowKeys.length; i++) {
        this.state.list.push({ partyId: selectedRowKeys[i], type: "MERCHANT" });
      }
      this.addItem(this.state.list);
    }

    this.setState({
      list: [],
      selectedRowKeys: [],
      loading: false,
    });
    this.handleCancel();
  };
  addOneItem = async (id) => {
    this.setState({ loading: true });
    let params = {
      parts: [{ partyId: id, type: "MERCHANT" }],
    };
    const result = await reqPostParties(this.state.id, params);
    this.setState({
      visible: false,
      parties: [],
      currentPage: 1,
    });

    this.getMarket(this.state.id);
  };

  addItem = async (newList) => {
    this.setState({ loading: true });
    let params = {
      parts: newList,
    };
    const result = await reqPostParties(this.state.id, params);
    this.setState({
      visible: false,
      parties: [],
      currentPage: 1,
    });

    this.getMarket(this.state.id);
  };

  delItem = async (partyId) => {
    const result = await reqDelParty(this.state.id, partyId);
    this.setState({
      parties: [],
    });
    this.getMarket(this.state.id);
  };
  backHome = () => {
    this.props.history.push("/admin/market");
  };
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getOrgs(page);
  };
  // onShowSizeChange = (current, pageSize) => {
  //   this.setState({
  //     currentPage: current,
  //     size: pageSize,
  //   });
  //   this.getOrgs(current, pageSize);
  // };
  handleOrgChange = (e) => {
    this.setState({
      searchTxt: e.target.value,
    });
  };
  searchValue = (value) => {
    this.setState({
      selectedRowKeys: [],
    });
    this.getOrgs(1, this.state.searchTxt);
  };
  render() {
    const {
      loading,
      selectedRowKeys,
      data,
      parties,
      size,
      listSize,
      currentPage,
      total,
      pageSize,
      totalList,
      searchTxt,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      hideDefaultSelections: true,
      //selections: [Table.SELECTION_ALL],
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div>
        <div>
          <PageHeader
            className="site-page-header-responsive cont"
            extra={[
              <PlusOutlined className="backIcon" onClick={this.showList} />,
            ]}
          ></PageHeader>
          <Table
            columns={this.columns}
            dataSource={parties}
            pagination={false}
            pagination={{
              pageSize: listSize,
              //showQuickJumper: true,
              total: parties.length,
            }}
          />
        </div>

        <Modal
          className="markrt"
          title="入驻商户"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[]}
          width="60%"
        >
          {this.state.inited ? (
            <div>
              <Row style={{ marginBottom: "24px" }}>
                <Col span={14}>
                  <Input
                    name="searchTxt"
                    value={searchTxt}
                    onChange={this.handleOrgChange}
                    placeholder="请输入商户名称、简称、商户码搜索"
                    allowClear
                    onPressEnter={this.searchValue}
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
                size="middle"
                columns={this.listColumns}
                dataSource={data}
                pagination={{
                  pageSize: size,
                  total: this.totalPages,
                  onChange: this.handleTableChange,
                  showTotal: (total) => `总共 ${total} 条数据`,
                }}
                rowSelection={rowSelection}
              />
              <div style={{ marginBottom: 16, marginTop: 16 }}>
                <Button
                  type="primary"
                  onClick={this.backHome}
                  onClick={this.start}
                  disabled={!hasSelected}
                  loading={loading}
                >
                  提交
                </Button>
                <span style={{ marginLeft: 8 }}>
                  {hasSelected ? `选择了 ${selectedRowKeys.length} 个商户` : ""}
                </span>
              </div>
              {/* <div className="pagination">
                <Pagination
                  pageSize={size}
                  current={currentPage}
                  onChange={this.handleTableChange}
                  total={this.totalPages}
                  showTotal={(total) => `总共 ${total} 条数据`}
                  //showSizeChanger={false}
                  //onShowSizeChange={this.onShowSizeChange}
                />
              </div> */}
            </div>
          ) : (
            <Loading />
          )}
        </Modal>
      </div>
    );
  }
}
export default JoinOrg;
