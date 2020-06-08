import React, { Component } from "react";
import {
  Button,
  Form,
  Col,
  Row,
  InputNumber,
  notification,
  Checkbox,
  Tag,
  Collapse,
} from "antd";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import MerchantSelect from "./rule/merchantSelect";
import MerchantRegion from "./rule/merchantRegion";
import MerchantTag from "./rule/merchantTag";
import { reqAddCampaignRule } from "../../api";
import comEvents from "../../utils/comEvents";
import "../../css/common.less";
import "./index.less";
const { Panel } = Collapse;

//teps3样式
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
};

class ConfigureRules extends Component {
  state = {
    rules: this.props.rules,
    province: "重庆市",
    city: "重庆市",
    district: "渝中区",
    showTagForm: false,
    // selected merchants
    selectedRowKeys: [],
    merchants: [],
    //tag
    selectedTags: [],

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
    districtRegions: [],
    //region
    selectedRegion: [],
    //province...
    showMerchantSelect: false,
    showMerchantRegion: false,
    id: "",
  };
  componentDidMount() {
    let id = this.props.id;
    this.setState({
      id: id,
    });
  }
  onRadioChange = (name, value) => {
    this.setState({
      [name]: value,
    });
  };
  onCheckboxChange = (name, checkedValues) => {
    this.setState({
      [name]: checkedValues.length !== 0 ? true : false,
    });
  };
  onClickSelectMerchants = () => {
    this.setState({
      showMerchantSelect: true,
    });
  };
  handleClose = (removedItem, name, selectedRowKeys) => {
    if (selectedRowKeys) {
      const keys = this.state.selectedRowKeys.filter(
        (item) => item !== removedItem.key
      );
      this.setState({
        selectedRowKeys: keys,
      });
    } else {
      const items = this.state[name].filter((item) => item !== removedItem);
      this.setState({
        [name]: items,
      });
    }
  };
  onFinish = async (values) => {
    let params = [];
    const {
      orderStatus,
      merchantStatus,
      tagStatus,
      regionStatus,
    } = this.state;

    if (orderStatus && !values.minimum) {
      notification.info({
        message: "请输入最低消费金额！",
      });
      return false;
    }
    if (
      !merchantStatus ||
      (merchantStatus && this.state.merchants.length === 0)
    ) {
      notification.info({
        message: "请选择指定商户！",
      });
      return false;
    }
    // 这是订单规则部分
    if (orderStatus) {
      params.push({
        namespace: "REDEMPTION",
        expression: "#MinimumValue",
        rules: [
          {
            name: "MinimumValue",
            option: values.minimum,
          },
        ],
      });
    }
    // 这是商户规则部分
    const { selectedRowKeys, selectedRegion, selectedTags } = this.state;
    console.log("selectedRegion", selectedRegion);
    let expression1 = "#SelectedMerchants ";
    let expression2 = tagStatus ? "and #SelectedMerchants " : "";
    let expression3 = regionStatus ? "and #SelectedRegions" : "";
    //逗号分隔的商户的ID列表
    let rules1 = {
      name: "SelectedMerchants",
      option: selectedRowKeys,
    };

    let rules = [rules1];
    //逗号分隔的标签
    if (selectedTags.length !== 0) {
      rules.push({
        name: "SelectedTags",
        option: selectedTags,
      });
    }
    //选择的区域JSON数据
    if (selectedRegion.length !== 0) {
      rules.push({
        name: "SelectedRegions",
        option: comEvents.formatRegions(selectedRegion),
      });
    }
    if (merchantStatus || tagStatus || regionStatus) {
      params.push({
        namespace: "REDEMPTION",
        expression: expression1 + expression2 + expression3,
        rules: rules,
      });
    }

    let result = await reqAddCampaignRule(this.state.id, params);
    if (result.data.retcode !== 1) {
      notification.success({
        message: "操作成功！",
      });
    }
  };
  backIndex = () => {
    this.props.history.push("/admin/campaign");
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
      minimum,
    } = this.state;

