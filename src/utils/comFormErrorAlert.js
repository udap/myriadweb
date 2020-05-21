//comFormErrorAlert 公共表单错误信息提示
const typeTemplate = "${label}不是一个合法的 ${type}";

const defaultValidateMessages = {
  default: "${label}'验证错误",
  required: "${label}是必填项",
  enum: "${label}必须是[${enum}]里面的数",
  whitespace: "${label}cannot be empty",
  date: {
    format: "${label}is invalid for format date",
    parse: "${label}could not be parsed as date",
    invalid: "${label}is invalid date",
  },
  types: {
    string: typeTemplate,
    method: typeTemplate,
    array: typeTemplate,
    object: typeTemplate,
    number: typeTemplate,
    date: typeTemplate,
    boolean: typeTemplate,
    integer: typeTemplate,
    float: typeTemplate,
    regexp: typeTemplate,
    email: typeTemplate,
    url: typeTemplate,
    hex: typeTemplate,
  },
  string: {
    len: "${label}必须是 ${len} 位字符",
    min: "${label}至少是 ${min} 位字符",
    max: "${label}不能超过 ${max} 位字符",
    range: "${label}必须是介于 ${min} 和 ${max}之间",
  },
  number: {
    len: "${label}必须是${len}为数",
    min: "${label}不能小于 ${min}",
    max: "${label}不能超过 ${max}",
    range: "${label}必须在 ${min}和 ${max}之间",
  },
  array: {
    len: "${label}长度必须是${len} ",
    min: "${label}长度不能小于 ${min}",
    max: "${label}长度不能超过${max}",
    range: "${label}长度必须介于 ${min} 和 ${max} 之间",
  },
  pattern: {
    mismatch: "${label}'和正则 ${pattern}不匹配",
  },
};
export default {
  defaultValidateMessages,
};
