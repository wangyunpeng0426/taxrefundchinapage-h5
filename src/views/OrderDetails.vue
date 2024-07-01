<template>
  <div class="page">
    <div :class="order_class">
      <div class="content">
        <div class="content-top">
          <div class="content-info">
            <p class="info-num">
              {{
                orderInfo.taxSumAmount
                  ? `${orderInfo.taxSumCur}${$toFixed2(orderInfo.taxSumAmount)}`
                  : "--"
              }}
            </p>
            <p class="info-text">{{ $t("Order.total") }}</p>
          </div>
        </div>
        <div class="content-bottom">
          <div class="block-1">
            <van-cell-group class="card">
              <van-cell>
                <template #title>
                  <div class="title">
                    <div class="title-left">
                      <img :src="orderInfo.issueLogoView" />
                    </div>
                    <div class="title-right">
                      <div class="title-right-top">
                        <span class="card-type">
                          {{ orderInfo.bankName }}
                          {{
                            orderInfo.bankCardType == "1"
                              ? $t("BankCard.credit_card")
                              : $t("BankCard.debit_card")
                          }}
                        </span>
                      </div>
                      <div class="title-right-bottom">
                        {{ toAddSpace(orderInfo.cardNo) }}
                      </div>
                    </div>
                  </div>
                  <van-divider />
                </template>
                <template #label>
                  <div class="label">
                    <p class="info-address">
                      <van-icon name="location" />{{ orderInfo.counterName }}
                    </p>
                  </div>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
          <div
            class="block-2"
            v-for="item in orderDetailList"
            :key="item.detailId"
          >
            <p class="block-title">{{ toTaxStatus(item.taxStatus) }}</p>
            <van-cell-group class="card">
              <van-cell>
                <template #title>
                  <div class="title">
                    <div class="card-tip">
                      {{ $t("Order.ordernumber") }}
                      <span class="font-black">{{ item.taxNum }}</span>
                    </div>
                    <div class="card-group">
                      <div class="card-tip">
                        <p>{{ $t("Order.application") }}</p>
                        <p class="font-black font-3">
                          {{
                            item.taxAmount
                              ? `${item.currency} ${$toFixed2(item.taxAmount)}`
                              : "--"
                          }}
                        </p>
                      </div>
                      <div class="card-tip">
                        <p>{{ $t("Order.actual") }}</p>
                        <p class="font-black font-3">
                          {{ item.currency }}
                          {{
                            $toFixed2(
                              $toFixed2(item.taxAmount) - $toFixed2(item.taxFee)
                            )
                          }}
                        </p>
                      </div>
                    </div>
                    <div class="card-group">
                      <div class="card-tip">
                        <p>{{ $t("Order.handing") }}</p>
                        <p class="font-black font-3">
                          {{
                            item.taxFee
                              ? `${item.currency} ${$toFixed2(item.taxFee)}`
                              : "--"
                          }}
                        </p>
                      </div>
                      <div class="card-tip" v-show="item.unqualifiedAmount">
                        <p class="font-red">{{ $t("Order.incorrect") }}</p>
                        <p class="font-black font-3">
                          {{
                            item.unqualifiedAmount
                              ? `${item.currency} ${$toFixed2(
                                  item.unqualifiedAmount
                                )}`
                              : "--"
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Dialog } from "vant";
import { addSpace } from "@/utils/tools";

export default {
  name: "OrderDetails",
  components: {},
  data() {
    return {
      touristId: this.$route.query.touristId || this.$store.state.touristId,
      orderId: this.$route.query.orderId,
      orderInfo: {},
      orderDetailList: [],
      order_class: "order", // 适配移动端和pc端的样式
    };
  },
  watch: {},
  mounted() {
    document.getElementById("elf").style.display = "none";
    if (this._isMobile()) {
      // 移动端样式
      this.$nextTick(() => {
        this.order_class = "order";
      });
    } else {
      // pc端样式
      this.$nextTick(() => {
        this.order_class = "orderp";
      });
    }
    this.getUserInfo();
    this.getTaxOrderDetailList();
  },
  methods: {
    // 获取用户语种
    getUserInfo() {
      let data = {
        touristId: this.$route.query.touristId,
      };
      this.$post("/getUserInfo", data).then((response) => {
        if (response.code == "success") {
          this.getLabel(response.data.language);
        }
      });
    },
    // 获取语言相关文字
    getLabel(radio) {
      let lang = "";
      this.$get("/getLanList", {}).then((response) => {
        if (response.code == "success") {
          let langList = response.data;
          for (let i = 0; i < langList.length; i++) {
            if (radio == langList[i].dictCode) {
              lang = langList[i].remark;
            }
          }
        }
        let data = {
          language: radio,
        };
        this.$post("/tag/getTagList", data).then((response) => {
          if (response.code == "success") {
            this.$store.commit("setTag", "");
            this.$store.commit("setTag", response.data); // 缓存 - 标签内容
            this.$i18n.locale = lang;
            this.$i18n.setLocaleMessage(`${lang}`, this.$store.state.tag);
          }
        });
      });
    },
    // 获取订单详情
    getTaxOrderDetailList() {
      let data = {
        orderId: this.orderId,
        touristId: this.touristId,
      };
      this.$post("/getTaxOrderDetailList", data).then((response) => {
        if (response.code == "success") {
          this.orderDetailList = response.data.detaiList;
          this.orderInfo = response.data.sum;
        } else {
          Dialog.alert({
            message: response.msg,
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            // on close
          });
        }
      });
    },
    // 银行卡号格式化
    toAddSpace(val) {
      return addSpace(val);
    },
    // 税单状态格式化
    toTaxStatus(val) {
      // 税单状态
      // 税金待发放：A0：处理中，A2：垫付失败
      // 税金已发放：A1：已垫付，B2：追缴失败
      // 税金已撤销：B1：税金撤回
      // 税单状态：（税金待发放、税金已发放、税金已追缴）
      // (Tax refund pending release, tax refund paid, tax refund recovered )
      switch (val) {
        case "A0" || "A2":
          return this.$t("Order.pending"); // "税金待发放"; // Tax refund pending release
        case "A1" || "B2":
          return this.$t("Order.paid"); // "税金已发放"; // tax refund paid
        case "B1":
          return this.$t("Order.recovered"); // "税金已撤销"; // tax refund recovered
        default:
          return this.$t("Order.pending"); // Tax refund pending release
      }
    },
    // 判断设备状态
    _isMobile() {
      let flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
      return flag;
    },
  },
};
</script>
