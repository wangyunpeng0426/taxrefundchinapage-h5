<template>
  <div class="page">
    <div class="orderInfo">
      <div class="content">
        <div class="content-top">
          <div class="content-info">
            <div class="left">
              <p class="num">
                {{ taxSumAmt ? `¥${$toFixed2(taxSumAmt)}` : "¥0.00" }}
              </p>
              <p>{{ $t("OrderInfo.total") }}</p>
            </div>
          </div>
        </div>
        <div class="content-bottom">
          <van-cell-group class="card" @click="toJump('OrderList')">
            <van-cell>
              <template #title>
                <div class="title">
                  <div class="title-left">
                    <div class="step-block">
                      <img
                        class="img-receipt"
                        src="../assets/image/accept.png"
                      />
                    </div>
                  </div>
                  <div class="title-right">
                    <span class="card-type">
                      {{ $t("OrderInfo.accept") }}
                    </span>
                  </div>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
          <van-cell-group class="card" @click="toJump('Passport', 3)">
            <van-cell>
              <template #title>
                <div class="title">
                  <div class="title-left">
                    <div class="step-block">
                      <img src="../assets/image/passport.png" />
                    </div>
                  </div>
                  <div class="title-right">
                    <span class="card-type">
                      {{ $t("OrderInfo.information") }}
                    </span>
                  </div>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
          <van-cell-group class="card" @click="toJump('BankCard', 3)">
            <van-cell>
              <template #title>
                <div class="title">
                  <div class="title-left">
                    <div class="step-block">
                      <img src="../assets/image/card-11.png" />
                    </div>
                  </div>
                  <div class="title-right">
                    <span class="card-type">
                      {{ $t("OrderInfo.link") }}
                    </span>
                  </div>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
          <van-cell-group class="card" @click="toJump('Contact')">
            <van-cell>
              <template #title>
                <div class="title">
                  <div class="title-left">
                    <div class="step-block">
                      <img src="../assets/image/tel&email.png" />
                    </div>
                  </div>
                  <div class="title-right">
                    <span class="card-type">
                      {{ $t("OrderInfo.mailphone") }}
                    </span>
                  </div>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
        <div class="btn-group-bottom">
          <div class="logo-icbc">
            <orgLogo></orgLogo>
          </div>
          <div class="btn-group">
            <div class="btn" @click="toJump('Receipt', 1)">
              <span>{{ $t("OrderInfo.journey") }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Dialog } from "vant";
import orgLogo from "@/components/orgLogo.vue";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "OrderInfo",
  components: { orgLogo },
  data() {
    return {
      touristId: this.$route.query.touristId || this.$store.state.touristId,
      taxSumAmt: 0, // 总退税额
    };
  },
  computed: {
    ...mapGetters(["orgId"]),
  },
  mounted() {
    this.getUserTaxCounts();
  },
  methods: {
    ...mapMutations(["setTaxRefundType"]),
    // 获取当前用户使用时间及次数
    getUserTaxCounts() {
      let data = {
        touristId: this.touristId,
      };
      this.$post("/getUserTaxCounts", data).then((response) => {
        if (response.code == "success") {
          this.taxSumAmt = response.data.taxSumAmt;
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
    // 点击跳转事件
    toJump(name, pageType) {
      if (this.pathName != name) {
        if (name == "Receipt") {
          let data = {
            touristId: this.touristId,
            orgId: this.orgId,
          };
          this.$post("/stepsCondition", data).then((response) => {
            if (response.code == "success") {
              // 2021 09 10 绑不绑卡暂时都调到用户页
              this.setTaxRefundType("");
              this.$router.push({
                path: `/Passport`,
                query: {
                  touristId: this.touristId,
                  counterId: this.$store.state.counterId,
                  pageType: "3",
                },
              });
            }
          });
        } else {
          this.$router.push({
            path: `/${name}`,
            query: {
              touristId: this.touristId,
              pageType: pageType,
              head: "no",
            },
          });
        }
      }
    },
    // 返回上一页
    toBack() {
      this.$router.go(-1);
    },
  },
};
</script>
