<template>
  <div class="header">
    <div class="step" @click="toJump('Passport')">
      <div id="Passport" ref="Passport" class="step-block select-before">
        <img src="../assets/image/passport.png" />
      </div>
      <span>{{ $t("Sign.header_passport") }}</span>
    </div>
    <div class="point">
      <img src="../assets/image/point.png" />
    </div>
    <div class="step" @click="toJump('BankCard')">
      <div id="BankCard" ref="BankCard" class="step-block">
        <img src="../assets/image/card.png" />
      </div>
      <span>{{ $t("Sign.header_bankcard") }}</span>
    </div>
    <div class="point">
      <img src="../assets/image/point.png" />
    </div>
    <div class="step" @click="toJump(taxRefundType === 'Cash' ? 'ReceiptCash' : 'Receipt')">
      <div id="Receipt" ref="Receipt" class="step-block">
        <img class="img-receipt" src="../assets/image/receipt.png" />
      </div>
      <span style="position: absolute; top: 1.55rem">{{
        $t("Sign.header_receipt")
      }}</span>
    </div>
    <div class="point">
      <img src="../assets/image/point.png" />
    </div>
    <div class="step" @click="toJump('Sign')">
      <div id="Sign" ref="Sign" class="step-block">
        <img class="img-sign" src="../assets/image/sign.png" />
      </div>
      <span>{{ $t("Sign.header_sign") }}</span>
    </div>
  </div>
</template>
<script>
import { Dialog } from "vant";
import { mapGetters } from "vuex";
export default {
  name: "hearderBlock",
  data() {
    return {
      pathName: this.$route.name,
      // touristId: this.$route.query.touristId || this.$store.state.touristId,
      language: this.$i18n.local || "",
    };
  },
  computed: {
    ...mapGetters([
      "touristId",
      "counterTypes",
      "passPortType",
      "dateOfEntry",
      "entrySealUrl",
      "exitSealUrl",
      "cardId",
      "page",
      "orgId",
      "taxRefundType",
    ]),
  },
  watch: {
    // 控制语种
    "$i18n.locale"(val) {
      this.language = val;
    },
    "$route.name"() {
      this.handleClass();
    },
    page() {
      this.handleClass();
    },
  },
  mounted() {
    this.handleClass();
  },
  methods: {
    // 点击菜单跳转事件
    toJump(name) {
      if (this.pathName != name && this.touristId) {
        // 当前页点自己不可以跳转
        let data = {
          touristId: this.touristId,
          orgId: this.orgId,
        };
        this.$postNoLoading("/stepsCondition", data).then((response) => {
          if (response.code == "success") {
            let bindingCardState = response.data.bindingCardState;
            if (name == "Passport") {
              // 如果从其他页点护照页 都可以点 显示不可编辑信息页3 (上传页1)
              this.$router.push({
                path: `/${name}`,
                query: {
                  touristId: this.$route.query.touristId,
                  pageType: "3",
                },
              });
            } else if (name == "BankCard") {
              if (this.pathName == "Passport") {
                //护照
                if (this.passPortType === "29") {
                  if (!this.entrySealUrl) {
                    return;
                  }
                  if (this.counterTypes === "1" && !this.exitSealUrl) {
                    return;
                  }
                } else {
                  if (!this.dateOfEntry) {
                    return;
                  }
                }
                this.$router.push({
                  path: `/${name}`,
                  query: {
                    touristId: this.touristId,
                    pageType: "3",
                  },
                });
              }
              if (this.pathName == "Receipt" || this.pathName == "ReceiptCash" || this.pathName == "Sign") {
                this.$router.push({
                  path: `/${name}`,
                  query: {
                    touristId: this.touristId,
                    pageType: "3",
                  },
                });
              }
            } else if (name == "Receipt") {
              if (this.cardId) {
                this.$router.push({
                  path: "/Receipt",
                  query: {
                    touristId: this.touristId,
                  },
                });
              } else {
                if (this.pathName == "BankCard") {
                  Dialog.alert({
                    message: this.$t("BankCard.choose_one_card"),
                    confirmButtonText: this.$t("App.alert_confirm"),
                  });
                  return;
                }
                if (this.pathName == "Passport") {
                  return;
                }
              }
            } else if (name == "ReceiptCash") {
              if (this.cardId) {
                this.$router.push({
                  path: "/ReceiptCash",
                  query: {
                    touristId: this.touristId,
                  },
                });
              } else {
                if (this.pathName == "BankCard") {
                  Dialog.alert({
                    message: this.$t("BankCard.choose_one_card"),
                    confirmButtonText: this.$t("App.alert_confirm"),
                  });
                  return;
                }
                if (this.pathName == "Passport") {
                  return;
                }
              }
            } else if (name == "Sign") {
              if (this.$refs[name].className == "step-block select-before") {
                this.$router.push({
                  path: `/${name}`,
                });
              }
            }
          }
        });
      }
    },
    // 控制菜单图标状态
    handleClass() {
      // 证件页默认亮
      if (this.$route.name == "Passport") {
        this.$refs["Passport"].className = "step-block select";
      } else {
        this.$refs["Passport"].className = "step-block select-before";
      }

      let pageList = ["Passport", "BankCard", "Receipt", "Sign"];

      for (let i = 0; i < pageList.length; i++) {
        if (this.$route.name == pageList[i] || this.$route.name.includes(pageList[i])) {
          this.$nextTick(() => {
            this.$refs[pageList[i]].className = "step-block select";
          });
        } else {
          if (this.$refs[pageList[i]].className == "step-block select") {
            this.$nextTick(() => {
              this.$refs[pageList[i]].className =
                "step-block select-before";
            });
          }
        }
      }

      let page = "";
      if (this.$store.state.page) {
        page = this.$store.state.page;
        pageList.forEach((item) => {
          if (page.includes(item)) {
            this.$refs[item].className = "step-block select-before";
          } else {
            this.$refs[item].className = "step-block";
          }
        });
      } else {
        return;
      }
    },
  },
};
</script>
