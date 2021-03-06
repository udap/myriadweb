import React, { Component } from "react";
import {
  Button,
  Table,
  PageHeader,
  Input,
  Switch,
  Divider,
  Modal,
  Drawer,
  Pagination,
  Form,
  Row,
  Col,
  Tag,
  notification,
  Descriptions,
} from "antd";
import {
  PlusSquareFilled,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Operations } from "../../utils/constants";
import defaultValidateMessages from "../../utils/comFormErrorAlert";
import storageUtils from "../../utils/storageUtils";
import comEvents from "../../utils/comEvents";
import {
  reqPermit,
  reqGetPermissions,
  reqGetGroups,
  reqDelGroup,
  reqPostGroup,
  reqGetGroupItem,
  reqPutGroup,
} from "../../api";
import { Loading, TransferComponent } from "../../components";
import "../../css/common.less";

const { confirm } = Modal;
const { TextArea } = Input;
class Groups extends Component {
  state = {
    inited: false,
    groups: [],
    addNew: false,
    currentPage: 1,
    size: 20,
    total: 1,
    //添加组
    visible: false,
    isNew: true,
    name: "",
    description: "",
    template: "",
    //当前组
    curInfo: {},
    showDetail: false,
    //修改组
    operationsData: [],
    targetKeys: [],
  };
  componentDidMount() {
    this.getList(1);
  }
  getList = async () => {
    //保存机构的所有权限存起来
    this.getPermissions();
    this.getGroups(1);
  };

  searchValue = (value) => {
    this.setState({
      currentPage: 1,
      searchTxt: value.searchTxt,
    });
    this.getGroups(1, value.searchTxt);
  };
  //组织树控件的数据
  tree = (cont) => {
    const list = [];
    for (let i = 0; i < cont.length; i++) {
      const key = cont[i].operation || cont[i]; //`${path}-${i}`;
      const treeNode = {
        title: Operations[key],
        key,
      };
      if (cont[i].children && cont[i].children.length > 0) {
        treeNode.children = this.tree(cont[i].children);
      }
      list.push(treeNode);
    }
    return list;
  };
  //获取权限reqGetPermissions
  getPermissions = async () => {
    const result = await reqGetPermissions();
    let cont =
      result && result.data && result.data.content ? result.data.content : [];
    const tree = this.tree(cont);
    this.setState({
      operationsData: tree,
    });
  };
  //获取组列表数据
  getGroups = async (currentPage, searchTxt) => {
    const parmas = {
      page: currentPage >= 0 ? currentPage - 1 : this.state.currentPage,
      size: this.state.size,
      orgUid: storageUtils.getUser().orgUid,
      searchTxt: searchTxt ? searchTxt : this.state.searchTxt,
    };
    const result = await reqGetGroups(parmas);
    const cont =
      result && result.data && result.data.content ? result.data.content : [];

    this.totalPages =
      result && result.data ? result.data.content.totalElements : 1;
    this.setState({
      groups: cont.content,
      total: result && result.data ? result.data.content.totalElements : 1,
      inited: true,
    });
  };
  //列表分页
  handleTableChange = (page) => {
    this.setState({
      currentPage: page,
    });
    this.getGroups(page);
  };

  //添加分组
  addItem = async () => {
    this.setState({
      targetKeys: [],
      isNew: true,
      visible: true,
    });
  };
  //删除分组
  deleteItem = async (id) => {
    let result = await reqDelGroup(id);
    this.setState({
      currentPage: 1,
    });
    if (result.data.retcode === 0) {
      notification.success({ message: "删除成功" });
      this.getGroups(1);
    }
  };
  //返回上一页
  backIndex = () => {
    this.props.history.push("/admin/myOrgs");
  };

  //获取点击组详情
  reqGetGroupItem = async (id, type) => {
    let curInfo = await reqGetGroupItem(id);
    let cont = curInfo.data.content ? curInfo.data.content : [];
    this.setState({
      inited: true,
      curInfo: cont,
      operations: cont.operations,
      targetKeys: cont.operations,
    });
    if (curInfo.data.retcode === 0 && type === "edit") {
      this.setState({
        visible: true,
        isNew: false,
      });
    } else {
      this.setState({
        showDetail: true,
      });
    }
  };

