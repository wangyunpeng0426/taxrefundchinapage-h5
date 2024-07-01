<template>
  <div class="page">
    <div class="passport">
      <hearderBlock v-show="head != 'no'" />
      <UploadLicense
        @finishUploadPassPort="finishUploadPassPort"
        v-if="pageType == PAGE_TYPE.PAGE_UPLOAD"
      />
      <div class="content-2" style="overflow: auto" v-else>
        <EditUserInfo
          v-if="userInfoShowStep === USERINFO.FIRST_STEP"
          :backBtnShow="head === 'no'"
          @reUpload="reUpload"
          @finishAddUser="finishAddUser"
          @finishUpdateUser="finishUpdateUser"
          @toBack="toBack"
          :userInfo="userInfo"
        />
        <template v-else>
          <EntrySeal
            v-if="passPortType === LICENSE_TYPE.PASSPORT"
            :backBtnShow="head === 'no'"
            @reUpload="reUpload"
            @gotoBankCard="gotoBankCard"
            @toBack="toBack"
            :counterTypes="counterInfo.counterTypes"
            :entrySealUrl="entrySealUrl"
            :exitSealUrl="exitSealUrl"
            :entrySealBase="entrySealBase"
            :exitSealBase="exitSealBase"
          />
          <EntryDate
            v-else
            :backBtnShow="head === 'no'"
            :dateOfEntry="dateOfEntry"
            @reUpload="reUpload"
            @gotoBankCard="gotoBankCard"
            @toBack="toBack"
          />
        </template>
      </div>
    </div>
    <div v-if="!taxRefundType" class="taxRefundTypeContainer">
      <div class="title">请选择退税方式</div>
      <div
        class="card"
        style="top: 30%"
        @click="selectTaxRefundType('BackCard')"
      >
        <img src="../../assets/image/u4.png" />
        <div class="content">银行卡退税</div>
      </div>
      <div class="card" style="top: 55%" @click="selectTaxRefundType('Cash')">
        <img src="../../assets/image/u9.png" />
        <div class="content">市区现金退税</div>
      </div>
      <div class="logo-icbc">
        <orgLogo></orgLogo>
      </div>
    </div>
  </div>
</template>

<script>
import { Notify, Dialog } from "vant";
import { mapGetters, mapMutations } from "vuex";
import { LICENSE_TYPE } from "@/utils/enum.js";
import { RSA } from "@/utils/RSA";

