<template>
  <div class="page">
    <div class="receipt">
      <div class="content-4">
        <div class="content-top">
          <div class="content-info">
            <p class="info-name">{{ orderInfo.userInfo.userNameEn }}</p>
            <p class="info-num">{{ orderInfo.userInfo.idHideNo }}</p>
            <p class="info-address">
              <van-icon name="location" />{{
                orderInfo.userInfo.merchantNameCn
              }}
            </p>
          </div>
        </div>
        <div class="content-bottom">
          <div class="block-1">
            <van-cell-group class="card">
              <van-cell>
                <template #title>
                  <div class="title">
                    <div class="title-left">
                      <img :src="orderInfo.cardInfo.bankLogoView" />
                    </div>
                    <div class="title-right">
                      <div class="title-right-top">
                        <span class="card-type">
                          {{ orderInfo.cardInfo.bankName }}
                        </span>
                      </div>
                      <div class="title-right-bottom">
                        {{ toAddSpace(orderInfo.cardInfo.cardNo) }}
                      </div>
                    </div>
                  </div>
                </template>
                <template #label>
                  <div class="label">
                    <span class="card-tip">
                      {{ $t("Receipt.info_tip") }}
                    </span>
                  </div>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
          <div class="block-qr">
            <p class="code-title">将此码展示给市区退税柜台人员，领取现金</p>
            <div class="code-img">
              <img id="barcode" @click="openBarCode()" style="width: 80%" />
              <canvas
                @click="openQrCode()"
                ref="qrcodeCanvas"
                style="width: 50%; height: 50%"
              ></canvas>
            </div>
            <div
              class="btn btn-m"
              style="margin-top: 16px"
              @click="revokeGuarantee()"
            >
              <span>撤销担保</span>
            </div>
          </div>
        </div>
        <div class="btn-group-qr-bottom-container">
          <div class="logo-icbc">
            <orgLogo></orgLogo>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="qr_code_big || bar_code_big"
      @click="closeBigQrCode"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
        background: #f6f6f6;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <img
        v-show="bar_code_big"
        id="barcode_big"
        style="transform: rotate(90deg); height: 30%"
      />
      <canvas
        v-show="qr_code_big"
        @click="openQrCode()"
        ref="qrcodeCanvas_big"
        style="width: 300px; height: 300px"
      ></canvas>
    </div>

    <van-overlay :show="show">
      <CustomLoading :isRevoke="isRevoke" @goPassport="goPassport" />
    </van-overlay>
  </div>
</template>

