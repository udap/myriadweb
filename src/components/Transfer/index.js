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
   console.log("direction:", direction);
   console.log("target:", e.target);
 };
  return (
    <Transfer
      {...restProps}
      operations={["添加", "移除"]}
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
    targetKeys: [],
  };

  onChange = (targetKeys) => {
    console.log("Target Keys:", targetKeys);
    this.setState({ targetKeys });
    this.props.chooseItem(targetKeys);
  };

  render() {
    const { targetKeys } = this.state;
    const { treeData } = this.props;
    return (
      <div>
        <TreeTransfer
          dataSource={treeData}
          targetKeys={targetKeys}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default TransferComponent;