  onFinish = async (values) => {
    if (this.state.targetKeys.length === 0) {
      notification.error({ message: "权限不能为空" });
      return false;
    }
    let { targetKeys, isNew, curInfo } = this.state;
    let params = isNew
      ? {
          name: values.name,
          description: values.description,
          createTemplateGroup: values.createTemplateGroup,
          operations: targetKeys,
          orgUid: storageUtils.getUser().orgUid,
        }
      : {
          id: curInfo.id,
          name: values.name,
          description: values.description,
          operations: targetKeys,
        };
    if (this.state.isNew) {
      //添加组
      const result = await reqPostGroup(params);
      if (result.data.retcode === 0) {
        notification.success({ message: "添加成功" });
        this.setState({
          visible: false,
        });
        this.getGroups(1);
      }
    } else {
      //修改组
      const result = await reqPutGroup(this.state.curInfo.id, params);
      if (result.data.retcode === 0) {
        notification.success({ message: "更新成功" });
        this.setState({
          visible: false,
        });
        this.getGroups(1);
      }
    }

    //}
  };
  onClose = () => {
    this.setState({
      visible: false,
      showDetail: false,
    });
  };
  onSwitchChange = (value) => {
    this.setState({
      admin: value,
    });
  };
  choosehandle = (value) => {
    this.setState({
      targetKeys: value,
    });
  };