<script>
import { Dialog } from "vant";
import { addSpace } from "@/utils/tools";
import { mapGetters, mapMutations } from "vuex";
import WebSocketService from "@/utils/websocket";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import CustomLoading from "@/components/customLoading";
export default {
  data() {
    return {
      orderInfo: {
        userInfo: {},
        cardInfo: {},
      },
      voucherList: [],
      invoiceList: [],
      voucherTotal: 0,
      invoiceTotal: 0,

      activeVoucher: "0",
      activeInvoice: "0",
      orderId: this.$route.query.taxOrderId,
      qr_code_big: false,
      bar_code_big: false,
      webSocket: null,
      show: false,
      isRevoke: false,
      goPassportTime: null,
    };
  },
  components: {
    CustomLoading,
  },
  computed: {
    ...mapGetters(["touristId", "orgId"]),
  },
  methods: {
    ...mapMutations(["setTaxRefundType", "setPage"]),
    getTaxOrderListFromRedis(type) {
      this.$post("/getTaxOrderListFromRedis", {
        step: type,
        touristId: this.touristId,
      }).then((response) => {
        if (response.code == "success") {
          this.voucherList = JSON.parse(response.data.voucherArr) || [];
          this.invoiceList = JSON.parse(response.data.invoiceArr) || [];
          this.voucherTotal =
            JSON.parse(response.data.total).taxAmtTotal || "0.00";
          this.invoiceTotal =
            JSON.parse(response.data.total).invoiceTaxPriceSum || "0.00";
          if (
            this.voucherList.length == 0 ||
            this.invoiceList.length == 0 ||
            this.voucherList.length !== this.invoiceList.length
          ) {
            this.$store.commit("setPage", "Passport,BankCard,Receipt");
          }
        } else {
          Dialog.alert({
            message: response.msg,
            confirmButtonText: this.$t("App.alert_confirm"),
          });
        }
      });
    },
    async getUserInfo() {
      let res = await this.$post("/getUserInfo", {
        touristId: this.touristId,
      });
      if (res.code == "success") {
        this.orderInfo.userInfo = {
          userNameEn: res.data.userNameEn,
          idHideNo: res.data.idHideNo,
          merchantNameCn: res.data.merchantNameCn,
        };
      } else {
        Dialog.alert({
          message: res.msg,
          confirmButtonText: this.$t("App.alert_confirm"),
        });
      }
    },
    // 获取默认卡信息
    async getCardDefault() {
      let res = await this.$post("/getCardDefault", {
        touristId: this.touristId,
        orgId: this.orgId,
      });
      if (res.code == "success") {
        this.orderInfo.cardInfo = {
          cardNo: res.data.cardNo,
          bankName: res.data.bankName,
          bankImg: res.data.bankImg,
          bankLogoView: res.data.bankLogoView,
          cardId: res.data.cardId,
        };
      } else {
        Dialog.alert({
          message: res.msg,
          confirmButtonText: this.$t("App.alert_confirm"),
        });
      }
    },
    toAddSpace(val) {
      if (val) {
        return addSpace(val);
      }
    },
    openBarCode() {
      this.bar_code_big = true;
      this.$nextTick(() => {
        document.getElementById("barcode_big").src =
          document.getElementById("barcode").src;
      });
    },
    openQrCode() {
      this.qr_code_big = true;
      this.$nextTick(() => {
        const canvas = this.$refs.qrcodeCanvas_big;
        QRCode.toCanvas(canvas, this.orderId, {
          errorCorrectionLevel: "H",
          margin: 2,
          color: { light: "#F6F6F6" },
          width: 320,
        });
      });
    },
    closeBigQrCode() {
      this.qr_code_big = false;
      this.bar_code_big = false;
    },
    revokeGuarantee() {
      Dialog.confirm({
        title: "警告",
        message: "撤销担保后无法完成退税服务，是否继续？",
        confirmButtonText: this.$t("App.dialog_confirm"),
        cancelButtonText: this.$t("App.dialog_cancel"),
      })
        .then(() => {
          this.$post("/cashTaxRevokeGuanrantee", {
            orderId: this.orderId,
          }).then((response) => {
            if (response.code == "success") {
              this.setTaxRefundType("");
              this.setPage("Passport,BankCard");
              this.$router.push({ path: "/Passport" });
            } else {
              Dialog.alert({
                message: response.msg,
                confirmButtonText: this.$t("App.alert_confirm"),
              });
            }
          });
        })
        .catch(() => {
          // on cancel
        });
    },
    goPassport() {
      clearTimeout(this.goPassportTime);
      this.setTaxRefundType("");
      this.setPage("Passport,BankCard");
      localStorage.setItem("noticeContent", "");
      this.$router.push({
        path: `/Passport`,
        query: {
          touristId: this.touristId,
          counterId: this.$store.state.counterId,
          pageType: "3",
        },
      });
    },
  },
  created() {
    this.getUserInfo();
    this.getCardDefault();
    // if (this.voucherList.length == 0 && this.invoiceList.length == 0) {
    //   this.$store.commit("setPage", "Passport,BankCard,Receipt,Sign");
    // }
    // this.getTaxOrderListFromRedis("order");
  },
  mounted() {
    switch (localStorage.getItem("noticeContent")) {
      case "1":
        this.show = true;
        break;
      case "2":
        break;
      case "3":
        this.show = true;
        this.isRevoke = true;
        this.goPassportTime = setTimeout(() => {
          this.goPassport();
        }, 3000);
        break;
      default:
        break;
    }
    this.webSocket = new WebSocketService(this.orderId, (json) => {
      if (json.noticeContent === "1") {
        localStorage.setItem("noticeContent", "1");
        if (json.outId === this.orderId && this.$route.name === "CashQrcode") {
          this.show = true;
          json.code = 200;
          this.webSocket.sendMessage(JSON.stringify(json));
        }
      } else if (
        json.noticeContent === "2" &&
        this.$route.name === "CashQrcode"
      ) {
        localStorage.setItem("noticeContent", "");
        if (json.outId === this.orderId) {
          this.$router.replace({
            path: "/Accept",
            query: {
              orderId: this.orderId,
            },
          });
          json.code = 200;
          this.webSocket.sendMessage(JSON.stringify(json));
        }
      } else if (json.noticeContent === "3") {
        localStorage.setItem("noticeContent", "3");
        json.code = 200;
        this.webSocket.sendMessage(JSON.stringify(json));
        this.isRevoke = true;
        this.goPassportTime = setTimeout(() => {
          this.goPassport();
        }, 3000);
      }
    });
    this.webSocket.connect();

    JsBarcode("#barcode", this.orderId, {
      height: 70,
      format: "CODE128", // 选择要使用的条形码类型
      text: this.orderId,
      displayValue: true, // 是否在条形码下方显示文字
      textPosition: "bottom", // 设置文本的垂直位置
      background: "#F6F6F6",
      // fontOptions: "font-size: 14px",
    });
    const canvas = this.$refs.qrcodeCanvas;
    QRCode.toCanvas(
      canvas,
      this.orderId,
      { errorCorrectionLevel: "H", margin: 2, color: { light: "#F6F6F6" } },
      function (error) {
        if (error) console.error(error);
        console.log("success!");
      }
    );
  },
  beforeDestroy() {
    this.webSocket.close();
  },
};
</script>
