import React, { useState, Component } from "react";
import {
  Table,
  Tag,
  Space,
  Pagination,
  Row,
  Col,
  Form,
  Button,
  Input,
} from "antd";
import { reqGetChildOrgs } from "../../api";
import storageUtils from "../../utils/storageUtils";
import { Loading } from "../../components";
const { Search } = Input;
const columns = [
  {
    title: "名称",
    dataIndex: "fullName",
    key: "fullName",
  },
];
class OrgTable extends Component {
  state = {
    inited: false,
    org: {},
    //分页
    currentPage: 1,
    size: 5,
    total: 1,
    searchTxt: "",
  };
  componentDidMount() {
    this.getChildOrg(1);
  }
  /*
获取列表数据
*/
  getChildOrg = async (currentPage, value) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      uid: storageUtils.getUser().orgUid,
      searchTxt: value ? value : this.state.searchTxt,
    };
    const result = await reqGetChildOrgs(storageUtils.getUser().orgUid, parmas);
    const cont = result && result.data ? result.data.content : [];
    let list = [];
    if (cont && cont.content && cont.content.length !== 0) {
      //处理一下数据格式
      for (var i = 0; i < cont.content.length; i++) {
        let item = cont.content[i];
        list.push({
          key: i,
          id: item.uid,
          uid: item.uid,
          fullName: item.fullName,
          name: item.name,
        });
      }
    }
    this.totalPages =
      result && result.data && result.data.content
        ? result.data.content.totalElements
        : 1;
    this.setState({
      org: list,
      total:
        result && result.data && result.data.content
          ? result.data.content.totalElements
          : 1,
      inited: true,
      loading: false,
    });
  };
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getChildOrg(page);
  };
  enterLoading = () => {
    this.setState({
      loading: true,
    });
  };
  searchValue = (value) => {
    this.setState({
      currentPage: 1,
      searchTxt: value,
    });
    this.getChildOrg(1, value);
  };
  render() {
    const { org, size, currentPage, total, searchTxt, loading } = this.state;
    return (
      <div>
        {/* --搜索栏-- */}
        <Search
          placeholder="输入名称/编码/地址搜索"
          onSearch={this.searchValue}
          enterButton
          loading={loading}
          allowClear
        />
        {this.state.inited ? (
          <div>
            <Table
              className="table-small"
              size="small"
              rowSelection={{
                type: "radio",
                onChange: (selectedRowKeys, selectedRows) => {
                  this.props.selectedRows(selectedRows);
                },
              }}
              columns={columns}
              dataSource={org}
              pagination={false}
            />
            <div className="pagination">
              <Pagination
                size="small"
                pageSize={size}
                current={currentPage}
                onChange={this.handleTableChange}
                total={this.totalPages}
                showTotal={(total) => `总共 ${total} 条数据`}
              />
            </div>
          </div>
        ) : (
          <Loading />
        )}
      </div>
    );
  }
}

export default OrgTable;
