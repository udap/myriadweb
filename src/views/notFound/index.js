import React, { Component } from 'react';
import { Result, Button } from 'antd';

class NotFound extends Component {
    render() {
        return (
            <div>
            	<Result
            	    status="404"
            	    title="404"
            	    subTitle="抱歉，您访问的页面不存在."
            	    extra={<Button type="primary">返回首页</Button>}
            	  />
            </div>
        );
    }
}

export default NotFound;