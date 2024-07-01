<template>
  <div class="content-3">
    <div class="content-top">
      <div class="btn-group mt-5 plr-25">
        <div class="btn ghost" @click="toAddCard">
          <span>{{ $t("BankCard.btn_add_card") }}</span>
        </div>
      </div>
    </div>
    <div class="content-bottom">
      <div class="card-list mt-5 mb-5">
        <van-radio-group v-model="radio">
          <van-cell-group
            class="card"
            v-for="item in cardList"
            :key="item.cardId"
            :class="
              radio == item.cardId && !isNotDete(item) && head
                ? 'select-border'
                : 'border'
            "
          >
            <!-- <van-cell
              clickable
              @click="!head ? '' : setCardDefault(item.cardId, item)"
              :class="item.cantSelect ? 'font-gray' : ''"
              :style="
                isNotDete(item) || isNot(item.issueOrgCode) || (partnerSourceId && item.supportStatus === '0')
                  ? 'color:#b5b5b5 !important;'
                  : ''
              "
            > -->
            <van-cell
              clickable
              @click="!head ? '' : setCardDefault(item.cardId, item)"
              :class="item.cantSelect ? 'font-gray' : ''"
              :style="
                isNotDete(item) ||
                isNot(item.issueOrgCode) ||
                (partnerSourceId && item.supportStatus === '0')
                  ? 'color:#b5b5b5 !important;'
                  : ''
              "
            >
              <template #title>
                <div class="title">
                  <div class="title-left">
                    <img :src="item.bankImgView" />
                  </div>
                  <div class="title-right">
                    <div class="title-right-top">
                      <span class="card-type">
                        {{ item.bankName }}
                        {{
                          item.bankCardType == "1"
                            ? $t("BankCard.credit_card")
                            : $t("BankCard.debit_card")
                        }}
                      </span>
                    </div>
                    <div class="title-right-bottom">
                      {{ toAddSpace(item.cardNo) }}
                    </div>
                  </div>
                </div>
                <van-divider />
              </template>
              <template #label>
                <div
                  class="balance"
                  style="display: flex"
                  v-if="
                    (item.bankCardType === '1' ||
                      item.issueOrgCode === 'VISA') &&
                    taxRefundType !== 'Cash'
                  "
                >
                  <div class="balance_label">
                    {{ $t("BankCard.Collection") }}
                  </div>
                  <div class="balance_number">
                    ¥ {{ Number(item.cardLimit || 0).toFixed(2) }}
                  </div>
                </div>
                <div class="label">
                  <div
                    class="card-unlink"
                    style="display: flex; align-items: center; width: 100%"
                  >
                    <div
                      style="display: flex; align-items: center"
                      @click.stop="handleUnlink(item.cardId)"
                    >
                      <img src="@/assets/image/link.png" />
                      <div>{{ $t("BankCard.btn_unlink") }}</div>
                    </div>

                    <div
                      style="flex: 1"
                      v-if="
                        (item.bankCardType == 0 &&
                          item.issueOrgCode == 'CHINA UNIONPAY') ||
                        taxRefundType === 'Cash'
                      "
                    ></div>
                    <div style="flex: 1; text-align: end" v-else>
                      <span v-if="item.fastMode == 1">{{
                        $t("BankCard.ListCreditedImmediately")
                      }}</span>
                      <span v-else>{{ $t("BankCard.ListWithinTowDays") }}</span>
                    </div>
                    <!-- <span>
                      <img src="@/assets/image/link.png" />
                      {{ $t("BankCard.btn_unlink") }}</span
                    >
                    <span
                      v-if="
                        item.bankCardType == 0 &&
                        item.issueOrgCode == 'CHINA UNIONPAY'
                      "
                    >
                    </span>
                    <span v-else>
                      <span v-if="item.fastMode == 1">{{
                        $t("BankCard.ListCreditedImmediately")
                      }}</span>
                      <span v-else>{{ $t("BankCard.ListWithinTowDays") }}</span>
                    </span> -->
                  </div>
                </div>
              </template>
              <!-- <template #right-icon>
                    <van-radio
                      :name="item.cardId"
                      :class="item.cantSelect ? 'border-gray' : ''"
                      :disabled="item.cantSelect"
                    />
                  </template> -->
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>
      <!-- 有银行卡时 按钮跟随卡列表 没有银行卡时 置底 -->
      <!-- 20210906 有2张以上银行卡时 按钮跟随卡列表 没有银行卡时 置底 -->
      <div
        :class="cardList.length > 2 ? 'btn-group-follow' : 'btn-group-bottom'"
      >
        <div class="logo-icbc">
          <orgLogo></orgLogo>
        </div>
        <div class="btn-group plr-25" v-if="!head">
          <div class="btn" @click="toBack">
            <span>{{ $t("BankCard.btn_back") }}</span>
          </div>
        </div>
        <div class="btn-group plr-25" v-else>
          <div class="btn btn-m" @click="toBack">
            <span>{{ $t("BankCard.btn_back") }}</span>
          </div>
          <div class="btn btn-m" @click="toReceipt">
            <span>{{ $t("BankCard.btn_next") }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { Dialog } from "vant";
import { RSA } from "@/utils/RSA";
import { addSpace } from "@/utils/tools";
export default {
  props: {
    head: {
      type: Boolean,
      default: false,
    },
    // issueLogoList: {
    //   type: Array,
    //   default: () => [],
    // },
  },
  data() {
    return {
      radio: "", // 选中卡
      cardList: [], // 卡列表
    };
  },
  computed: {
    ...mapGetters([
      "touristId",
      "cardId",
      "counterTypes",
      "orgId",
      "partnerSourceId",
      "issueLogoList",
      "taxRefundType",
    ]),
  },
  methods: {
    dialogInfoOpen(msg) {
      Dialog.alert({
        message: msg,
        confirmButtonText: this.$t("App.alert_confirm"),
      });
    },
    getBankCardList() {
      this.$post("/getBankCardList", {
        touristId: this.touristId,
        orgId: this.orgId,
        partnerSourceId: this.partnerSourceId,
      }).then((res) => {
        if (res.code == "success") {
          this.cardList = res.data.cardList;
          let node = this.cardList.find((item) => item.cardId === this.cardId);
          if (
            node &&
            !this.isNotDete(node) &&
            !this.isNot(node.issueOrgCode) &&
            (!this.partnerSourceId ||
              (this.partnerSourceId && node.supportStatus !== "0"))
          ) {
            this.radio = this.cardId;
          }
          // 判断有没有默认卡
          if (!this.radio) {
            this.$nextTick(() => {
              document.getElementById("Receipt").className = "step-block";
              document.getElementById("Sign").className = "step-block";
            });
            // this.$store.commit("setPage", "Passport,BankCard");
          }
        } else {
          this.dialogInfoOpen(res.msg);
        }
      });
    },
    isNotDete(item) {
      // 现金退税时，不可选中储蓄卡
      if (this.taxRefundType === "Cash" && item.bankCardType === "0") {
        return true;
      }
      //1、机场 0、市区
      if (this.counterTypes == 0) {
        //银联储蓄卡（借记卡）不做过期判断
        if (item.bankCardType == 0 && item.issueOrgCode == "CHINA UNIONPAY") {
          return true;
        }
      }
      if (!item.termValidity) {
        return false;
      }
      let arr = RSA(item.termValidity, "PR").split("/");
      arr[1] = "20" + arr[1];
      //获取相差年份转换成月
      let Month =
        arr[1] - new Date().getFullYear() > 0
          ? (arr[1] - new Date().getFullYear()) * 12 + Number.parseInt(arr[0])
          : Number.parseInt(arr[0]);
      //返回月份减当前月份相差超过六个月（按当前月份+1算）
      if (Month - (new Date().getMonth() + 1) < 7) {
        return true;
      }
      if (item.supportStatus == "0") {
        return true;
      }
      return false;
    },
    isNot(issueOrgCode) {
      if (
        !this.issueLogoList.map((item) => item.issueName).includes(issueOrgCode)
      ) {
        return true;
      } else {
        return false;
      }
    },
    toReceipt() {
      this.cardList.forEach((item) => {
        //（市区店  储蓄卡  银联）或者 有效期过了  或者  退税点不一致了 不能绑卡
        if (
          ((this.counterTypes == 0 &&
            item.bankCardType == 0 &&
            item.issueOrgCode == "CHINA UNIONPAY") ||
            this.isNotDete(item) ||
            this.isNot(item.issueOrgCode)) &&
          item.cardId == this.radio
        ) {
          this.radio = "";
        }
      });

      if (this.radio) {
        let path = "/Receipt";
        if (this.taxRefundType === "Cash") {
          path = "/ReceiptCash";
        }
        this.$router.push({
          path: path,
          query: {
            touristId: this.touristId,
          },
        });
      } else {
        Dialog.alert({
          message: this.$t("BankCard.choose_one_card"),
          // message: "请选择一张卡",
          confirmButtonText: this.$t("App.alert_confirm"),
        }).then(() => {
          // on close
        });
      }
    },
    toBack() {
      this.$router.go(-1);
    },
    toAddSpace(val) {
      if (val) {
        return addSpace(val);
      }
    },
    handleUnlink(cardId) {
      Dialog.confirm({
        message: this.$t("BankCard.dialog_message"),
        confirmButtonText: this.$t("App.dialog_confirm"),
        cancelButtonText: this.$t("App.dialog_cancel"),
      })
        .then(() => {
          let data = {
            cardId: cardId,
            touristId: this.touristId,
          };
          this.$post("/unlinkCard", data).then((response) => {
            if (response.code == "success") {
              this.getBankCardList();
              Dialog.alert({
                message: this.$t("BankCard.unlink_success"),
                confirmButtonText: this.$t("App.alert_confirm"),
              }).then(() => {
                // on close
              });
            } else {
              Dialog.alert({
                message: response.msg,
                confirmButtonText: this.$t("App.alert_confirm"),
              }).then(() => {
                // on close
              });
            }
          });
        })
        .catch(() => {
          // on cancel
        });
    },
    setCardDefault(cardId, item) {
      if (item.bankCardType == "0" && this.taxRefundType === "Cash") {
        Dialog.alert({
          message: "现金退税业务需要信用卡进行担保，请选择信用卡继续操作",
          // message: "暂不支持储蓄卡，请换一张卡",
          confirmButtonText: this.$t("App.alert_confirm"),
        }).then(() => {
          this.radio = "";
        });
        return;
      }
      //市区店
      if (this.counterTypes == "0") {
        if (item.cardType == 0 && item.issueOrgCode == "CHINA UNIONPAY") {
          Dialog.alert({
            message: this.$t("BankCard.nodebitcard_choose_another"),
            // message: "暂不支持储蓄卡，请换一张卡",
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            this.radio = "";
          });
          return;
        }
      }
      if (
        !this.issueLogoList
          .map((el) => el.issueName)
          .includes(item.issueOrgCode)
      ) {
        Dialog.alert({
          message: this.$t("BankCard.no_supportdeal"),
          confirmButtonText: this.$t("App.alert_confirm"),
        }).then(() => {
          this.radio = "";
        });
        return;
      }
      if (
        item.cardType == "1" &&
        (!item.termValidity || item.termValidity == "")
      ) {
        Dialog.alert({
          message: this.$t("BankCard.credit_card_novalidity"),
          confirmButtonText: this.$t("App.alert_confirm"),
        }).then(() => {
          this.$emit("toPageEdit", {
            cardId: item.cardId,
            bankName: item.bankName,
            cardNo: item.cardNo,
            issueLogoView: item.bankLogoView,
            bankCardType: item.bankCardType,
            cardHolderName: item.cardHolderName,
          });
          this.radio = "";
        });
        return;
      }
      if (this.partnerSourceId && item.supportStatus === "0") {
        return false;
      }
      let data = {
        cardId: cardId,
      };
      this.$post("/setCardDefault", data).then((response) => {
        if (response.code == "success") {
          // this.radio = cardId;
          this.$store.commit("setCardId", cardId);
          this.getBankCardList();
        } else {
          Dialog.alert({
            message: response.msg,
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            // 有效期小于六个月
            if (response.code == "200007") {
              this.$emit("toPageEdit", {
                cardId: item.cardId,
                bankName: item.bankName,
                cardNo: item.cardNo,
                issueLogoView: item.bankLogoView,
                bankCardType: item.bankCardType,
                cardHolderName: item.cardHolderName,
              });
            }
          });
        }
      });
    },
    toAddCard() {
      this.$emit("toAddCard");
    },
  },
  created() {
    this.getBankCardList();
  },
};
</script>
