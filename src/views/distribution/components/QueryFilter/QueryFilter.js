import React, { useState } from 'react'
import { Form, Row, Col, Radio, Button, Input, DatePicker } from 'antd'
import moment from 'moment'
import 'moment/locale/zh-cn'

import '@css/common.less'

const { RangePicker } = DatePicker

const QueryForm = ({
  loading,
  dateRange,
  onLoading,
  onSwitchType,
  onSubmitQuery
}) => {
  const beginDate = dateRange && dateRange[0] ? dateRange[0] : new Date()
  const endDate = dateRange && dateRange[1] ? dateRange[1] : new Date()

  const [dates, setDates] = useState([])
  const disabledDate = (current) => {
    const prohibitedTime = moment().subtract(3, 'months')
    if (dates.length === 0) {
      return current < prohibitedTime
    }
    const tooLate = dates[0] && current.diff(dates[0], 'days') > 30
    const tooEarly = dates[1] && dates[1].diff(current, 'days') > 30
    return tooEarly || tooLate
  }

  return (
    <Form
      onFinish={onSubmitQuery}
      layout="horizontal"
      name="advanced_search"
      initialValues={{
        searchTxt: '',
        type: 'user',
        dateRange: [
          moment(beginDate, 'YYYY-MM-DD'),
          moment(endDate, 'YYYY-MM-DD')
        ]
      }}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Form.Item name="type" label="查询条件">
            <Radio.Group
              onChange={onSwitchType}
              buttonStyle="solid"
              disabled={loading}
            >
              <Radio.Button value="user">我的发放</Radio.Button>
              <Radio.Button value="org">机构发放</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="searchTxt"
            label="搜索"
            tooltip="根据券号、活动名、发放人、发放机构或客户:（原始编号、电话号、邮箱、真实名字）搜索"
          >
            <Input placeholder="请输入" allowClear />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item
            name="dateRange"
            label="发放时间"
            tooltip="只能选择当前时间的前三个月内的时间段"
          >
            <RangePicker
              format="YYYY-MM-DD"
              disabled={loading}
              onOpenChange={open => open && setDates([])}
              onCalendarChange={val => setDates(val)}
              allowClear={false}
              disabledDate={disabledDate}
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
              onClick={onLoading}
            >
              查询
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default QueryForm
