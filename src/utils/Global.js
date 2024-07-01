// const baseURL = "http://192.168.1.21:8081/"; //凯哥
// const baseURL = "http://192.168.1.29:8080/"; //凯哥
// const baseURL = "http://192.168.1.29:8080/"; //建行测试环境
// const baseURL = "https://dev-endpoint-portal-ccb-itrmch.yunupay.com/"; //建行测试环境
// https://dev-portal-ccb-itrmch.yunupay.com

// const baseURL = "https://endpoint-portal-common-itrmch.yunupay.com/"; //南京生产环境

// const baseURL = "https://endpoint-portal-ccb-itrmch.yunupay.com/"; //建行生产环境

// const baseURL = "https://uat-endpoint-portal-ccb-itrmch.yunupay.com/"; //预生产环境

// 切换生产环境时不要忘记切换RSA（@/utils/RSA.js）中公钥和私钥，生产环境和测试环境的公钥和私钥不一样
// 同时，切换为生产环境时，需要将vConsole（main.js）禁用

const baseURL = "/prod-api/"; //所有参数都放到rancher中，使用nginx代理到指定后端，无需前端再去修改代码适配各个环境

export default {
  baseURL,
};