    return (
      <div>
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

            //new
            minimum: minimum,
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
                <Form.Item label="最低消费金额(元)：" name="minimum">
                  <InputNumber />
                </Form.Item>
              ) : null}
            </Panel>
            <Panel size="small" header="商户相关规则" key="2">
              <Form.Item name={["merchantRules", "name"]} label="&nbsp;">
                <Row>
                  <Col>
                    <Checkbox.Group
                      onChange={this.onCheckboxChange.bind(
                        this,
                        "merchantStatus"
                      )}
                    >
                      <Checkbox
                        value="SelectedMerchants"
                        style={{
                          lineHeight: "32px",
                        }}
                        checked={this.state.merchants.length > 0}
                      >
                        指定商户
                      </Checkbox>
                    </Checkbox.Group>
                  </Col>
                </Row>
                {merchantStatus ? (
                  <Row>
                    <Col>
                      {this.state.merchants.map((t, index) => (
                        <Tag
                          onClose={() =>
                            this.handleClose(t, "merchants", "selectedRowKeys")
                          }
                          color="blue"
                          key={t}
                          closable
                        >
                          {t.fullName}
                        </Tag>
                      ))}
                    </Col>
                  </Row>
                ) : null}
              </Form.Item>
              {merchantStatus ? (
                <div>
                  <Form.Item label="&nbsp;">
                    <b
                      className="ant-green-link cursor"
                      onClick={this.onClickSelectMerchants}
                    >
                      选择商户
                    </b>
                  </Form.Item>
                </div>
              ) : null}
              {/* A. 指定商户 B. 指定商户标签 C. 指定区域。 */}
              <Form.Item name={["tagRules", "name"]} label="&nbsp;">
                <Row>
                  <Col>
                    <Checkbox.Group
                      onChange={this.onCheckboxChange.bind(this, "tagStatus")}
                    >
                      <Checkbox
                        value="SelectedTags"
                        checked={this.state.selectedTags.length > 0}
                        style={{
                          lineHeight: "32px",
                        }}
                      >
                        指定标签
                      </Checkbox>
                    </Checkbox.Group>
                  </Col>
                </Row>
                {this.state.selectedTags.length > 0 ? (
                  <Row>
                    <Col>
                      {this.state.selectedTags.map((t, index) => (
                        <Tag
                          onClose={() => this.handleClose(t, "selectedTags")}
                          color="blue"
                          key={t}
                          closable
                        >
                          {t}
                        </Tag>
                      ))}
                    </Col>
                  </Row>
                ) : null}
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
                {this.state.selectedRegion.length > 0 ? (
                  <Row>
                    <Col>
                      {this.state.selectedRegion.map((t, index) => (
                        <Tag
                          key={t}
                          onClose={() => this.handleClose(t, "selectedRegion")}
                          color="blue"
                          closable
                        >
                          {t}
                        </Tag>
                      ))}
                    </Col>
                  </Row>
                ) : null}
              </Form.Item>

              {regionStatus ? (
                <div>
                  <Form.Item label="&nbsp;">
                    <b
                      className="ant-green-link cursor"
                      onClick={() => this.showMerchantRegion()}
                    >
                      选择区域
                    </b>
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
              onClick={this.backHome}
            >
              提交
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  //添加展示抽屉
  showTagsDrawer = (item) => {
    this.setState({
      showTagForm: true,
      //chooseItem: item,
      //targetKeys: item.tags,
    });
  };
  handleCancel = (e) => {
    this.setState({
      showTagForm: false,
      showMerchantSelect: false,
      showMerchantRegion: false,
    });
  };

  handleSelection = (selectedMerchants, selectedRowKeys) => {
    let merchants = this.state.merchants.concat(selectedMerchants);
    let keys = this.state.selectedRowKeys.concat(selectedRowKeys);
    this.setState({
      merchants: merchants,
      selectedRowKeys: keys,
      showMerchantSelect: false,
    });
  };

  renderMerchantSelect = () => {
    const { showMerchantSelect } = this.state;
    return (
      <MerchantSelect
        visible={showMerchantSelect}
        handleCancel={this.handleCancel}
        handleSelection={this.handleSelection}
      />
    );
  };
  handleRegion = (selectedRegion) => {
    let regions = this.state.selectedRegion.concat(selectedRegion);
    this.setState({
      selectedRegion: regions,
      showMerchantRegion: false,
    });
  };
  showMerchantRegion = () => {
    this.setState({
      showMerchantRegion: true,
    });
  };
  renderMerchantRegion = () => {
    const { regionType, showMerchantRegion } = this.state;
    const { regionRules } = this.state.rules;
    return (
      <MerchantRegion
        visible={showMerchantRegion}
        regionType={regionType}
        regionRules={regionRules}
        onRadioChange={this.onRadioChange}
        handleCancel={this.handleCancel}
        handleRegion={this.handleRegion}
      />
    );
  };

  onSelectCommonTags = (values) => {
    this.setState({
      selectedTags: values,
    });
  };

  renderTagForm = () => {
    const {
      showTagForm,
      selectedTags,
      // radio,
      // chooseItem,
      // tagsData,
      // targetKeys,
      // totalTagPages,
    } = this.state;
    return (
      <MerchantTag
        selectedTags={selectedTags}
        showTagForm={showTagForm}
        onSelectCommonTags={this.onSelectCommonTags}
      />
    );
  };
  render() {
    const { showTagForm, showMerchantSelect, showMerchantRegion } = this.state;
    return (
      <div>
        {this.renderRules()}
        {showMerchantSelect ? this.renderMerchantSelect() : null}
        {showTagForm ? this.renderTagForm() : null}
        {showMerchantRegion ? this.renderMerchantRegion() : null}
      </div>
    );
  }
}

export default ConfigureRules;
