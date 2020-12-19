import React, { Component } from "react";
import {
  Form,
  Radio,
  Cascader,
  Drawer,
  Button,
} from "antd";
import comEvents from "../../../utils/comEvents";
import { ChinaRegions } from "../../../utils/china-regions";

class MerchantRegion extends Component {
  state = {
    province: "重庆市",
    city: "重庆市",
    district: "渝中区",
    regionType: this.props.regionType,
    newRegion:''
  };
  onRadioChange = (name, e) => {
    this.setState({
      regionType: e.target.value,
    });
    this.props.onRadioChange(name, e.target.value);
  };
  onRegionChange = (values) => {
    this.setState({
      newRegion: values,
    });
  };
  onFinish = (values) => {
    let newData;
    switch (!this.state.newRegion&&values.regionType) {
      case "p":
        newData = values.regionRules.option[0];
        break;
      case "c":
        newData = values.regionRules.option.slice(0, 2);
        break;
      default:
        newData = values.regionRules.option;
    }
    let newRegion = this.state.newRegion
      ? this.state.newRegion.toString()
      : newData.toString();
    this.props.handleRegion(newRegion);
  };
  render() {
    const { province, city, district, regionType } = this.state;
    const { regionRules, visible } = this.props;
    return (
      <div>
        <Drawer
          className="markrt"
          title="选择区域"
          visible={visible}
          onClose={this.props.handleCancel}
          footer={null}
          width={480}
        >
          <Form
            name="validate_other"
            className="steps"
            onFinish={this.onFinish}
            colon={false}
            initialValues={{
              regionRules: {
                name: regionRules.name,
                option:
                  regionType === "p"
                    ? [province]
                    : regionType === "c"
                    ? [province, city]
                    : [province, city, district],
              },
              regionType: regionType,
            }}
          >
            <Form.Item name="regionType" label="区域范围：">
              <Radio.Group
                onChange={this.onRadioChange.bind(this, "regionType")}
              >
                <Radio value="p">省</Radio>
                <Radio value="c">市</Radio>
                <Radio value="z">区</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name={["regionRules", "option"]} label="地区：">
              <RegionCascader
                regionType={regionType}
                province={province}
                city={city}
                district={district}
                onRegionChange={this.onRegionChange}
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

const RegionCascader = (props)=>{
    let { regionType, province, city, district } = props;
    return (
      <div>
        {regionType === "p" ? (
          <Cascader
            defaultValue={[province]}
            options={comEvents.siftRegion(true)}
            onChange={props.onRegionChange}
          />
        ) : regionType === "c" ? (
          <Cascader
            defaultValue={[province, city]}
            options={comEvents.siftRegion(true, true)}
            onChange={props.onRegionChange}
          />
        ) : (
          <Cascader
            defaultValue={[province, city, district]}
            options={ChinaRegions}
            onChange={props.onRegionChange}
          />
        )}
      </div>
    );
}

export default MerchantRegion;
