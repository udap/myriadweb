import React, { Component } from "react";
import { Transfer, Switch, Table, Tag } from "antd";
import difference from "lodash/difference";
// Customize Table Transfer
const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
  <Transfer {...restProps} showSelectAll={false}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const columns = direction === "left" ? leftColumns : rightColumns;

      const rowSelection = {
        getCheckboxProps: (item) => ({
          disabled: listDisabled || item.disabled,
        }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };

      return (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          size="small"
          style={{ pointerEvents: listDisabled ? "none" : null }}
          onRow={({ key, disabled: itemDisabled }) => ({
            onClick: () => {
              if (itemDisabled || listDisabled) return;
              onItemSelect(key, !listSelectedKeys.includes(key));
            },
          })}
        />
      );
    }}
  </Transfer>
);

const leftTableColumns = [
  {
    dataIndex: "title",
    title: "名称",
  },
  // {
  //   dataIndex: "tag",
  //   title: "类型",
  //   render: (tag) => <Tag>{tag}</Tag>,
  // },
];
const rightTableColumns = [
  {
    dataIndex: "title",
    title: "名称",
  },
];

class TreeSelectComponent extends React.Component {
  state = {
    targetKeys: this.props.targetKeys ? this.props.targetKeys : [],
    showSearch: true,
  };

  onChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
    this.props.choosehandle(nextTargetKeys);
  };

  render() {
    const { showSearch, targetKeys } = this.state;
    const { mockData } = this.props;
    return (
      <div>
        <TableTransfer
          dataSource={mockData}
          targetKeys={targetKeys}
          showSearch={showSearch}
          onChange={this.onChange}
          filterOption={(inputValue, item) =>
            item.title.indexOf(inputValue) !== -1 ||
            item.tag.indexOf(inputValue) !== -1
          }
          leftColumns={this.props.leftTableColumns}
          rightColumns={this.props.rightTableColumns}
        />
      </div>
    );
  }
}

export default TreeSelectComponent;