  //组权限表单
  renderGroupForm = () => {
    const { operationsData, targetKeys, isNew } = this.state;
    let name = isNew ? this.state.name : this.state.curInfo.name;
    let description = isNew ? this.state.description : this.state.curInfo.desc;
    let operations = isNew
      ? this.state.targetKeys
      : this.state.curInfo.operations;
    return (
      <Drawer
        title={isNew ? "新增权限与分组" : "编辑权限与分组"}
        width={480}
        visible={this.state.visible}
        onClose={this.onClose}
        footer={null}
      >
        <Form
          layout="vertical"
          name="basic"
          initialValues={{
            name: name,
            description: description,
            operations: operations,
          }}
          onFinish={this.onFinish}
          validateMessages={defaultValidateMessages.defaultValidateMessages}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true }, { max: 20 }]}
          >
            <Input placeholder="分组名称不超过20个字" maxLength="20" />
          </Form.Item>
          {isNew ? (
            <Form.Item label="创建模版组？">
              <div className="description">
                模版组是当前机构为限定下属机构员工权限而创建的分组
              </div>
              <Form.Item noStyle name="createTemplateGroup">
                <Switch />
              </Form.Item>
            </Form.Item>
          ) : (
            <Form.Item label="模版">
              <Switch disabled defaultChecked={this.state.curInfo.template} />
            </Form.Item>
          )}
          <Form.Item label="描述" name="description" rules={[{ max: 255 }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label="权限" name="operations">
            {this.state.curInfo.template ? (
              <div className="description">
                修改模版组的权限将影响所有使用该模版的下属机构的员工权限
              </div>
            ) : null}
            <TransferComponent
              treeData={operationsData}
              chooseItem={this.choosehandle}
              targetKeys={targetKeys}
            />
          </Form.Item>
          <Form.Item>
            <Button type="default" onClick={this.onClose}>
              取消
            </Button>
            <Button className="margin-left" type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    );
  };
  //组列表
  renderContent = () => {
    const {
      groups,
      size,
      currentPage,
      total,
      showDetail,
      isNew,
      visible,
    } = this.state;
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 240,
      },
      {
        title: "描述",
        dataIndex: "desc",
        key: "desc",
        responsive: ["lg"],
      },
      {
        title: "管理机构",
        dataIndex: "owner",
        key: "owner",
        responsive: ["lg"],
        render: (owner) => <span>{owner ? owner.name : "-"}</span>,
      },
      {
        title: "类别",
        dataIndex: "template",
        width: 120,
        render: (value) => (
          <span>{value ? <Tag color="blue">模版</Tag> : ""}</span>
        ),
      },
      {
        title: "操作",
        key: "action",
        width: 120,
        render: (chooseItem) => {
          const { id, owner } = chooseItem;
          return (
            <div>
              <b
                onClick={() => {
                  this.reqGetGroupItem(id, "view");
                }}
                className="ant-green-link cursor"
              >
                <EyeOutlined title="查看" />
              </b>
              <Divider type="vertical" />
              <b
                onClick={() => {
                  let self = this;
                  //this.getPermissions(id)
                  comEvents.hasPower(
                    self,
                    reqPermit,
                    "UPDATE_GROUP",
                    "reqGetGroupItem",
                    chooseItem.id,
                    "edit"
                  );
                  //this.reqGetGroupItem(id, "edit");
                }}
                className="ant-blue-link cursor"
              >
                <EditOutlined title="修改" />
              </b>
              <Divider type="vertical" />
              <b
                onClick={() => {
                  let that = this;
                  confirm({
                    title: "确认删除分组【" + chooseItem.name + "】吗?",
                    icon: <ExclamationCircleOutlined />,
                    okText: "确认",
                    okType: "danger",
                    cancelText: "取消",
                    onOk() {
                      that.deleteItem(chooseItem.id);
                    },
                  });
                }}
                className="ant-pink-link cursor"
              >
                <DeleteOutlined title="删除" />
              </b>
            </div>
          );
        },
      },
    ];
    return (
      <div>
        <PageHeader
          className="site-page-header-responsive cont"
          title="权限与分组"
          extra={[
            <PlusSquareFilled
              key="add"
              className="setIcon"
              onClick={() => {
                let self = this;
                comEvents.hasPower(self, reqPermit, "CREATE_GROUP", "addItem");
              }}
            />,
          ]}
          onBack={this.backIndex}
        ></PageHeader>
        {/* --搜索栏-- */}
        <Form
          onFinish={this.searchValue}
          layout="horizontal"
          name="advanced_search"
          className="ant-advanced-search-form"
          initialValues={{
            searchTxt: "",
          }}
        >
          <Row>
            <Col span={6}>
              <Form.Item name="searchTxt" label="查询条件">
                <Input placeholder="请输入名称进行搜索" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Button
                  type="primary"
                  className="cursor searchBtn"
                  htmlType="submit"
                  loading={this.state.loading}
                  onClick={this.enterLoading}
                >
                  搜索
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {/* --搜索栏-- */}
        <Table
          rowKey="id"
          size="small"
          bordered
          dataSource={groups}
          columns={columns}
          pagination={false}
        />
        <div className="pagination">
          <Pagination
            size="small"
            pageSize={size}
            current={currentPage}
            onChange={this.handleTableChange}
            total={this.totalPages}
            showTotal={(total) => `总共 ${total} 条数据`}
          />
        </div>
        {visible ? this.renderGroupForm() : null}
        {showDetail ? this.renderGroupDetail() : null}
      </div>
    );
  };
  //查看组的详情
  renderGroupDetail = () => {
    let { name, desc, operations, template } = this.state.curInfo;
    return (
      <div>
        <Drawer
          title="权限与分组"
          width={400}
          visible={this.state.showDetail}
          onClose={this.onClose}
          footer={null}
        >
          <Descriptions
            bordered
            size="small"
            column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="名称">{name}</Descriptions.Item>
            <Descriptions.Item label="描述">
              {desc ? desc : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="是否模版">
              {template ? "是" : "否"}
            </Descriptions.Item>
            <Descriptions.Item label="权限">
              <div className="scrollStyle">
                {operations && operations.length !== 0
                  ? operations.map((item, index) => (
                      <div key={index}>{Operations[item]}</div>
                    ))
                  : "-"}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Drawer>
      </div>
    );
  };
  render() {
    return (
      <div style={{ height: "100%" }}>
        {this.state.inited ? this.renderContent() : <Loading />}
      </div>
    );
  }
}

export default Groups;
