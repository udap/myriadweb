import React, { Component } from "react";
//加载中
import {
  Button,
  Form,
  Input,
  PageHeader,
  Switch,
  DatePicker,
  Steps,
  Card,
  Col,
  Row,
  Radio,
  InputNumber,
  List,
  Drawer,
  notification,
  Checkbox,
} from "antd";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import {
  reqGetCampaignById,
  reqAddCampaign,
  reqPutConfig,
  reqPostConfig,
  //reqPostConfigImg,
  reqPutCampaign,
} from "../../api";
import storageUtils from "../../utils/storageUtils";
import comEvents from "../../utils/comEvents";
import { Loading, AntdIcon, LinkBtn, EditableTagGroup } from "../../components";
import { withRouter } from "react-router-dom";
import moment from "moment";
import "moment/locale/zh-cn";
import CampaignMerchant from "./campaignMerchant";
import CampaignTypeSelect from "./campaignTypeSelect";
import "./index.less";
import { thisExpression } from "@babel/types";
import ConfigureRules from "./configureRules";
const layout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
    lg: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
    lg: { span: 12 },
  },
};
const tailLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
    lg: {
      span: 12,
      offset: 6,
    },
  },
};
const { Step } = Steps;

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";
//垂直的单选
const radioStyle = {
  display: "block",
  height: "30px",
  lineHeight: "30px",
  marginBottom: "15px",
};
//teps3样式
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
};
@withRouter
class CampaignEdit extends Component {
  state = {
    inited: false,
    isNew: true,
    //导航step
    current: 0,
    choose: 0,
    campaignType: "VOUCHER",
    //基本信息
    tags: [],
    basicInfo: {
      name: "",
      description: "",
      category: [],
      url: "",
      effective: comEvents.getDateStr(0),
      end: comEvents.getDateStr(0),
      totalSupply: 1,
      autoUpdate: false,
    },
    //活动主页预览
    showUrl: false,
    url: "",
    //新增活动的id
    id: null,

    currentDisplayName: "门店兑换",

    value: 0,
    number: 1,
    fileList: [],
    //配置信息
    name: "",
    select: "AMOUNT",
    typeText: "元",
    //valueOff: "",
    settings: {
      name: null,
      multiple: true,
      coverImg: "",
      select: "AMOUNT",
      valueOff: 1,
      amountLimit: null,
      description: "",
      //code:'',
      timeType: "date",
      effective: comEvents.getDateStr(0),
      end: null,
    },
    daysAfterDist: null,
    orgList: [],
    hasConfig: false,
    parties: [],
    disabledExpiry: false,
    autoswitch: false,
    //禁止跳转
    disabledNext: false,
    //rules
    rules: {
      orderRules: {
        name: "",//"MinimumValue",
        option: null,
      },
      merchantRules: {
        name: "",//"SelectedMerchants",
        option: null,
      },
      tagRules: {
        name: "",//"SelectedTags",
        option: null,
      },
      regionRules: {
        name: "",//"SelectedRegions",
        option: null,
      },
    },
  };

  componentDidMount() {

comEvents.formatRegions();


    let id = this.props.match.params.id;
    this.setState({
      isNew: id === "new" ? true : false,
      inited: true,
    });
    if (id !== "new") {
      //获取当前ID的活动详情
      this.setState({
        id: id,
      });
      this.getCampaigns(id);
    }
  }
  //获取当前活动详情
  getCampaigns = async (id, current) => {
    let curInfo = await reqGetCampaignById(id);
    let cont = curInfo.data ? curInfo.data : [];
    let voucherConfig = cont.voucherConfig;
    this.setState({
      inited: true,
      curInfo: cont,
      basicInfo: {
        name: cont.name,
        description: cont.description,
        category: cont.category ? cont.category.split(",") : [],
        url: cont.url,
        effective: cont.effective,
        end: comEvents.formatExpiry(new Date(cont.expiry)),
        totalSupply: cont.totalSupply,
        autoUpdate: cont.autoUpdate,
      },
      autoswitch: cont.autoUpdate,
      url: cont.url,
      name: cont.name,
      timeType: voucherConfig && voucherConfig.daysAfterDist ? "day" : "date",
      select:
        voucherConfig && voucherConfig.discount
          ? voucherConfig.discount.type
          : "AMOUNT",
      typeText:
        voucherConfig &&
        voucherConfig.discount &&
        voucherConfig.discount.type === "AMOUNT"
          ? "元"
          : "%",
      settings: {
        name:
          voucherConfig && voucherConfig.name
            ? voucherConfig.name
            : cont.name.substr(0, 10),
        multiple:
          voucherConfig && voucherConfig.multiple
            ? voucherConfig.multiple
            : true,
        //coverImg: voucherConfig.coverImg,
        select:
          voucherConfig && voucherConfig.discount
            ? voucherConfig.discount.type
            : "AMOUNT",
        valueOff:
          voucherConfig && voucherConfig.type && voucherConfig.discount
            ? voucherConfig.discount.type === "AMOUNT"
              ? parseFloat(voucherConfig.discount.valueOff) / 100
              : voucherConfig.discount.valueOff
            : 1,
        amountLimit:
          voucherConfig &&
          voucherConfig.discount &&
          voucherConfig.discount.amountLimit
            ? parseFloat(voucherConfig.discount.amountLimit) / 100
            : null,
        //description: voucherConfig ? voucherConfig.description : "",
        //code:'',
        effective:
          voucherConfig && voucherConfig.effective
            ? voucherConfig.effective
            : cont.effective,
        end:
          voucherConfig && voucherConfig.expiry
            ? comEvents.formatExpiry(voucherConfig.expiry)
            : comEvents.formatExpiry(new Date(cont.expiry)),
        daysAfterDist:
          voucherConfig && voucherConfig.daysAfterDist
            ? voucherConfig.daysAfterDist
            : null,
        timeType: voucherConfig && voucherConfig.daysAfterDist ? "day" : "date",
      },
      current: current ? current : 1,
      hasConfig: cont.voucherConfig ? true : false,
      parties: cont.parties ? cont.parties : [],
    });
  };

