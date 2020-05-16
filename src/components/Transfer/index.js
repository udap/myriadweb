import React, { Component } from "react";
import { Transfer, Tree } from "antd";
import './index.less'
const { TreeNode } = Tree;

// Customize Table Transfer
const isChecked = (selectedKeys, eventKey) => {
  return selectedKeys.indexOf(eventKey) !== -1;
};

const generateTree = (treeNodes = [], checkedKeys = []) => {
  return treeNodes.map(({ children, ...props }) => (
    <TreeNode
      {...props}
      disabled={checkedKeys.includes(props.key)}
      key={props.key}
    >
      {generateTree(children, checkedKeys)}
    </TreeNode>
  ));
};

const TreeTransfer = ({ dataSource, targetKeys, ...restProps }) => {
  const transferDataSource = [];
  function flatten(list = []) {
    list.forEach((item) => {
      transferDataSource.push(item);
      flatten(item.children);
    });
  }
  flatten(dataSource);

 function handleScroll (direction, e){
 };
  return (
    <Transfer
      {...restProps}
      targetKeys={targetKeys}
      dataSource={transferDataSource}
      className="tree-transfer"
      render={(item) => item.title}
      showSelectAll={true}
      onScroll={handleScroll}
    >
      {({ direction, onItemSelect, selectedKeys }) => {
        if (direction === "left") {
          const checkedKeys = [...selectedKeys, ...targetKeys];
          return (
            <Tree
              blockNode
              checkable
              checkStrictly
              defaultExpandAll
              checkedKeys={checkedKeys}
              onCheck={(
                _,
                {
                  node: {
                    props: { eventKey },
                  },
                }
              ) => {
                onItemSelect(eventKey, !isChecked(checkedKeys, eventKey));
              }}
              onSelect={(
                _,
                {
                  node: {
                    props: { eventKey },
                  },
                }
              ) => {
                onItemSelect(eventKey, !isChecked(checkedKeys, eventKey));
              }}
            >
              {generateTree(dataSource, targetKeys)}
            </Tree>
          );
        }
      }}
    </Transfer>
  );
};

class TransferComponent extends Component {
  state = {
    targetKeys: this.props.targetKeys ? this.props.targetKeys : [],
  };

  onChange = (targetKeys) => {
    this.setState({ targetKeys });
    this.props.chooseItem(targetKeys);
  };

  render() {
    const { targetKeys } = this.state;
    const { treeData } = this.props;
    return (
      <div>
        <TreeTransfer
          titles={["可设置权限", "分组权限"]}
          dataSource={treeData}
          targetKeys={targetKeys}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default TransferComponent;
