import React, { Component } from "react";
import { Form, Row, Col, Radio, Button, Input } from "antd";
import "../../css/common.less";

class SearchForm extends Component {
  state = {
    loading: false,
    searchTxt: "",
    group: true,
  };
  onFinish = (value) => {
    this.props.searchValue(value.searchTxt, value.group);
  };
  onChangeSearch = (e) => {
    this.setState({
      searchTxt: e.target.value,
    });
  };
  onChangeType = (e) => {
    let newValue = e.target.value;
    this.setState({
      group: newValue,
    });
    this.props.refresh(this.state.searchTxt, newValue);
  };
  render() {
    let props = this.props;
    let { searchTxt, defaultValue, placeholder, loading } = props;
    return (
      <Form
        onFinish={this.onFinish}
        layout="horizontal"
        name="advanced_search"
        className="ant-advanced-search-form"
        initialValues={{
          searchTxt: searchTxt,
          group: defaultValue,
        }}
      >
        <Row>
          <Col>
            <Form.Item name="group" label="查询条件">
              <Radio.Group onChange={this.onChangeType}>
                {props.texts.map((item, index) => (
                  <Radio key={index} value={item.value}>
                    {item.name}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="searchTxt">
              <Input
                placeholder={placeholder}
                allowClear
                onChange={this.onChangeSearch}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button
                type="primary"
                className="cursor searchBtn"
                htmlType="submit"
                loading={loading}
              >
                搜索
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default SearchForm;
