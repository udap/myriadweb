import React, { Component } from "react";
import {
  Button,
  Form,
  Col,
  Row,
  Radio,
  InputNumber,
  Drawer,
  //notification,
  Checkbox,
  Select,
  Collapse,
  Cascader,
  Modal,
} from "antd";
import { reqGetTags } from "../../api";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import {  TreeSelectComponent } from "../../components";
import { ChinaRegions } from "../../utils/china-regions";
import CampaignMerchant from "./campaignMerchant";
import comEvents from "../../utils/comEvents";
import "./index.less";
const { Panel } = Collapse;

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
//teps3样式
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
};

class StepRules extends Component {
  state = {
    rules: this.props.rules,
    province: "重庆市",
    city: "重庆市",
    district: "渝中区",
    showTagForm: false,
    //tag
    tagsData: [],
    targetKeys: [],
    targetTitles: [],
    totalTagPages: 0,
    currentTagPage: 1,
    expandedRowKeys: [],
    tagType: "free",
    regionType: "z",
    orderStatus: false,
    merchantStatus: false,
    tagStatus: false,
    regionStatus: false,
    newRegions: [],
    provinceRegions: [],
    districtRegions:[]
  };
  componentDidMount() {
  }
  onRadioChange = (name, e) => {
    this.setState({
      [name]: e.target.value,
    });
   
  };
  onCheckboxChange = (name, checkedValues) => {
    this.setState({
      [name]: checkedValues.length !== 0 ? true : false,
    });
  };
 onFinish = (values) => {
    };
  renderRules = () => {
    const {
      orderRules,
      merchantRules,
      tagRules,
      regionRules,
    } = this.state.rules;
    const {
      province,
      city,
      district,
      tagType,
      regionType,
      orderStatus,
      merchantStatus,
      tagStatus,
      regionStatus,
    } = this.state;
    
    return (
      <div>
        {/* { name: “MinimumValue”, option: "输入的值"} 
        指定商户规则：{ name: "SelectedMerchants", option: "逗号分隔的商户id字符串"}
        指定标签规则：{ name: "SelectedTags",option:"逗号分隔的标签"}
        指定区域规则：{ name: "SelectedRegions", option: "上面定义的jsonTxt" }*/}
        <Form
          name="validate_other"
          className="steps"
          {...formItemLayout}
          onFinish={this.onFinish}
          colon={false}
          initialValues={{
            orderRules: {
              name: orderRules.name,
              option: orderRules.option,
            },
            merchantRules: {
              name: merchantRules.name,
              option: merchantRules.option,
            },
            tagRules: {
              name: tagRules.name,
              option: tagRules.option,
            },
            regionRules: {
              name: regionRules.name,
              option:
                regionType === "p"
                  ? [province]
                  : regionType === "d"
                  ? [province, city]
                  : [province, city, district],
            },
            tagType: tagType,
            regionType: regionType,
          }}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <Collapse defaultActiveKey={["1", "2"]}>
            <Panel
              size="small"
              header="订单相关规则"
              key="1"
              // extra={<a href="#">添加满减规则</a>}
            >
              <Form.Item name={["orderRules", "name"]} label="&nbsp;">
                <Checkbox.Group
                  onChange={this.onCheckboxChange.bind(this, "orderStatus")}
                >
                  <Row>
                    <Col>
                      <Checkbox
                        value="MinimumValue"
                        style={{
                          lineHeight: "32px",
                        }}
                      >
                        满减规则
                      </Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
              {orderStatus ? (
                <Form.Item
                  label="最低消费金额(元)："
                  name={["orderRules", "option"]}
                >
                  <InputNumber />
                </Form.Item>
              ) : null}
            </Panel>
            <Panel
              size="small"
              header="商户相关规则"
              key="2"
              // extra={<a href="#">添加商户</a>}
            >
              <Form.Item
                name={["merchantRules", "name"]}
                label="&nbsp;"
                rules={[
                  {
                    required: true,
                    message: "请选择指定商户!",
                  },
                ]}
              >
                <Checkbox.Group
                  onChange={this.onCheckboxChange.bind(this, "merchantStatus")}
                >
                  <Row>
                    <Col>
                      <Checkbox
                        value="SelectedMerchants"
                        style={{
                          lineHeight: "32px",
                        }}
                      >
                        指定商户
                      </Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
              {merchantStatus ? (
                <div className="stepCont site-card-wrapper">
                  <CampaignMerchant
                    id={this.state.id}
                    parties={this.state.parties}
                    showBtn={false}
                  />
                </div>
              ) : null}
              {/* A. 指定商户 B. 指定商户标签 C. 指定区域。 */}
              <Form.Item name={["tagRules", "name"]} label="&nbsp;">
                <Checkbox.Group
                  onChange={this.onCheckboxChange.bind(this, "tagStatus")}
                >
                  <Row>
                    <Col>
                      <Checkbox
                        value="SelectedTags"
                        style={{
                          lineHeight: "32px",
                        }}
                      >
                        指定标签
                      </Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
              {tagStatus ? (
                <div>
                  <Form.Item label="&nbsp;">
                    <b
                      className="ant-green-link cursor"
                      onClick={() => this.showTagsDrawer()}
                    >
                      选择标签
                    </b>
                  </Form.Item>
                </div>
              ) : null}
              <Form.Item name={["regionRules", "name"]} label="&nbsp;">
                <Checkbox.Group
                  onChange={this.onCheckboxChange.bind(this, "regionStatus")}
                >
                  <Row>
                    <Col>
                      <Checkbox
                        value="SelectedRegions"
                        style={{
                          lineHeight: "32px",
                        }}
                      >
                        指定区域
                      </Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
              {regionStatus ? (
                <div>
                  <Form.Item name="regionType" label="区域范围：">
                    <Radio.Group
                      onChange={this.onRadioChange.bind(this, "regionType")}
                    >
                      <Radio value="p">省</Radio>
                      <Radio value="d">市</Radio>
                      <Radio value="z">区</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    name={["regionRules", "option"]}
                    label="地区："
                    // rules={[
                    //   {
                    //     type: "array",
                    //     required: true,
                    //     message: "请选择地区!",
                    //   },
                    // ]}
                  >
                    {regionType === "p" ? (
                      <Cascader
                        defaultValue={[province]}
                        options={comEvents.siftRegion(true)} //{provinceRegions}
                        // onChange={this.onRegionChange}
                        //placeholder="请选择地区"
                      />
                    ) : regionType === "d" ? (
                      <Cascader
                        defaultValue={[province, city]}
                        options={comEvents.siftRegion(true, true)} //{provinceRegions}
                        // onChange={this.onRegionChange}
                        //placeholder="请选择地区"
                      />
                    ) : (
                      <Cascader
                        defaultValue={[province, city, district]}
                        options={ChinaRegions}
                        // onChange={this.onRegionChange}
                        //placeholder="请选择地区"
                      />
                    )}
                  </Form.Item>
                </div>
              ) : null}
            </Panel>
          </Collapse>
          <Form.Item
            wrapperCol={{
              span: 12,
              offset: 6,
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              className="step-marginTop"
              // disabled={this.state.disabledNext}
            >
              下一步
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
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
  //添加展示抽屉
  showTagsDrawer = (item) => {
    this.setState({
      showTagForm: true,
      //chooseItem: item,
      //targetKeys: item.tags,
    });
    this.reqGetTags(1);
  };
  handleCancel = (e) => {
    this.setState({
      showTagForm: false,
    });
  };
  choosehandle = (value, arr) => {
    this.setState({
      targetKeys: value,
      targetTitles: arr,
    });
  };
  renderTagForm = () => {
    const {
      showTagForm,
      radio,
      chooseItem,
      tagsData,
      targetKeys,
      totalTagPages,
    } = this.state;
    return (
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
            radio: radio,
            tag: [],
          }}
          onFinish={this.submitCommonTags}
        >
          <div class="grey-block">选择公共标签设置</div>
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
    );
  };
  render() {
    const { showTagForm } = this.state;
    return (
      <div>
        {this.renderRules()}
        {showTagForm ? this.renderTagForm() : null}
      </div>
    );
  }
}

export default StepRules;