  backIndex = () => {
    this.props.history.push("/admin/campaign");
  };

  onTypeRadioChange = (e) => {
    this.setState({
      value: e.target.value,
      type: e.target.value,
    });
  };

  onSwitchChange = (value) => {
    this.setState({
      autoswitch: value,
    });
  };
  disabledDate = (current) => {
    // Can not select days before today and today
    //return current && current < moment().endOf("day");
    return current < moment().endOf("day");
  };
  //第一步
  renderStep1 = () => {
    return (
      <CampaignTypeSelect onSelect={this.chooseType} />
    );
  };
  //选择活动类型
  chooseType = (item) => {
    this.setState({
      campaignType: item.type,
    });
    //跳转到第二步
    this.nextStep();
  };
  //跳转到下一步
  nextStep = (id) => {
    let { choose, current } = this.state;
    if (choose <= current) {
      this.setState({
        current: current + 1,
      });
    } else {
      this.setState({
        current: current - 1,
      });
    }
    if (id) {
      //刷新当前数据
      this.getCampaigns(id, this.state.current);
    }
    //this.jumpStep(this.state.current);
  };
  //第二步
  renderStep2 = () => {
    const {
      name,
      category,
      description,
      url,
      effective,
      end,
      totalSupply,
      autoUpdate,
    } = this.state.basicInfo;
    let { autoswitch } = this.state;
    return (
      <Form
        {...layout}
        name="basic"
        initialValues={{
          name: name,
          category: category,
          totalSupply: totalSupply,
          autoUpdate: autoUpdate,
          description: description,
          url: url,
        }}
        onFinish={this.onFinish2}
        validateMessages={defaultValidateMessages.defaultValidateMessages}
      >
        <Form.Item
          label="活动名称"
          name="name"
          rules={[{ required: true }, { max: 20 }]}
        >
          <Input placeholder="请输入最多20个字的活动名称" maxLength="20" />
        </Form.Item>
        <Form.Item label="活动描述" name="description" rules={[{ max: 255 }]}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label="标签" name="category">
          {/* <Input /> */}
          <EditableTagGroup tags={category} newTags={this.newTags} />
        </Form.Item>
        <Form.Item label="活动时间">
          <RangePicker
            defaultValue={[
              moment(effective, dateFormat),
              moment(end, dateFormat),
            ]}
            onChange={this.changeDate}
          />
        </Form.Item>
        <Form.Item
          label="发行数量"
          name="totalSupply"
          rules={[{ required: true }]}
        >
          <InputNumber defaultValue={totalSupply} min={1} />
        </Form.Item>
        <Form.Item name="autoUpdate" label="是否允许增发">
          <Switch checked={autoswitch} onChange={this.onSwitchChange} />
        </Form.Item>
        <Form.Item
          label="活动主页"
          name="url"
          rules={[{ type: "url" }, { min: 0, max: 255 }]}
        >
          <Row>
            <Col span={20}>
              <Input value={this.state.url} onChange={this.handleInputChange} />
            </Col>
            <Col>
              <Button
                style={{ display: "inline" }}
                type="link"
                onClick={this.showURLDrawer}
              >
                预览
              </Button>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={this.state.disabledNext}
          >
            下一步
          </Button>
        </Form.Item>
      </Form>
    );
  };
  newTags = (newTags) => {
    this.setState({
      tags: newTags,
    });
  };
  //第二步提交
  onFinish2 = async (values) => {
    let { campaignType, basicInfo, tags, isNew } = this.state;
    if (comEvents.compareToday(basicInfo.effective)) {
      notification.info({
        message: "活动时间不能小于今天",
      });
      return false;
    }
    this.setState({
      disabledNext: true,
    });
    let params = {
      reqOrg: storageUtils.getUser().orgUid,
      reqUser: storageUtils.getUser().uid,
      name: values.name,
      description: values.description,
      type: campaignType,
      category: tags.toString(),
      effective: basicInfo.effective,
      expiry: comEvents.getDateStr(1, new Date(basicInfo.end)),
      totalSupply: values.totalSupply,
      autoUpdate: values.autoUpdate,
      url: values.url,
      metadata: {},
    };
    let result;
    if (isNew) {
      result = await reqAddCampaign(params);
    } else {
      let id = this.props.match.params.id;
      result = await reqPutCampaign(id, params);
    }
    this.setState({
      disabledNext: false,
    });
    //新增活动的id
    this.setState({
      id: isNew ? result.data.id : this.props.match.params.id,
      basicInfo: {
        name: values.name,
        description: values.description,
        category: tags,
        effective: basicInfo.effective,
        end: basicInfo.end,
        totalSupply: values.totalSupply,
        autoUpdate: values.autoUpdate,
        url: values.url,
      },
    });
    if (result.data.retcode !== 1 || result.data.id) {
      //retcode===1 有错误
      //result.data.id 新增活动成功
      //跳转到第三步
      this.nextStep(this.state.id);
    }
  };
  //保存URL显示预栏用
  handleInputChange = (e) => {
    this.setState({
      url: e.target.value,
    });
  };
  //日期切换
  changeDate = (data, dataStr) => {
    let { basicInfo } = this.state;
    let newData = Object.assign(basicInfo, {
      effective: dataStr[0],
      end: dataStr[1],
    });
    this.setState({
      basicInfo: newData,
    });
  };
  //显示预览
  showURLDrawer = () => {
    this.setState({
      showUrl: true,
    });
  };
  //隐藏活动预览
  closeURLDrawer = () => {
    this.setState({
      showUrl: false,
    });
  };
  //显示活动预览
  urlDrawerCont = () => {
    const { showUrl, url } = this.state;
    return (
      <div>
        <Drawer
          width={520}
          visible={showUrl}
          onClose={this.closeURLDrawer}
          footer={null}
        >
          <iframe src={url} height="100%" width="100%"></iframe>
        </Drawer>
      </div>
    );
  };
  //选择图片上传
  // selectPic = (e) => {
  //   let imgObj = e.file.originFileObj;
  //   var that = this;
  //   var reader = new FileReader();
  //   reader.onloadend = function () {
  //     console.log(reader.result);
  //     that.setState({
  //       coverImg: reader.result,
  //     });
  //   };
  //   if (imgObj) {
  //     reader.readAsDataURL(imgObj);
  //   }
  // };
  //第三步
  renderStep3 = () => {
    let {
      multiple,
      coverImg,
      valueOff,
      amountLimit,
      description,
      //code,
      timeType,
      select,
      daysAfterDist,
      name,
      effective,
    } = this.state.settings;
    return (
      <div>
        <Form
          name="validate_other"
          {...formItemLayout}
          onFinish={this.onFinish3}
          initialValues={{
            name: name ? name : this.state.basicInfo.name.substr(0, 10),
            multiple: multiple,
            select: select,
            //valueOff: valueOff / 100,
            coverImg: coverImg,
            description: description,
            //code: code,
            timeType: timeType,
            daysAfterDist: daysAfterDist,
            discount: {
              valueOff: valueOff,
              amountLimit: amountLimit,
            },
          }}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          {/* 营销活动创建的“详细配置”（不是详情配置）按这样的顺序：
          1/ 优惠券类型
          （2选1：固定码优惠券，一码一券）2/ 券号
          （只有当优惠券类型为固定码优惠券才需要出现）3/
          发行数量（如果是固定码优惠券类型，发行数量只能为1，不能修改；如果是一码一券，这个数量必须为正整数）4/
          是否允许增发 5/ 折扣类型 （只保留按价格抵扣） AMOUNT, PERCENT, UNIT;6/
          折扣数量（前端输入20.00或者0.5，传回到后台前需要转换
          成2000或者50的整数）7/
          可用次数（默认为1）8/ 优惠券图片 9/ 备注 

       注意“折扣类型”选择“代金券”是，需要输入“折扣金额”（改为“金额”）；
          如果选择“折扣券”，就需要输入“折扣比例”和“最高优惠金额”两个参数
          */}
          <Form.Item
            label="优惠券名称"
            name="name"
            rules={[{ required: true }, { max: 10 }]}
          >
            <Input style={{ width: 200 }} />
          </Form.Item>

          <Form.Item
            name="select"
            label="类型"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Radio.Group
              onChange={this.onRadioTypeChange}
              value={this.state.select}
            >
              <Radio value={"AMOUNT"} checked>
                代金券
              </Radio>
              <Radio value={"PERCENT"}>折扣券</Radio>
            </Radio.Group>
          </Form.Item>

          {this.state.select === "PERCENT" ? (
            <div>
              <Form.Item
                label="折扣比例(%)"
                name={["discount", "valueOff"]}
                rules={[{ required: true, message: "折扣比例是必填项" }]}
              >
                <InputNumber />
              </Form.Item>
              <Form.Item
                label="最高优惠金额(元)"
                name={["discount", "amountLimit"]}
              >
                <InputNumber />
              </Form.Item>
            </div>
          ) : (
            <Form.Item
              label="金额(元)"
              name={["discount", "valueOff"]}
              rules={[{ required: true, message: "金额是必填项" }]}
            >
              <InputNumber min={1} />
            </Form.Item>
          )}
          <Form.Item label="有效期" name="timeType">
            <Radio.Group
              className="timeRadio"
              onChange={this.onRadioTimeChange}
              value={this.state.timeType}
            >
              <Radio name="timeType" style={radioStyle} value="date">
                <span style={{ marginRight: "8px" }}>固定时间</span>
                <RangePicker
                  defaultValue={[
                    moment(effective, dateFormat),
                    moment(
                      this.state.settings.end
                        ? this.state.settings.end
                        : this.state.basicInfo.end,
                      dateFormat
                    ),
                  ]}
                  onChange={this.changeSetDate}
                />
              </Radio>
              <Radio style={radioStyle} name="timeType" value="day">
                <Row style={{ display: "inline-flex" }}>
                  <Col>
                    <span>相对时间</span>
                  </Col>
                  <Col>
                    <span className="radioSpan">发放/领取后</span>
                  </Col>
                  <Col>
                    <Form.Item name="daysAfterDist">
                      <InputNumber min={1} />
                    </Form.Item>
                  </Col>
                  <Col>
                    <span className="radioSpan">天内有效</span>
                  </Col>
                </Row>
              </Radio>
            </Radio.Group>
          </Form.Item>
          {/* <Form.Item label="发放领取后多少天有效" name="time">
            
          </Form.Item> */}
          {/* <Form.Item label="备注 " name="description">
            <TextArea rows={4} />
          </Form.Item> */}
          {/* <Form.Item
            label="优惠券图片"
            //name="coverImg"
            rules={[{ required: false }]}
          >
            
            <Form.Item
              //name="coverImg"
              valuePropName="fileList"
              //getValueFromEvent={normFile}
              noStyle
            >
             
              <Upload onChange={this.selectPic}>
                <Button>
                  <UploadOutlined /> 选择文件
                </Button>
              </Upload>
            </Form.Item>
          </Form.Item> */}
          <Form.Item
            name="multiple"
            label="发行方式"
            rules={[{ required: true }]}
          >
            <Radio.Group
              onChange={this.onTypeRadioChange}
              value={this.state.multiple}
            >
              <Radio value={true}>一码一券</Radio>
              {/*<Radio value={false}>通用码券</Radio>*/}
            </Radio.Group>
          </Form.Item>
          {/* {!this.state.multiple ? (
            <div>
              <Form.Item label="券号" name="code" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </div>
          ) : (
            <div> */}
          <Form.Item
            wrapperCol={{
              span: 12,
              offset: 6,
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              disabled={this.state.disabledNext}
            >
              下一步
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  //类型切换
  onRadioTypeChange = (e) => {
    let value = e.target.value;
    let typeText;
    if (value === "AMOUNT") {
      typeText = "元";
    } else if (value === "PERCENT") {
      typeText = "%";
    } else {
      //typeText = "折扣类型";
    }
    this.setState({
      valueOff: null,
      select: value,
      typeText: typeText,
    });
  };
  //有效期切换
  onRadioTimeChange = (e) => {
    this.setState({
      timeType: e.target.value,
    });
  };
  //切换固定有效时间日期
  changeSetDate = (data, dataStr) => {
    let { settings } = this.state;
    let newData = Object.assign(settings, {
      effective: dataStr[0],
      end: dataStr[1],
    });
    this.setState({
      settings: newData,
    });
  };

  //提交数据
  onFinish3 = async (values) => {
    this.setState({
      disabledNext: true,
    });
    //折扣数量乘以100  前端输入20.00或者0.5，传回到后台前需要转换成2000或者50的整数
    let { settings } = this.state;
    let params =
      values.timeType === "date"
        ? {
            name: values.name,
            multiple: values.multiple,
            // description: values.description,
            discount:
              values.select === "AMOUNT"
                ? {
                    type: values.select,
                    valueOff: values.discount.valueOff * 100,
                  }
                : {
                    type: values.select,
                    valueOff: values.discount.valueOff,
                    amountLimit: values.discount.amountLimit
                      ? values.discount.amountLimit * 100
                      : null,
                  },
            type: "COUPON",
            effective: settings.effective,
            expiry: comEvents.getDateStr(
              1,
              new Date(settings.end ? settings.end : this.state.basicInfo.end)
            ),
          }
        : {
            name: values.name,
            multiple: values.multiple,
            //coverImg: this.state.coverImg,
            // description: values.description,
            discount:
              values.select === "AMOUNT"
                ? {
                    type: values.select,
                    valueOff: values.discount.valueOff * 100,
                  }
                : {
                    type: values.select,
                    valueOff: values.discount.valueOff,
                    amountLimit: values.discount.amountLimit
                      ? values.discount.amountLimit * 100
                      : null,
                  },
            type: "COUPON",
            daysAfterDist: values.daysAfterDist,
          };
    //图标的处理
    //     if (this.state.coverImg){
    //       var formData = new FormData();
    //       let msg = params;
    //       for (const key in msg) {

    //         formData.append(key, msg[key]);
    //       }
    // let result = await reqPostConfigImg(this.state.id, formData);
    // this.nextStep();
    //     }else{
    let result;
    if (this.state.hasConfig) {
      result = await reqPutConfig(this.state.id, params);
    } else {
      result = await reqPostConfig(this.state.id, params);
    }
    this.setState({
      disabledNext: false,
    });
    if (result.data.retcode !== 1) {
      this.nextStep(this.state.id);
    }
    //  }
  };
  //第四步
  renderStep4 = () => {
    const { rules } = this.state;
    return (
//      <div className="stepCont">
        <ConfigureRules id={this.state.id} rules={rules} />
//      </div>
    )
  };
  //第四步
  renderStep5 = () => {
    return (
      <div className="stepCont site-card-wrapper">
        <CampaignMerchant id={this.state.id} parties={this.state.parties} />
      </div>
    );
  };

  //点击切换steps
  jumpStep = (current) => {
    this.setState({
      choose: current,
      current,
    });
  };
  //显示对应的renderStep
  showCont = (current) => {
    if (current === 1) {
      //基本信息
      return this.renderStep2();
    } else if (current === 2) {
      //详细配置
      return this.renderStep3();
    } else if (current === 3) {
      //参与商户
      return this.renderStep4();
    } else if (current === 4) {
      //参与商户
      return this.renderStep5();
    } else {
      //活动类型
      return this.renderStep1();
    }
  };

  //根据step不同状态显示不同的样式
  showStatus = (current, index) => {
    if (current === index) {
      return "process";
    } else if (current > index) {
      return "finish";
    } else {
      return "wait";
    }
  };
  //显示创建活动内容
  renderContent = () => {
    //当前所在step 默认0
    const { current, showUrl } = this.state;
    //steps标题
    const stepLists = [
      "活动类型",
      "基本信息",
      "详细配置",
      "设置规则",
      //"参与商户",
    ];
    return (
      <div>
        <Steps
          size="small"
          type="navigation"
          current={current}
          onChange={this.jumpStep}
          className="site-navigation-steps"
          style={{ marginBottom: "30px" }}
        >
          {stepLists.map((item, index) => (
            <Step
              key={index}
              status={this.showStatus(current, index)}
              title={item}
            />
          ))}
        </Steps>
        {/*显示对应的step*/}
        {this.showCont(current)}
        {/*显示活动主页预览step*/}
        {showUrl ? this.urlDrawerCont() : null}
      </div>
    );
  };
  //页头
  render() {
    const { isNew, inited } = this.state;
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive"
          title={isNew ? "创建活动" : "活动详情"}
          onBack={this.backIndex}
        ></PageHeader>
        {inited ? this.renderContent() : <Loading />}
      </div>
    );
  }
}

export default CampaignEdit;
