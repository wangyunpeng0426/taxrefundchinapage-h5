import Vue from "vue";
import Vuex from "vuex";
import { postNoLoading } from "@/utils/api";
import router from "@/router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: localStorage.getItem("token"),
    counterId: localStorage.getItem("counterId"),
    entryExitSeal: localStorage.getItem("entryExitSeal"),
    isDateOfEntry: localStorage.getItem("isDateOfEntry"),
    counterTypes: localStorage.getItem("counterTypes"),
    orgLogo: localStorage.getItem("orgLogo"),
    langShow: localStorage.getItem("langShow"),
    langInfo: localStorage.getItem("langInfo")
      ? JSON.parse(localStorage.getItem("langInfo"))
      : {},
    touristId: localStorage.getItem("touristId"),
    cardId: localStorage.getItem("cardId"),
    tag: localStorage.getItem("tag")
      ? JSON.parse(localStorage.getItem("tag"))
      : {},
    page: localStorage.getItem("page"),
    entrySealUrl: localStorage.getItem("entrySealUrl") || "",
    exitSealUrl: localStorage.getItem("exitSealUrl") || "",
    entrySealBase: localStorage.getItem("entrySealBase") || "",
    exitSealBase: localStorage.getItem("exitSealBase") || "",
    exitDateUrl: localStorage.getItem("exitDateUrl"),
    dateOfEntry: localStorage.getItem("dateOfEntry") || "",
    issueIds: localStorage.getItem("issueIds"),
    issueCounter: localStorage.getItem("issueCounter") || [],
    counterReceiveMethod: localStorage.getItem("counterReceiveMethod"),
    orgId: localStorage.getItem("orgId"),
    countryList: [],
    chinaCountryList: [],
    userInfo: localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null,
    passPortType: localStorage.getItem("passPortType"),
    promptRecoverDays: localStorage.getItem("promptRecoverDays") || 17,
    partnerSourceId: localStorage.getItem("partnerSourceId") || "",
    issueLogoList: localStorage.getItem("issueLogoList") || [],
    taxRefundType: localStorage.getItem("TaxRefundType"),
  },
  mutations: {
    setToken(state, data) {
      if (data != undefined) {
        state.token = data;
        localStorage.setItem("token", data);
      }
    },
    setCounterId(state, data) {
      state.counterId = data;
      localStorage.setItem("counterId", data);
    },
    setEntryExitSeal(state, data) {
      // 是否需要出入境章（0：不需要[默认]  1:需要）
      state.entryExitSeal = data;
      localStorage.setItem("entryExitSeal", data);
    },
    setIsDateOfEntry(state, data) {
      // 是否需要选择入境时间（0：不需要[默认]  1:需要）
      state.isDateOfEntry = data;
      localStorage.setItem("isDateOfEntry", data);
    },
    setCounterTypes(state, data) {
      // 退税点类型（1：机场；0：市区）
      state.counterTypes = data;
      localStorage.setItem("counterTypes", data);
    },
    setOrgLogo(state, data) {
      // 页面底部机构logo
      state.orgLogo = data;
      localStorage.setItem("orgLogo", data);
    },
    setLangShow(state, data) {
      // 控制国际化弹层显示状态
      state.langShow = data;
      localStorage.setItem("langShow", data);
    },
    setLangInfo(state, data) {
      // 国际化选中保存信息
      state.langInfo = data;
      localStorage.setItem("langInfo", JSON.stringify(data));
    },
    setTouristId(state, data) {
      if (state.touristId !== data && state.taxRefundType === "Cash") {
        postNoLoading("/getTaxOrderAndGuanranteeList", {
          touristId: data,
          pageSize: 1,
          pageNo: 1,
          orderStatus: "1",
          taxRefundType: "1",
        }).then((response) => {
          if (response.code == "success") {
            if (response.data.taxOrderList.length > 0) {
              if (response.data.taxOrderList[0].guanranteeState === "4") {
                localStorage.setItem(
                  "OrderSign",
                  response.data.taxOrderList[0].orderSign
                );
                this.$router.push({
                  path: `/Sign`,
                  query: {
                    touristId: this.touristId,
                    cardId: response.data.taxOrderList[0].cardId,
                    taxOrderId: response.data.taxOrderList[0].orderId,
                    isSign: 1,
                  },
                });
              } else {
                this.$router.push({
                  path: `/CashQrcode`,
                  query: {
                    taxOrderId: response.data.taxOrderList[0].orderId,
                  },
                });
              }
              // router.push({
              //   path: `/CashQrcode`,
              //   query: {
              //     taxOrderId: response.data.taxOrderList[0].orderId,
              //   },
              // });
            }
          }
        });
      }
      state.touristId = data;
      localStorage.setItem("touristId", data);
    },
    setCardId(state, data) {
      state.cardId = data;
      localStorage.setItem("cardId", data);
    },
    setTag(state, data) {
      // 国际化标签内容
      state.tag = data;
      localStorage.setItem("tag", JSON.stringify(data));
    },
    setPage(state, data) {
      // 控制header选中样式
      state.page = data;
      localStorage.setItem("page", data);
    },
    setEntrySealUrl(state, data) {
      // 入境图片地址
      state.entrySealUrl = data;
      localStorage.setItem("entrySealUrl", data);
    },
    setExitSealUrl(state, data) {
      // 出境图片地址
      state.exitSealUrl = data;
      localStorage.setItem("exitSealUrl", data);
    },
    setEntrySealBase(state, data) {
      // 入境图片base64
      state.entrySealBase = data;
      localStorage.setItem("entrySealBase", data);
    },
    setExitSealBase(state, data) {
      // 出境图片base64
      state.exitSealBase = data;
      localStorage.setItem("exitSealBase", data);
    },
    setDateUrl(state, data) {
      // 出入境图片过期时间
      state.exitDateUrl = data;
      localStorage.setItem("exitDateUrl", data);
    },
    setDateOfEntry(state, data) {
      // 入境时间
      state.dateOfEntry = data;
      localStorage.setItem("dateOfEntry", data);
    },
    setIssueIds(state, data) {
      // 当前退税点支持卡组织Id
      state.issueIds = data;
      localStorage.setItem("issueIds", data);
    },
    setIssueCounter(state, data) {
      // 当前退税点支持卡组织Id
      state.issueCounter = data;
      localStorage.setItem("issueCounter", JSON.stringify(data));
    },
    setCounterReceiveMethod(state, data) {
      // 收取税单方式  0 邮寄   1 机构自取
      state.counterReceiveMethod = data;
      localStorage.setItem("counterReceiveMethod", data);
    },
    setOrgId(state, data) {
      // 机构Id
      state.orgId = data;
      localStorage.setItem("orgId", data);
    },
    setCountryList(state, data) {
      state.countryList = data;
    },
    setChinaCountryList(state, data) {
      state.chinaCountryList = data;
    },
    setUserInfo(state, data) {
      state.userInfo = data;
      localStorage.setItem("userInfo", JSON.stringify(data));
    },
    setPassPortType(state, data) {
      state.passPortType = data;
      localStorage.setItem("passPortType", data);
    },
    setPromptRecoverDays(state, data) {
      state.promptRecoverDays = data;
      localStorage.setItem("promptRecoverDays", data);
    },
    setPartnerSourceId(state, data) {
      state.partnerSourceId = data;
      localStorage.setItem("partnerSourceId", data);
    },
    setIssueLogoList(state, data) {
      state.issueLogoList = data;
      localStorage.setItem("issueLogoList", JSON.stringify(data));
    },
    setTaxRefundType(state, taxRefundType) {
      state.taxRefundType = taxRefundType;
      localStorage.setItem("TaxRefundType", taxRefundType);
    },
  },
  actions: {},
  modules: {},
  getters: {
    counterId: (state) => state.counterId,
    counterTypes: (state) => state.counterTypes,
    touristId: (state) => state.touristId,
    countryList: (state) => state.countryList,
    chinaCountryList: (state) => state.chinaCountryList,
    userInfo: (state) => state.userInfo,
    passPortType: (state) => state.passPortType,
    entrySealUrl: (state) => state.entrySealUrl,
    exitSealUrl: (state) => state.exitSealUrl,
    entrySealBase: (state) => state.entrySealBase,
    exitSealBase: (state) => state.exitSealBase,
    dateOfEntry: (state) => state.dateOfEntry,
    issueIds: (state) => state.issueIds,
    orgLogo: (state) => state.orgLogo,
    orgId: (state) => state.orgId,
    cardId: (state) => state.cardId,
    page: (state) => state.page,
    entryExitSeal: (state) => state.entryExitSeal,
    isDateOfEntry: (state) => state.isDateOfEntry,
    promptRecoverDays: (state) => state.promptRecoverDays,
    langInfo: (state) => state.langInfo,
    partnerSourceId: (state) => state.partnerSourceId,
    issueCounter: (state) => state.issueCounter,
    issueLogoList: (state) => {
      if (Array.isArray(state.issueLogoList)) {
        return state.issueLogoList;
      } else {
        return JSON.parse(state.issueLogoList);
      }
    },
    taxRefundType: (state) => state.taxRefundType,
  },
});
