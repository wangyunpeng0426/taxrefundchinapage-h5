<template>
  <div class="content-3">
    <div class="content-top">
      <hearderBlock />
      <div class="content-info">
        <p class="info-name">{{ orderInfo.userInfo.userNameEn }}</p>
        <p class="info-num">{{ orderInfo.userInfo.idHideNo }}</p>
        <p class="info-address">
          <van-icon name="location" />{{ orderInfo.userInfo.merchantNameCn }}
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
      <div class="block-2">
        <p class="block-title">
          {{ $t("Receipt.info_refund") }}（{{ voucherList.length || 0 }}）
        </p>
        <van-cell-group class="card">
          <van-cell>
            <template #title>
              <div class="title">
                <van-collapse v-model="activeVoucher" accordion>
                  <van-collapse-item class="card-tip" name="1">
                    <template #title>
                      <div class="card-tip">
                        {{ $t("Receipt.voucher_total") }}
                      </div>
                      <div class="money-num">
                        {{
                          voucherTotal ? `¥${$toFixed2(voucherTotal)}` : "--"
                        }}
                      </div>
                    </template>
                    <div
                      class="card-row"
                      v-for="item in voucherList"
                      :key="item.voucherId"
                    >
                      <p>{{ $t("Receipt.info_refund_orderno") }}</p>
                      <p class="font-black">{{ item.taxNo }}</p>
                      <p>{{ $t("Receipt.info_refund_amount") }}</p>
                      <p class="font-black sum">
                        {{
                          item.applyTaxSum
                            ? `¥${toCut(
                                $toFixed2(item.applyTaxSum) -
                                  $toFixed2(item.taxFeeSum)
                              )}`
                            : "--"
                        }}
                      </p>
                    </div>
                  </van-collapse-item>
                </van-collapse>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      <div class="block-3">
        <p class="block-title">
          {{ $t("Receipt.info_shopping") }}（{{ invoiceList.length || 0 }}）
        </p>
        <van-cell-group class="card">
          <van-cell>
            <template #title>
              <div class="title">
                <van-collapse v-model="activeInvoice" accordion>
                  <van-collapse-item class="card-tip" name="1">
                    <template #title>
                      <div class="card-tip">
                        {{ $t("Receipt.invoice_total") }}
                      </div>
                      <div class="money-num">
                        {{
                          invoiceTotal ? `¥${$toFixed2(invoiceTotal)}` : "--"
                        }}
                      </div>
                    </template>
                    <div
                      class="card-row"
                      v-for="item in invoiceList"
                      :key="item.invoiceId"
                    >
                      <p>
                        {{ $t("Receipt.info_shopping_invoiceno") }}
                      </p>
                      <p class="font-black">{{ item.invoiceNo }}</p>
                      <p>{{ $t("Receipt.info_shopping_sum") }}</p>
                      <p class="font-black sum">
                        {{
                          item.taxPriceSum
                            ? `¥${$toFixed2(item.taxPriceSum)}`
                            : "--"
                        }}
                      </p>
                    </div>
                  </van-collapse-item>
                </van-collapse>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      <div class="btn-group-follow">
        <div class="logo-icbc">
          <orgLogo></orgLogo>
        </div>
        <div class="btn-group">
          <div class="btn btn-m" @click="toLast">
            <span>{{ $t("Receipt.btn_prev") }}</span>
          </div>
          <div class="btn btn-m" @click="toSign">
            <span>{{ $t("Receipt.btn_next") }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Dialog } from "vant";
import { addSpace } from "@/utils/tools";
import { mapGetters } from "vuex";
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
    };
  },
  computed: {
    ...mapGetters(["touristId", "orgId"]),
  },
  methods: {
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
          if (this.voucherList.length == 0 || this.invoiceList.length == 0 || this.voucherList.length !== this.invoiceList.length) {
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
        orgId: this.orgId
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
    // 截取两位小数 四舍五入
    toCut(val) {
      if (val && val != "0") {
        return Math.round(Number(val) * 100) / 100;
      } else {
        return 0;
      }
    },
    toSign() {
      this.$router.push({
        path: "/Sign",
        query: {
          touristId: this.touristId,
          cardId: this.orderInfo.cardInfo.cardId,
        },
      });
    },
    toLast() {
      this.$emit("toInvoice");
    },
  },
  created() {
    this.getUserInfo();
    this.getCardDefault();
    if (this.voucherList.length == 0 && this.invoiceList.length == 0) {
      this.$store.commit("setPage", "Passport,BankCard,Receipt,Sign");
    }
    this.getTaxOrderListFromRedis("order");
  },
};
</script>
