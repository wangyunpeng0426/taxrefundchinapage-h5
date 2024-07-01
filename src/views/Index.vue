<template>
  <div class="page">
    <!-- 退税点不可用 - start -->
    <div class="index" v-if="this.stats != 'enable'">
      <div class="content">
        <img src="../assets/image/img-1.png" />
        <!-- <p>显示应用超时，请返回重新操作.</p> -->
        <p>{{ $t("Index.systemError") }}</p>
      </div>
    </div>
    <!-- 退税点不可用 - end -->
  </div>
</template>

<script>
import { RSA } from "@/utils/RSA";
import { Dialog } from "vant";
import { mapGetters } from "vuex";
export default {
  name: "Index",
  components: {},
  data() {
    return {
      touristId: this.$store.state.touristId || "",
      counterId: this.$route.query.counterId || "",
      stats: this.$route.query.stats || "", // 退税点状态
      language:
        JSON.stringify(this.$store.state.langInfo) != "{}"
          ? this.$store.state.langInfo.lang
          : "", // e.g. => en-US
      radio: "", // 选中的值
      langList: [], // 语言列表
    };
  },
  computed: {
    ...mapGetters(["partnerSourceId", "orgLogo"]),
  },
  created() {
    this.$bus.$emit("changeElfShow", true);
  },
  async mounted() {
    // 清空缓存里cardId
    this.$store.commit("setCardId", "");
    this.$store.commit("setPage", "");
    // 获取token
    if (this.stats != "enable") {
      return false;
    }
    this.$store.commit(
      "setPartnerSourceId",
      this.$route.query.partnerSourceId ? this.$route.query.partnerSourceId : ""
    );
    if (!this.$route.query.partnerSourceId && this.partnerSourceId) {
      await this.getPartnerInfo();
    }
    await this.getToken();
  },
  methods: {
    async getPartnerInfo() {
      let res = await this.$post("/v1/getPartnerInfo", {
        partnerSourceId: this.partnerSourceId,
      });
      if (res.code == 200 && res.data.setMealStatus == "1") {
        this.$store.commit("setOrgLogo", res.data.cardOrgLogo);
        this.$store.commit(
          "setIssueLogoList",
          res.data.cardOrgInfoList
            .filter((item) => item.cardOrgStatus == "1")
            .map((item) => ({
              issueId: item.cardOrgId,
              issueName: item.cardOrgName,
              issueLogo: item.cardOrgLogo,
              issueLogoView: item.cardOrgLogo,
            }))
        );
      } else {
        this.stats = "disable";
      }
    },
    // 获取token
    async getToken() {
      let timestamp = new Date().getTime() + "";
      let data = {
        key: RSA(timestamp, "PU"),
      };
      let response = await this.$post("/getToken", data);
      // .then((response) => {
      if (response.code == "success") {
        console.log("response.data", response.data);
        this.$nextTick(async () => {
          this.$store.commit("setToken", response.data);
          if (this.stats == "disable") {
            this.getLanguageList();
          } else {
            // 获取退税点信息
            await this.getCounterInfo();
          }
        });
      }
      // });
    },
    // 获取退税点信息
    async getCounterInfo() {
      let data = {
        counterId: this.counterId,
      };
      let response = await this.$post("/getCounterInfo", data)
      // .then((response) => {
        if (
          response.code == "success" &&
          response.data &&
          response.data.counterState !== "0" &&
          response.data.taxOrgState !== "0"
        ) {
          this.$store.commit("setIssueIds", response.data.issueIds);
          this.$store.commit("setCounterId", this.counterId);
          this.$store.commit(
            "setCounterReceiveMethod",
            response.data.counterReceiveMethod
          );
          this.$store.commit(
            "setEntryExitSeal",
            response.data.entryExitSeal || "0"
          );
          this.$store.commit(
            "setIsDateOfEntry",
            response.data.isDateOfEntry || "0"
          );
          this.$store.commit(
            "setCounterTypes",
            response.data.counterTypes || "0"
          );
          if (!(this.partnerSourceId && this.orgLogo)) {
            this.$store.commit("setOrgLogo", response.data.orgLogoView);
          }
          this.$store.commit("setOrgId", response.data.orgId);
          this.$store.commit("setPage", "Passport");

          this.$store.commit(
            "setPromptRecoverDays",
            response.data.promptRecoverDays
          );
          if (this.touristId) {
            this.getUserInfo();
          } else {
            this.$router.replace({
              path: "/Passport",
              query: {
                counterId: this.counterId,
                pageType: this.touristId ? 3 : 1,
              },
            });
          }
        } else {
          this.stats = "disable";
        }
      // });
    },
    // 获取语言相关文字
    getLabel(radio) {
      let data = {
        language: radio,
      };
      this.$post("/tag/getTagList", data).then((response) => {
        if (response.code == "success") {
          for (let i = 0; i < this.langList.length; i++) {
            if (radio == this.langList[i].dictCode) {
              this.language = this.langList[i].remark;
            }
          }
          this.$store.commit("setLangInfo", {
            lang: this.language, // e.g. => zh-CN
            lan: this.radio, // e.g. => 44
          }); // 缓存 - 语言选择
          this.$store.commit("setTag", "");
          this.$store.commit("setTag", response.data); // 缓存 - 标签内容
          this.$i18n.locale = this.language;
          this.$i18n.setLocaleMessage(
            `${this.language}`,
            this.$store.state.tag
          );
          this.QrCodeIsInvalid();
        }
      });
    },
    // 获取语种列表弹层
    getLanguageList() {
      let lang = navigator.language || navigator.userLanguage; // 常规浏览器语言和IE浏览器 e.g. => en-US
      let lan = lang.substr(0, 2); // 截取lang前2位字符 e.g. => en
      this.$get("/getLanList", {}).then((response) => {
        if (response.code == "success") {
          this.langList = response.data;
          for (let i = 0; i < this.langList.length; i++) {
            if (lang.toUpperCase() == this.langList[i].remark.toUpperCase()) {
              this.language = this.langList[i].remark; // e.g. => zh-CN
              this.radio = this.langList[i].dictCode; // e.g. => 44
              this.getLabel(this.radio);
              return;
            } else {
              if (lan.toUpperCase() == "ZH") {
                this.radio = 45;
                this.language = "zh-HK";
                this.getLabel(this.radio);
                return;
              } else {
                this.radio = 46;
                this.language = "en-US";
                this.getLabel(this.radio);
                return;
              }
            }
          }
        }
      });
    },
    //退税点禁用弹框
    QrCodeIsInvalid() {
      Dialog.alert({
        message: this.$t("Index.QrCodeIsInvalid"),
        confirmButtonText: this.$t("App.alert_confirm"),
      }).then(() => {
        if (navigator.userAgent.indexOf("Firefox") > 0) {
          window.location.href = "about:blank ";
          //火狐默认状态非window.open的页面window.close是无效的
          //window.history.go(-2);
        } else {
          window.opener = null;
          window.open("", "_self", "");
          window.close();
        }
        document.addEventListener(
          "WeixinJSBridgeReady",
          function () {
            WeixinJSBridge.call("closeWindow");
          },
          false
        );
        //这个可以关闭ios系统的手机
        WeixinJSBridge.call("closeWindow");
      });
    },
    // 更新用户退税点
    getUserInfo() {
      let data = {
        touristId: this.touristId,
      };
      this.$post("/getUserInfo", data).then((response) => {
        if (response.code != "success") {
          // 注销 1.清空缓存 2.清空touristId 3.清空header选中
          this.$store.commit("setLangShow", "true");
          this.$store.commit("setLangInfo", {});
          this.$store.commit("setTouristId", "");
          this.$store.commit("setCardId", "");
          this.$store.commit("setTag", {});
          this.$store.commit("setPage", "Passport");
          this.$store.commit("setEntrySealUrl", "");
          this.$store.commit("setExitSealUrl", "");
          this.$store.commit("setEntrySealBase", "");
          this.$store.commit("setExitSealBase", "");
          this.$store.commit("setDateOfEntry", "");
          this.$store.commit("setDateUrl", "");
        }
        this.$router.replace({
          path: "/Passport",
          query: {
            counterId: this.counterId,
            pageType: this.touristId ? 3 : 1,
          },
        });
      });
    },
  },
};
</script>
