import React, { Component } from "react";
import {
  Button,
  Form,
  Col,
  Row,
  InputNumber,
  Drawer,
  notification,
  Checkbox,
  Tag,
  Collapse,
} from "antd";
import { TreeSelectComponent } from "../../../components";
import comEvents from "../../../utils/comEvents";
import { reqGetTags } from "../../../api";

const leftTableColumns = [
  {
    dataIndex: "title",
    title: "可选公共标签",
  },
];
const rightTableColumns = [
  {
    dataIndex: "title",
    title: "已选公共标签",
  },
];
class MerchantTag extends Component {
  state = {
    selectedTags: this.props.selectedTags,
    tagsData: [],
    targetKeys: [],
    targetTitles: [],
    showTagForm: this.props.showTagForm,
  };
  componentDidMount = () => {
    this.reqGetTags(1);
  };
  //树控件的数据
  tree = (cont) => {
    const list = [];
    for (let i = 0; i < cont.length; i++) {
      const key = cont[i].name; //`${path}-${i}`;
      const treeNode = {
        title: cont[i].name,
        key,
        description: cont[i].description,
        tag: cont[i].type,
      };
      list.push(treeNode);
    }
    return list;
  };
  //获取公共标签
  reqGetTags = async (currentPage) => {
    let { size } = this.state;
    const parmas = {
      type: "MERCHANT",
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentTagPage,
      size: 1000, //size,
    };
    const result = await reqGetTags(parmas);
    let cont =
      result &&
      result.data &&
      result.data.content &&
      result.data.content.content
        ? result.data.content.content
        : [];
    const tree = this.tree(cont);
    this.totalTagPages = cont.totalElements ? cont.totalElements : 1;
    this.setState({
      tagsData: tree,
      //totalTagPages:
    });
  };
  onSelectCommonTags = (values) => {
    let selectedTags = comEvents.mergeArrays(
      this.state.selectedTags,
      this.state.targetKeys
    );
    this.setState({
      showTagForm: false,
    });
    this.props.onSelectCommonTags(selectedTags);
    this.props.handleCancel();
  };
  choosehandle = (value) => {
    //nextTargetKeys
    this.setState({
      targetKeys: value,
      //targetTitles: arr,
    });
  };
  handleCancel = (e) => {
    this.setState({
      showTagForm: false,
    });
  };
  render() {
    const {
      tagsData,
      targetKeys,
      //totalTagPages,
    } = this.state;
    const { showTagForm } = this.state;
    return (
      <div>
        <Drawer
          width={480}
          title="设置标签"
          visible={showTagForm}
          onClose={this.handleCancel}
          footer={null}
        >
          <Form
            layout="vertical"
            name="basic"
            initialValues={{
              tag: [],
            }}
            onFinish={this.onSelectCommonTags}
          >
            <div className="grey-block">选择公共标签设置</div>
            <Form.Item name="tag">
              <TreeSelectComponent
                mockData={tagsData}
                targetKeys={targetKeys}
                choosehandle={this.choosehandle}
                showSearch={true}
                leftTableColumns={leftTableColumns}
                rightTableColumns={rightTableColumns}
                //totalTagPages={totalTagPages}
                //handleTagTableChange={this.handleTagTableChange}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={this.state.loading}
              >
                提交
              </Button>
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    );
  }
}

export default MerchantTag;
