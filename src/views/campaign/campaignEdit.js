import React, { Component } from "react";
//加载中
import {
  Button,
  Form,
  Input,
  message,
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
} from "antd";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import {
  reqGetCampaignById,
  reqAddCampaign,
  reqPutConfig,
  reqPostConfig,
  //reqPostConfigImg,
} from "../../api";
import storageUtils from "../../utils/storageUtils";
import comEvents from "../../utils/comEvents";
import { Loading, AntdIcon, LinkBtn } from "../../components";
import { withRouter } from "react-router-dom";
import moment from "moment";
import "moment/locale/zh-cn";
import CampaignMerchant from "./campaignMerchant";
import "./index.less";
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

@withRouter
class CampaignEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inited: false,
      isNew: true,
      id: null,
      typeText: "元",
      currentDisplayName: "门店兑换",
      current: 0,
      choose: 0,
      value: 0,
      number: 1,
      fileList: [],
      listData: [
        {
          name: "优惠券活动",
          icon: "DollarCircleOutlined",
          type: "VOUCHER", //VOUCHER, PROMOTION
          desc:
            "电子优惠券是企业利用App、短信、社交媒体等多种渠道进行数字化营销的便利手段。每一张优惠券都有一个唯一的、随机产生的编码，可以有效防止欺诈。",
        },
      ],
      basicInfo: {
        name: "",
        description: "",
        category: "",
        url: "",
      },
      effective: comEvents.getDateStr(0),
      expiry: comEvents.getDateStr(1),
      type: "VOUCHER",
      multiple: true,
      coverImg: "",
      select: "AMOUNT",
      valueOff: "",
      totalSupply: "",
      autoUpdate: true,
      amountLimit: 1,
      description: "",
      orgList: [],
      hasConfig: false,
      parties: [],
      disabledExpiry: false,
    };
  }

  componentDidMount() {
    let id = this.props.match.params.id;
    this.setState({
      isNew: id === "new" ? true : false,
      inited: true,
    });
    if (id !== "new") {
      this.setState({
        id: id,
      });
      this.getMarket(id);
    }
  }
  //获取当前活动详情
  getMarket = async (id) => {
    let curInfo = await reqGetCampaignById(id);
    let cont = curInfo.data ? curInfo.data : [];
    let voucherConfig = cont.voucherConfig;
    this.setState({
      inited: true,
      curInfo: cont,
      basicInfo: {
        name: cont.name,
        description: cont.description,
        category: cont.category,
        url: cont.url,
      },
      effective: cont.effective,
      expiry: comEvents.getDateStr(-1, new Date(cont.expiry)),
      multiple: true, //cont.multiple,
      coverImg: voucherConfig ? voucherConfig.coverImg : "",
      select: "AMOUNT",
      valueOff: voucherConfig
        ? parseFloat(voucherConfig.discount.valueOff) / 100
        : "",
      totalSupply: voucherConfig ? voucherConfig.totalSupply : "",
      autoUpdate: voucherConfig ? voucherConfig.autoUpdate : "",
      amountLimit: 1, //cont.amountLimit,
      description: voucherConfig ? voucherConfig.description : "",

      current: voucherConfig ? 3 : 2,
      hasConfig: cont.voucherConfig ? true : false,
      parties: cont.parties ? cont.parties : [],
    });
  };
  onFinish2 = async (values) => {
    let timeEffective = new Date(this.state.effective).getTime();
    let timeExpiry = new Date(this.state.expiry).getTime();

    // if (timeExpiry <= timeEffective) {
    //   message.info("结束时间必须大于开始时间");
    //   return false;
    // }
    let params = {
      reqOrg: storageUtils.getUser().orgUid,
      reqUser: storageUtils.getUser().uid,
      name: values.name,
      description: values.description,
      type: this.state.type,
      category: values.category,
      effective: this.state.effective,
      expiry: comEvents.getDateStr(1, new Date(this.state.expiry)),
      url: values.url,
      metadata: {},
    };
    this.setState({
      basicInfo: params,
    });
    let result = await reqAddCampaign(params);
    this.setState({
      id: result.data.id,
    });
    this.nextStep();
  };
  backIndex = () => {
    this.props.history.push("/admin/campaign");
  };
  onFinishFailed2 = (errorInfo) => {};

  onChange = (current) => {
    this.setState({
      choose: current,
      current,
    });
  };
  nextStep = () => {
    if (this.state.choose <= this.state.current) {
      this.setState({
        current: this.state.current + 1,
      });
    } else {
      this.setState({
        current: this.state.current - 1,
      });
    }

    //this.onChange(this.state.current);
  };

  onRadioChange = (e) => {
    let value = e.target.value;
    let typeText;
    // if (value === 1) {
    //   typeText = "折扣类型【元】";
    // } else if (value === 2) {
    //   typeText = "折扣类型【%】";
    // } else {
    //   typeText = "折扣类型";
    // }
    this.setState({
      value: value,
      typeText: typeText,
    });
  };
  onNumberChange = (name, value) => {
    if (name === "valueOff") {
      //前端输入20.00或者0.5，传回到后台前需要转换成2000或者50的整数
      this.setState({
        valueOff: value,
      });
    } else if (name === "totalSupply") {
      this.setState({
        totalSupply: value,
      });
    }
  };
  onTypeRadioChange = (e) => {
    this.setState({
      value: e.target.value,
      type: e.target.value,
    });
  };
  chooseType = (item) => {
    this.setState({
      type: item.type,
    });
    this.nextStep();
  };

  onFinish3 = async (values) => {
    //折扣数量乘以100  前端输入20.00或者0.5，传回到后台前需要转换成2000或者50的整数
    // this.setState({
    //   settingInfo: values,
    // });
    if (!this.state.valueOff) {
      message.info("折扣数量不能为空！");
      return false;
    }

    let params = {
      multiple: true,
      coverImg: this.state.coverImg,
      totalSupply: this.state.totalSupply,
      autoUpdate: this.state.autoUpdate,
      description: values.description,
      discount: {
        type: values.select,
        valueOff: this.state.valueOff * 100,
        amountLimit: 1,
      },
      type: "COUPON",
    };
    //     if (this.state.coverImg){
    //       var formData = new FormData();
    //       let msg = params;
    //       for (const key in msg) {

    //         formData.append(key, msg[key]);
    //       }
    // let result = await reqPostConfigImg(this.state.id, formData);
    // this.nextStep();
    //     }else{
    if (this.state.hasConfig) {
      let result = await reqPutConfig(this.state.id, params);
      this.nextStep();
    } else {
      let result = await reqPostConfig(this.state.id, params);
      this.nextStep();
    }
    //  }
  };
  changeDate = (data, dataStr) => {
    this.setState({
      effective: dataStr[0],
      expiry: dataStr[1],
    });
  };
  onSwitchChange = (value) => {
    this.setState({
      autoUpdate: value,
    });
  };
  disabledDate = (current) => {
    // Can not select days before today and today
    //return current && current < moment().endOf("day");
    return current < moment().endOf("day");
  };

  renderStep1 = () => {
    return (
      <div className="site-card-wrapper">
        <Row>
          <List
            dataSource={this.state.listData}
            renderItem={(item) => (
              <Col xs={24} sm={24} md={24} lg={12} xl={8}>
                <Card bordered={false}>
                  <List.Item key={item.name}>
                    <Card bordered={false}>
                      <List.Item.Meta
                        title={item.name}
                        description={item.desc}
                      />

                      <div className="market_icon_btn">
                        <AntdIcon name="PlusCircleOutlined" />
                        <LinkBtn
                          className="btnChoose"
                          onClick={this.chooseType.bind(this, item)}
                        >
                          选择
                        </LinkBtn>
                      </div>
                    </Card>
                    <div className="market_icon">
                      <AntdIcon name="DollarCircleOutlined" />
                    </div>
                  </List.Item>
                </Card>
              </Col>
            )}
          ></List>
        </Row>
      </div>
    );
  };

  renderStep2 = () => {
    //wait process finish error
    const { name, category, description, url } = this.state.basicInfo;
    const { expiry, effective } = this.state;
    return (
      <Form
        {...layout}
        name="basic"
        initialValues={{
          name: name,
          category: category,
          effective: effective,
          description: description,
          url: url,
          expiry: expiry,
        }}
        onFinish={this.onFinish2}
        onFinishFailed={this.onFinishFailed2}
        validateMessages={defaultValidateMessages.defaultValidateMessages}
      >
        <Form.Item
          label="活动名称"
          name="name"
          rules={[{ required: true }, { max: 32 }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="活动描述" name="description" rules={[{ max: 255 }]}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label="类别" name="category">
          <Input />
        </Form.Item>
        <Form.Item label="起止时间" name="time">
          <RangePicker
            defaultValue={[
              moment(effective, dateFormat),
              moment(expiry, dateFormat),
            ]}
            onChange={this.changeDate}
          />
        </Form.Item>

        <Form.Item
          label="活动主页"
          name="url"
          rules={[{ type: "url" }, { min: 0, max: 255 }]}
        >
          <Input />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            下一步
          </Button>
        </Form.Item>
      </Form>
    );
  };
  selectPic = (e) => {
    let imgObj = e.file.originFileObj;
    var that = this;
    var reader = new FileReader();
    reader.onloadend = function () {
      console.log(reader.result);
      that.setState({
        coverImg: reader.result,
      });
    };
    if (imgObj) {
      reader.readAsDataURL(imgObj);
    }
  };
  renderStep3 = () => {
    const {
      multiple,
      coverImg,
      valueOff,
      totalSupply,
      autoUpdate,
      amountLimit,
      description,
      //code,
    } = this.state;
    const formItemLayout = {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 14,
      },
    };
    const { fileList } = this.state;
    const props = {
      onRemove: (file) => {
        this.setState((state) => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        this.setState((state) => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };
    return (
      <div className="">
        <Form
          name="validate_other"
          {...formItemLayout}
          onFinish={this.onFinish3}
          initialValues={{
            multiple: multiple,
            totalSupply: totalSupply,
            autoUpdate: autoUpdate,
            select: "AMOUNT",
            valueOff: valueOff,
            amountLimit: amountLimit,
            coverImg: coverImg,
            description: description,
            //code: code,
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
       
          */}
          <Form.Item name="multiple" label="优惠券类型" hasFeedback>
            <Radio.Group
              onChange={this.onTypeRadioChange}
              value={this.state.multiple}
            >
              <Radio value={true}>一码一券</Radio>
              {/* <Radio value={true}>固定码优惠券</Radio> */}
            </Radio.Group>
          </Form.Item>
          {!this.state.multiple ? (
            <div>
              <Form.Item label="券号" name="code" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="发行数量" name="totalSupply">
                <InputNumber defaultValue={totalSupply} disabled />
              </Form.Item>
            </div>
          ) : (
            <div>
              <Form.Item label="发行数量" name="totalSupply">
                <InputNumber
                  defaultValue={totalSupply}
                  min={1}
                  onChange={this.onNumberChange.bind(this, "totalSupply")}
                />
              </Form.Item>
            </div>
          )}
          <Form.Item
            name="autoUpdate"
            label="是否允许增发"
            valuePropName="checked"
            rules={[{ required: false }]}
          >
            <Switch defaultChecked onChange={this.onSwitchChange} />
          </Form.Item>

          <Form.Item
            name="select"
            label="折扣类型"
            hasFeedback
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Radio.Group
              //onChange={this.onRadioChange}
              value={this.state.select}
            >
              <Radio value={"AMOUNT"} checked>
                代金券
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="折扣金额"
            name="valueOff"
            rules={[{ required: false }]}
          >
            <InputNumber
              defaultValue={valueOff}
              min={1}
              onChange={this.onNumberChange.bind(this, "valueOff")}
            />
            &nbsp;&nbsp;<span>{this.state.typeText}</span>
          </Form.Item>

          <Form.Item label="可用次数 " name="amountLimit">
            <InputNumber
              min={1}
              defaultValue={1}
              disabled
              //onChange={this.onNumberChange.bind(this, "amountLimit")}
            />
          </Form.Item>

          <Form.Item label="备注 " name="description">
            <TextArea rows={4} />
          </Form.Item>
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
            wrapperCol={{
              span: 12,
              offset: 6,
            }}
          >
            <Button type="primary" htmlType="submit">
              下一步
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  renderStep4 = () => {
    return (
      <div className="site-card-wrapper">
        <CampaignMerchant id={this.state.id} parties={this.state.parties} />
      </div>
    );
  };
  showCont = (current) => {
    if (current === 1) {
      return this.renderStep2();
    } else if (current === 2) {
      return this.renderStep3();
    } else if (current === 3) {
      return this.renderStep4();
    } else {
      return this.renderStep1();
    }
  };
  renderContent = () => {
    const { current } = this.state;

    const stepList = [
      {
        title: "活动类型",
      },
      {
        title: "基本信息",
      },
      {
        title: "详细配置",
      },
      {
        title: "参与商户",
      },
    ];

    return (
      <div>
        <Steps
          type="navigation"
          current={this.state.current}
          onChange={this.onChange}
          className="site-navigation-steps"
        >
          {stepList.map((item, index) => (
            <Step
              key={index}
              status={
                current === index
                  ? "process"
                  : current > index
                  ? "finish"
                  : "wait"
              }
              title={item.title}
            />
          ))}
        </Steps>
        <div className="stepCont"></div>
        {this.showCont(current)}
      </div>
    );
  };
  render() {
    return (
      <div className="MarketFormDialog">
        <PageHeader
          className="site-page-header-responsive"
          title={this.state.isNew ? "创建活动" : "活动详情"}
          onBack={this.backIndex}
        ></PageHeader>
        {this.state.inited ? this.renderContent() : <Loading />}
      </div>
    );
  }
}
export default CampaignEdit;