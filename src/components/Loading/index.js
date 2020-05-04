import React, { Component } from 'react';
//加载中
import { Spin } from 'antd';
import './index.less';

//加载组件
class Loading extends Component {
    render() {
        return (
          <div className="loading">
            <span>
              <Spin />
            </span>
          </div>
        );
    }
}
export default Loading