const PAGE_TYPE = {
  PAGE_UPLOAD: "1", //护照上传页
  PAGE_INFO: "2", //护照补全信息页(只有上传完护照才会显示 其它情况不显示)
  PAGE_INFO_SHOW: "3", //护照详情页 输入框不可以修改
};
const USERINFO = {
  //补全信息页显示页面
  FIRST_STEP: "1", //
  SECOND_STEP: "2", //second
};
export default {
  data() {
    return {
      PAGE_TYPE,
      USERINFO,
      LICENSE_TYPE,
      pageType: PAGE_TYPE.PAGE_UPLOAD,
      head: this.$route.query.head || "",
      counterInfo: {},
      docmHeight: "0", // 默认屏幕高度
      showHeight: "0", // 实时屏幕高度
      hideShow: true, // 显示或者隐藏footer,
      isResize: false, // 默认屏幕高度是否已获取
      userInfo: void 0,
      userInfoShowStep: USERINFO.FIRST_STEP,
    };
  },
  computed: {
    ...mapGetters([
      "counterId",
      "touristId",
      "countryList",
      "chinaCountryList",
      "passPortType",
      "entrySealUrl",
      "exitSealUrl",
      "entrySealBase",
      "exitSealBase",
      "dateOfEntry",
      "entryExitSeal",
      "isDateOfEntry",
      "partnerSourceId",
      "orgLogo",
      "taxRefundType",
    ]),
  },
  components: {
    UploadLicense: () => import("./components/UploadLicense.vue"),
    EditUserInfo: () => import("./components/EditUserInfo.vue"),
    EntrySeal: () => import("./components/EntrySeal.vue"),
    EntryDate: () => import("./components/EntryDate.vue"),
  },
  methods: {
    qrDiscernForCount(ip) {
      let data = {
        counterId: this.counterId,
        deviceIp: "",
      };
      this.$post("/qr/qrDiscernForCount", data).then((response) => {
        if (response.code == "success") {
        }
      });
    },
    resize() {
      if (!this.isResize) {
        //默认屏幕高度
        this.docmHeight = document.documentElement.clientHeight;
        this.isResize = true;
        this.hideShow = true;
      }
      //实时屏幕高度
      this.showHeight = document.body.clientHeight;
    },
    dialogInfoOpen(msg) {
      Dialog.alert({
        message: msg,
        confirmButtonText: this.$t("App.alert_confirm"),
      });
    },
    ...mapMutations([
      "setCounterId",
      "setTouristId",
      "setPassPortType",
      "setEntrySealUrl",
      "setExitSealUrl",
      "setCounterTypes",
      "setDateOfEntry",
      "setEntrySealBase",
      "setExitSealBase",
      "setTaxRefundType",
    ]),
    finishUploadPassPort(userInfo) {
      this.userInfo = userInfo;
      this.pageType = PAGE_TYPE.PAGE_INFO;
      this.userInfoShowStep = USERINFO.FIRST_STEP;
    },
    reUpload() {
      if (!this.userInfo.hasTaxed) {
        this.pageType = PAGE_TYPE.PAGE_UPLOAD;
        this.setTouristId("");
      } else {
        Dialog.alert({
          message: this.$t("Passport.donteditid"),
          confirmButtonText: this.$t("App.alert_confirm"),
        });
      }
    },
    finishAddUser(touristId) {
      this.clearEntryInfo();
      this.setTouristId(touristId);
      if (
        this.passPortType === LICENSE_TYPE.PASSPORT &&
        this.entryExitSeal == "1"
      ) {
        this.userInfoShowStep = USERINFO.SECOND_STEP;
      } else if (
        this.passPortType !== LICENSE_TYPE.PASSPORT &&
        this.isDateOfEntry == "1"
      ) {
        this.userInfoShowStep = USERINFO.SECOND_STEP;
      } else {
        this.gotoBankCard();
      }
    },
    finishUpdateUser(data) {
      //原代码更新用户后，无法修改入境章和入境时间，故不设置直接跳转到银行卡列表
      this.clearEntryInfo();
      if (
        this.passPortType === LICENSE_TYPE.PASSPORT &&
        this.entryExitSeal == "1"
      ) {
        this.userInfoShowStep = USERINFO.SECOND_STEP;
      } else if (
        this.passPortType !== LICENSE_TYPE.PASSPORT &&
        this.isDateOfEntry == "1"
      ) {
        this.userInfoShowStep = USERINFO.SECOND_STEP;
      } else {
        this.gotoBankCard();
      }
    },
    clearEntryInfo() {
      this.setDateOfEntry("");
      this.setEntrySealUrl("");
      this.setExitSealUrl("");
      this.setEntrySealBase("");
      this.setExitSealBase("");
    },
    gotoBankCard() {
      this.$store.commit("setPage", "Passport");
      this.$router.push({ path: "/BankCard" });
    },
    toBack() {
      this.$router.go(-1);
    },
    async getCounterInfo() {
      let res = await this.$post("/getCounterInfo", {
        counterId: this.counterId,
      });
      if (
        res.code === "success" &&
        res.data &&
        res.data.counterState !== "0" &&
        res.data.taxOrgState !== "0"
      ) {
        this.$store.commit("setIssueIds", res.data.issueIds);
        this.$store.commit("setOrgId", res.data.orgId);
        this.$store.commit("setEntryExitSeal", res.data.entryExitSeal || "0");
        this.$store.commit("setIsDateOfEntry", res.data.isDateOfEntry || "0");
        if (!(this.partnerSourceId && this.orgLogo)) {
          this.$store.commit("setOrgLogo", res.data.orgLogoView);
        }

        this.counterInfo.issueIds = res.data.issueIds; //支持发卡组织
        this.counterInfo.isDateOfEntry = res.data.isDateOfEntry || "0"; //港澳台客人是否需签署入境日期承诺书 1需要，0不需要
        this.counterInfo.entryExitSeal = res.data.entryExitSeal || "0"; //是否需要出入境章（0：不需要[默认]  1:需要）
        this.counterInfo.counterTypes = res.data.counterTypes || "0"; //退税点类型（1：机场；0：市区）
        this.setCounterTypes(this.counterInfo.counterTypes);
        this.counterInfo.orgId = res.data.orgId; //机构id
        this.counterInfo.counterReceiveMethod = res.data.counterReceiveMethod;
        this.counterInfo.orgLogo = this.orgLogo; //机构logo
      } else {
        // this.dialogInfoOpen(res.msg);
        this.$bus.$emit("closePromptDialog");
        this.$router.replace({
          path: "/",
          query: {
            stats: "disable",
          },
        });
      }
    },
    async getUserInfo() {
      let res = await this.$post("/getUserInfo", { touristId: this.touristId });
      if (res.code === "success") {
        this.userInfo = {
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          idNo: res.data.userPassport,
          hasTaxed: res.data.hasTaxed, // 是否退过税
          validity: res.data.passportDueTime,
          nationality: res.data.touristNationCode,
          nationalitycn: res.data.touristNationCn,
        };
        this.setPassPortType(res.data.idType);
        this.setTouristId(res.data.touristId);
      } else {
        this.dialogInfoOpen(res.msg);
      }
    },
    //更新用户信息
    async updateUserInfo(params) {
      await this.$post("/updateUserInfo", params);
    },
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
        this.$bus.$emit("closePromptDialog");
        this.$router.replace({
          path: "/",
          query: {
            stats: "disable",
          },
        });
      }
    },
    selectTaxRefundType(type) {
      this.setTaxRefundType(type);
      if (!this.touristId) {
        this.$nextTick(() => {
          this.$bus.$emit("openPromptDialog");
        });
      }
    },
  },
  created() {
    let currentUrl = window.location.href;
    if (currentUrl.includes("reload")) {
      let urlObject = new URL(currentUrl);
      urlObject.searchParams.delete("reload");
      window.location.href = urlObject.toString();
    }
    this.userInfoShowStep = USERINFO.FIRST_STEP;
    if (this.$route.query.touristId) {
      this.setTouristId(this.$route.query.touristId);
    }
    if (!this.counterId && !this.$route.query.counterId) {
      Notify({ type: "danger", message: "通知内容" });
    } else if (this.$route.query.counterId) {
      this.setCounterId(this.$route.query.counterId);
    }
    this.getCounterInfo();
    if (this.touristId) {
      this.getUserInfo();
      if (this.pageType === PAGE_TYPE.PAGE_UPLOAD) {
        this.pageType = PAGE_TYPE.PAGE_INFO_SHOW;
      }
    } else {
      // if (this.partnerSourceId) {
      //   this.$bus.$emit("openPromptDialog");
      // } else {
      this.$bus.$emit("openLanguageDialog");
      // }
      this.pageType = PAGE_TYPE.PAGE_UPLOAD;
    }
    if (this.partnerSourceId) {
      this.getPartnerInfo();
    }
    this.qrDiscernForCount(sessionStorage.getItem("ip"));
    window.onreset = this.resize();
  },
  async mounted() {
    let timestamp = new Date().getTime() + "";
    let data = {
      key: RSA(timestamp, "PU"),
    };
    let response = await this.$post("/getToken", data);
    if (response.code == "success") {
      this.$nextTick(async () => {
        this.$store.commit("setToken", response.data);
      });
    }
  },
};
</script>
