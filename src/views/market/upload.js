import React, { Component } from "react";
import { Upload, Button, Descriptions } from "antd";
import Papa from 'papaparse'; // 解析cvs插件 市面上使用较多的
import jschardet from 'jschardet'; // 编码识别
import { UploadOutlined } from "@ant-design/icons";
import { reqBatchTransfer, reqBatchDistribution } from "../../api";
import { withRouter } from "react-router-dom";



@withRouter
 class Csv extends Component {
  constructor(props) {
    super(props);
    this.state = {
      csvParseData: [],
      type: '',
      csvData:''
      id:''
    };
  }
  componentDidMount(){
    console.log("Csv -> constructor -> props", this.props);
      this.setState({
        type: this.props.name,
        id:this.props.id
      });
      console.log("Csv -> constructor -> type", this.state.type);
  }
  // 检查编排
  checkEncoding = (base64Str) => {
    //这种方式得到的是一种二进制串
    const str = atob(base64Str.split(";base64,")[1]); // atob  方法 Window 对象 定义和用法 atob() 方法用于解码使用 base-64 编码的字符
    //要用二进制格式
    let encoding = jschardet.detect(str);
    encoding = encoding.encoding;
    // 有时候会识别错误
    if(encoding === "windows-1252"){
      encoding = "ANSI";
    }
    return encoding;
  }
  save(){
            let formData=new FormData();
            formData.append('csvFile',this.$refs.file.files[0])
            formData.append('campaignId',this.state.id)
            console.log("Csv -> save -> formData", formData)
            const result=this.reqBatchTransfer(formData)
            console.log("Csv -> save -> result", result)
        }
  render() {
    const _this = this;
    const props = {
      beforeUpload: file => {
        const fReader = new FileReader();
        fReader.readAsDataURL(file); //  readAsDataURL 读取本地文件 得到的是一个base64值
        fReader.onload = function(evt){// 读取文件成功
          const data = evt.target.result;
          console.log("Csv -> fReader.onload -> data", data)
          _this.setState({
            csvData:data,
          });
          const encoding = _this.checkEncoding(data);
          //papaparse.js 用来解析转换成二维数组
          Papa.parse(file, {
            encoding: encoding,
            complete: function(results) {        // UTF8 \r\n与\n混用时有可能会出问题
              const res = results.data;
              if(res[res.length - 1] === ""){    //去除最后的空行 有些解析数据尾部会多出空格
                res.pop();
              }
              // 当前res 就是二维数组的值 数据拿到了 那么在前端如何处理渲染 就根据需求再做进一步操作了
              _this.setState(res);
              console.log("Csv -> fReader.onload -> res", res)
            }
          });

        }
        return false;
      },
    };
    const typeName = this.state.type === "transfer" ? "分配文件" : "发放文件";
    console.log("Csv -> render -> this.state.typ", this.state.type)
    return (
      <div>
        <Descriptions title={"请上传" + `${ typeName }`}>
          <Descriptions.Item label="期待的文件格式:">csv</Descriptions.Item>
          <Descriptions.Item label="第一列">员工号</Descriptions.Item>
          <Descriptions.Item label="第二列">数量</Descriptions.Item>
        </Descriptions>
        {/* <Upload {...props}>
          <Button>
            <UploadOutlined />
            点击上传csv
          </Button>
        </Upload> */}
        <input type="file" ref="file"></input>
        <div @click="save">保存</div>
      </div>
    );
  }
}
export default Csv;