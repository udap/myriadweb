import React, { useState, useEffect } from "react";
import { Table, Input } from "antd";

import { reqGetSubsidiaries } from "@api";

const BranchSelect = (props) => {
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTxt, setSearchTxt] = useState("");

  const onChange = (_pageIndex) => {
    setPageIndex(_pageIndex);
  };

  const onSearch = (element) => {
    setSearchTxt(element);
  };

  // 获取列表数据
  const fetchData = async (element) => {
    setLoading(true);
    try {
      const result = await reqGetSubsidiaries(element.uid, element);
      if (result.data && result.data.retcode === 0) {
        const { content } = result.data;
        let list = [];
        if (content && content.content && content.content.length !== 0) {
          for (var i = 0; i < content.content.length; i++) {
            let item = content.content[i];
            list.push({
              key: i,
              id: item.uid,
              uid: item.uid,
              fullName: item.fullName,
              name: item.name,
            });
          }
          setTotalPages(
            result &&
              result.data &&
              result.data.content &&
              result.data.content.totalElements
          );
          setData(list);
        }
      }
    } catch (error) {}
    setLoading(false);
  };

  useEffect(() => {
    const params = {
      page: pageIndex - 1,
      size: pageSize,
      uid: props.orgUid,
      searchTxt,
    };
    fetchData(params);
  }, [pageIndex, props.orgUid, searchTxt]);

  return (
    <>
      <Input.Search
        placeholder="请输入机构名、编号、地址查询"
        onSearch={onSearch}
        enterButton
        loading={loading}
        allowClear
      />
      <Table
        size="small"
        rowSelection={{
          type: "radio",
          onChange: (_, selectedRows) => {
            props.onSelectBranch(selectedRows);
          },
        }}
        dataSource={data}
        pagination={{
          pageSize: pageSize,
          current: pageIndex,
          onChange,
          total: totalPages,
          showTotal: (total) => `总共 ${total} 条数据`,
        }}
        loading={loading}
      >
        <Table.Column title="名称" dataIndex="fullName" key="fullName" />
      </Table>
    </>
  );
};

export default BranchSelect;
