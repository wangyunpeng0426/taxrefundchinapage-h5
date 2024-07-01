<template>
  <div class="page">
    <div class="accept">
      <div class="content">
        <div class="content-top">
          <div class="content-icon">
            <img src="../assets/image/accept.png" />
          </div>
          <p class="content-text">{{ $t("OrderList.accepted") }}</p>
          <p
            class="content-textbutom"
            v-if="taxSubsidyOrderMoney"
            style="color: #d9001b; padding: 0 23px"
          >
            {{ $t("Accept.activity_amount_before") }}{{ taxSubsidyOrderMoney
            }}{{ $t("Accept.activity_amount_after") }}
          </p>
          <p
            class="content-textbutom"
            v-if="Amouttwo"
            style="color: #d9001b; padding: 0 23px"
          >
            {{ $t("Accept.time_receipt") }}
          </p>
          <p
            class="content-textbutom"
            v-if="taxRefundType === 'Cash'"
            style="color: #d9001b; padding: 0 23px"
          >
            * 您的税金已通过现金发放成功
          </p>
        </div>
        <div class="content-divider">
          <img src="../assets/image/divider.png" />
        </div>
        <div class="content-middle">
          <div class="block">
            <p class="block-title">{{ $t("Accept.accepted_time") }}</p>
            <p class="block-text">{{ submitTime }}</p>
          </div>
          <div class="block">
            <p class="block-title">{{ $t("Accept.accepted_location") }}</p>
            <p class="block-text">
              {{ counterName }}
            </p>
          </div>
          <div class="notice" v-if="taxRefundType === 'Cash'">
            <p class="notice-title">{{ $t("Accept.notice") }}</p>
            <p class="notice-text">
              请妥善保管好您的税单和购物发票，切勿丢失。
              <br />
              您的税单在您离境的时候务必让海关对您的税单进行审查并盖章。
              <br />
              请务必在您离境的机场海关，将纸质税单投递到退税指定信箱中，我们将在5~10个工作日内回收税单。如在发放退税金后的30个工作日内仍未收到您的纸质税单，我们将依照协议从您的银行卡中追缴已发放的税金。详细的退税进度，我们会按照您预留的联系方式进行通知。
            </p>
          </div>
          <div class="notice" v-else>
            <p class="notice-title">{{ $t("Accept.notice") }}</p>
            <p class="notice-text">
              {{ $t("Accept.notice_text_1") }}
              <br />
              {{ $t("Accept.notice_bold_1") }}
              <br />
              <span v-html="$t('Accept.notice_bold_1_subsidy')"></span>
              <!-- 请务必在您离境的机场海关，将纸质税单投递到机场顺丰快递，快递以到付方式邮寄到<span style="color:red; fontWeight:bold">辽宁省沈阳市沈河区中山路355号高登大厦18层辽宁退税数据中心收</span>。我们将在5~10个工作日内回收税单。如在发放退税金后的30个工作日内仍未收到您的纸质税单，我们将依照协议从您的银行卡中追缴已发放的税金。详细的退税进度，我们会按照您预留的联系方式进行通知。 -->
              {{ $t("Accept.notice_text_2") }}
            </p>
          </div>
          <div class="btn-group-follow">
            <div class="logo-icbc">
              <orgLogo></orgLogo>
            </div>
            <div class="btn-group">
              <div class="btn btn-m" @click="toJump('Order')">
                <span>{{ $t("Accept.order") }}</span>
              </div>
              <div class="btn btn-m" @click="toJump('BankCard')">
                <span>{{ $t("Accept.next_refund") }}</span>
              </div>
            </div>
          </div>
          <div style="clear: both"></div>
        </div>
        <div class="content-bottom">{{ $t("Accept.thankyou") }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatTime } from "../utils/tools";
import orgLogo from "@/components/orgLogo.vue";
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "Accept",
  components: {
    orgLogo,
  },
  data() {
    return {
      orderId: this.$route.query.orderId,
      counterName: "", // 退税点
      submitTime: "", // 时间
      orderStatus: "", // 订单状态
      taxSubsidyOrderMoney: 0,
      Amouttwo: false,
    };
  },
  computed: {
    ...mapGetters(["taxRefundType"]),
  },
  mounted() {
    this.getTaxOrderInfo();
  },
  methods: {
  ...mapMutations([
      "setTaxRefundType",
      "setPage"
    ]),
    getTaxOrderInfo() {
      let data = {
        orderId: this.orderId,
      };
      this.$post("/getTaxOrderInfo", data).then((response) => {
        if (response.code == "success") {
          this.counterName = response.data.counterName;
          this.submitTime = formatTime(response.data.submitTime);
          this.orderStatus = response.data.orderStatus;
          this.taxSubsidyOrderMoney = response.data.taxSubsidyOrderMoney || 0;
          let pctInfoType = response.data.order?.pctInfoType ?? "";

          if (
            pctInfoType == undefined ||
            pctInfoType == null ||
            pctInfoType == "" ||
            pctInfoType == "0"
          ) {
            this.Amouttwo = false;
          } else {
            this.Amouttwo = true;
          }
        }
      });
    },
    // 点击跳转事件
    toJump(name) {
      if (name == "BankCard") {
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
        // this.$router.push({
        //   path: `/BankCard`,
        //   query: {
        //     pageType: 3,
        //   },
        // });
      } else {
        this.$router.push({
          path: `/Order`,
          query: {
            pageType: 1,
            orderId: this.$route.query.orderId,
          },
        });
      }
    },
  },
};
</script>
