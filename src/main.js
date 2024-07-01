import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import Vant from "vant";
import { Lazyload } from "vant";
import "vant/lib/index.css";
import "vant/lib/icon/local.css";
import "./utils/rem";

import "./assets/css/reset.css";
import "./assets/css/style.scss";

import Vconsole from "vconsole";
import VueWechatTitle from "vue-wechat-title";
import JsEncrypt from "jsencrypt";
import VueI18n from "vue-i18n";
import signatureToPoint from "./components/signatureToPoint/index";
import GLOBAL from "@/utils/Global";
import { deepClone } from "@/utils/tools.js";
import orgLogo from "@/components/orgLogo.vue";
import UploadProgress from "@/components/UploadProgress.vue";
import hearderBlock from "@/components/header.vue";

Vue.config.productionTip = false;
Vue.use(VueWechatTitle);
Vue.use(Vant);
Vue.use(Lazyload);
Vue.use(VueI18n);
Vue.use(signatureToPoint);

Vue.component("orgLogo", orgLogo);
Vue.component("UploadProgress", UploadProgress);
Vue.component("hearderBlock", hearderBlock);

let i18n = new VueI18n({
  locale: "en-US",
  messages: {
    "en-US": store.state.tag,
    "zh-CN": store.state.tag,
    "zh-HK": store.state.tag,
  },
  silentTranslationWarn: true,
});
import {
  get,
  post,
  postNoLoading,
  postImgPercent,
  getAliToken,
} from "./utils/api";
import { toFixed2 } from "./utils/tools";
Vue.prototype.$get = get;
Vue.prototype.$post = post;
Vue.prototype.$postNoLoading = postNoLoading;
Vue.prototype.$postImgPercent = postImgPercent;
Vue.prototype.$getAliToken = getAliToken;
Vue.prototype.$jsEncrypt = JsEncrypt;
Vue.prototype.$toFixed2 = toFixed2;
Vue.prototype.$GLOBAL = GLOBAL;
Vue.prototype.$bus = new Vue();
Vue.prototype.$deepClone = deepClone;

if (window.APP_SHOW_CONSOLE === "true") {
  let vConsole = new Vconsole();
  Vue.use(vConsole);
}

Vue.config.errorHandler = (error, instance, info) => {
  hina.track(
    'error',
    {
      errorType: 'vue_error',
      errorPath: instance.$route.fullPath,
      info: info,
      errorData: error.toString()
    }
  );  
}
new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
