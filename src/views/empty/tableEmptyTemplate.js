import React, { Component } from "react";
import {
  //表头
  PageHeader,
  //搜索栏
  Form,
  Input,
  Row,
  Col,
  Button,
  //表格
  Table,
  Pagination,
} from "antd";
//import storageUtils from "../../utils/storageUtils";
import Loading from "../../components/Loading";
import //getListApi
"../../api";
import "./index.less";

class TableEmpty extends Component {
  state = {
    //表格数据
    inited: false,
    listData: [],
    //分页
    page: 1,
    size: 20,
    currentPage: 1,
    //搜索
    searchTxt: "",
    loading: false,
  };
  componentDidMount() {
    this.initColumns();
    this.getLists(null, 1);
  }
  //初始化表头
  initColumns() {
    this.columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 80,
        render: (text) => {
          return (
            <div>
              -
              {/* <Tag color="green" key={text}>
                {campaignStatuses.map((item, index) => (
                  <span key={index}>{item[text]}</span>
                ))}
              </Tag> */}
            </div>
          );
        },
      },
      {
        title: "操作",
        width: 150,
        render: (chooseItem) => {
          const { id } = chooseItem;
          return (
            <span>
              <b onClick={() => {}} className="ant-blue-link cursor">
                -
              </b>
            </span>
          );
        },
      },
    ];
  }
  //请求当前列表数据
  getLists = async (currentPage) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
    };
    // const result = await getListApi(parmas);
    // const cont = result && result.data ? result.data.content : [];
    // this.totalPages = result && result.data ? result.data.totalElements : 1;
    // this.setState({
    //   inited: true,
    //   listData: cont,
    //   totalPages: result && result.data ? result.data.totalElements : 1,
    // });
  };
  //返回上一页
  backIndex = () => {
    this.props.history.push("/admin/settlement");
  };
  //查询
  searchValue = (value) => {
    this.setState({
      searchTxt: value.searchTxt,
      currentPage: 1,
    });
    this.getLists(value.searchTxt, 1, this.state.value);
  };
  //搜索加载
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  //分页切换
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getLists(null, page);
  };
  //表格数据
  renderTableList = () => {
    let {
      //表格数据
      listData,
      //分页
      size,
      currentPage,
    } = this.state;
    return (
      <div>
        {/* 页表头 */}
        <PageHeader
          className="site-page-header-responsive"
          title="结算明细"
          onBack={this.backIndex}
        ></PageHeader>
        {/* --搜索栏-- */}
        <Form
          onFinish={this.searchValue}
          layout="horizontal"
          name="advanced_search"
          className="ant-advanced-search-form"
          initialValues={{
            searchTxt: "",
          }}
        >
          <Row>
            <Col span={9} label="查询条件">
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
        {/* 列表内容 */}
        <Table
          rowKey="uid"
          size="small"
          bordered
          dataSource={listData}
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
        {/* 列表内容 */}
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
        {this.state.inited ? this.renderTableList() : <Loading />}
      </div>
    );
  }
}

export default TableEmpty;
