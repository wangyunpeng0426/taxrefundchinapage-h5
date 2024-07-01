<template>
  <div class="content-2">
    <div class="content-top">
      <div class="left">
        <p class="bank">{{ newCardInfo.bankName }}</p>
        <p class="cardNo">{{ toAddSpace(newCardInfo.cardNo) }}</p>
      </div>
      <div class="right">
        <p><img :src="newCardInfo.issueLogoView" /></p>
        <p class="cardBin">
          {{
            newCardInfo.bankCardType == "1"
              ? $t("BankCard.credit_card")
              : $t("BankCard.debit_card")
          }}
        </p>
      </div>
    </div>
    <div style="color: #8177b9; margin: auto; width: 85%">
      <p
        v-if="
          newCardInfo.bankCardType == 0 &&
          newCardInfo.issueOrgCode == 'CHINA UNIONPAY'
        "
      >
        {{ $t("BankCard.debitTime") }}
      </p>
      <div v-else>
        <p v-if="newCardInfo.fastMode == 1">
          {{ $t("BankCard.creditedImmediately") }}
        </p>
        <p v-else>{{ $t("BankCard.withinTowDays") }}</p>
      </div>
    </div>
    <div class="content-bottom">
      <p class="input-label">{{ $t("BankCard.auth_name") }}</p>
      <van-cell-group>
        <van-field
          v-model="cardHolderName"
          :formatter="toFormatterName"
          :disabled="Boolean(newCardInfo.cardId)"
          :placeholder="$t('BankCard.input_name')"
          maxlength="128"
        />
      </van-cell-group>
      <p class="input-label" style="color: #8177b9">
        {{ $t("BankCard.name_notes") }}
      </p>
      <!-- 银联信用卡 VISA卡都需要 -->
      <p
        class="input-label"
        v-if="
          newCardInfo.bankCardType == '1' || newCardInfo.issueOrgCode == 'VISA'
        "
      >
        {{ $t("BankCard.valid_thru") }}
      </p>
      <van-cell-group
        v-if="
          newCardInfo.bankCardType == '1' || newCardInfo.issueOrgCode == 'VISA'
        "
      >
        <van-field
          class="filed"
          readonly
          clickable
          :value="newCardInfo.termValidity"
          @click="openVanDatetimePicker"
          :placeholder="$t('BankCard.input_validity')"
        >
          <template #button>
            <van-icon
              name="question-o"
              class="input_validity-icon"
              @click.stop="dialog = true"
            />
          </template>
        </van-field>
        <van-popup v-model="showPicker" position="bottom" lock-scroll>
          <van-datetime-picker
            v-model="currentDate"
            type="year-month"
            :title="$t('BankCard.pop_title')"
            :min-date="minDate"
            :max-date="maxDate"
            :columns-order="['year', 'month']"
            :confirm-button-text="$t('BankCard.pop_confirm')"
            :cancel-button-text="$t('BankCard.pop_cancel')"
            @confirm="onConfirm"
            @cancel="onCancel"
          />
        </van-popup>
      </van-cell-group>
    </div>
    <!-- v-show="hideShow" -->
    <div class="btn-group-bottom">
      <div class="logo-icbc">
        <orgLogo></orgLogo>
      </div>
      <div class="btn-group plr-25">
        <div class="btn btn-m" @click="toPageLast">
          <span>{{ $t("BankCard.btn_prev") }}</span>
        </div>
        <div class="btn btn-m" @click="toBindCard">
          <span>{{ $t("BankCard.btn_next") }}</span>
        </div>
      </div>
    </div>

    <van-dialog
      class="dialog-card"
      v-model="dialog"
      :show-confirm-button="false"
    >
      <div class="content">
        <p class="title">*{{ $t("BankCard.dialog_card_tip1") }}</p>
        <div>
          <img src="@/assets/image/dia-card.png" />
        </div>
        <p class="bottom-content">{{ $t("BankCard.dialog_card_tip2") }}</p>
      </div>
      <div class="btn-group">
        <van-button class="btn" block @click="dialog = false">{{
          $t("BankCard.dialog_confirm")
        }}</van-button>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { addSpace, removeSpaces } from "@/utils/tools";
import { RSA } from "@/utils/RSA";
import { mapGetters } from "vuex";
import { Dialog } from "vant";
export default {
  props: {
    newCardInfo: {
      type: Object,
      default: () => ({
        cardId: "",
        cardRealNo: "",
        termValidity: "",
        cardNoComplete: "",
        cardNo: "",
        bankCardType: "",
        issueLogo: "",
        issueLogoView: "",
        bankName: "",
        issueOrgCode: "",
        status: "",
        fastMode: "",
        activities: [],
        cardImageUrl: ""
      }),
    },
    addCardFromList: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cardHolderName: "",

      showPicker: false,
      currentDate: new Date(),
      maxDate: new Date(2040, 12, 31),

      dialog: false,
    };
  },
  computed: {
    ...mapGetters(["touristId", "counterId", "partnerSourceId"]),
    minDate() {
      var date = new Date(); //获取当前日期
      date.setMonth(date.getMonth() + 7); //当前月份加六个月
      return new Date(date);
    },
  },
  methods: {
    dialogInfoOpen(msg) {
      Dialog.alert({
        message: msg,
        confirmButtonText: this.$t("App.alert_confirm"),
      });
    },
    toAddSpace(val) {
      if (val) {
        return addSpace(val);
      }
    },
    toFormatterName(val) {
      return val.toUpperCase();
    },
    openVanDatetimePicker() {
      let str = this.newCardInfo.termValidity.split('/');
      if(str.length === 2) {
        this.currentDate = new Date(`20${str[1]}-${str[0]}-01`);
      } else {
        this.currentDate = this.minDate;
      }
      this.showPicker = true;
    },
    onConfirm(value) {
      let date = new Date(value);
      let y = String(date.getFullYear()).substring(2);
      let m = date.getMonth() + 1;
      m = m < 10 ? "0" + m : m;
      const time = m + "/" + y;
      this.newCardInfo.termValidity = time;
      this.showPicker = false;
    },
    onCancel() {
      this.currentDate = "";
      this.newCardInfo.termValidity = "";
      this.showPicker = false;
    },
    toBindCard() {
      if (!this.cardHolderName) {
        this.dialogInfoOpen(this.$t("BankCard.input_name"));
        return;
      }
      if (
        this.newCardInfo.bankCardType == "1" &&
        !this.newCardInfo.termValidity
      ) {
        this.dialogInfoOpen(this.$t("BankCard.input_validity"));
        return;
      }

      if (this.newCardInfo.cardId) {
        this.updateCardTermValidity();
      } else {
        this.advanceCardBinding();
      }
    },
    updateCardTermValidity() {
        this.$post("/updateCardTermValidity", {
          cardId: this.newCardInfo.cardId,
          termValidity: RSA(this.newCardInfo.termValidity, "PU"),
        }).then((res) => {
          if (res.code == "success") {
            // this.$store.commit("setCardId", this.newCardInfo.cardId);
            // 从卡列表补全有效期 成功跳转申请单页
            // this.$router.push({
            //   path: "/Receipt",
            //   query: {
            //     touristId: this.touristId,
            //   },
            // });
            this.$emit("finishCardBind");
          } else {
            this.dialogInfoOpen(res.msg);
          }
        });
    },
    advanceCardBinding() {
      let obj = {
        touristId: this.touristId,
        cardNo: removeSpaces(this.newCardInfo.cardRealNo),
        termValidity: this.newCardInfo.termValidity,
        issueOrgCode: this.newCardInfo.issueOrgCode,
        cardType: this.newCardInfo.bankCardType,
        cardImageUrl: this.newCardInfo.cardImageUrl
      };
      let params = {
        secretJson: RSA(JSON.stringify(obj), "PU"),
        bankName: this.newCardInfo.bankName,
        issueLogo: this.newCardInfo.issueLogo,
        cardHolderName: this.cardHolderName,
        cardNoComplete: this.newCardInfo.cardNoComplete,
        counterId: this.counterId,
        fastMode: this.newCardInfo.fastMode,
        cardImageUrl: this.newCardInfo.cardImageUrl,
        partnerSourceId: this.partnerSourceId
      }
      let url = localStorage.getItem("TaxRefundType") === "Cash" ? "/cashTaxAdvanceCardBinding" : "/advanceCardBinding";
      this.$post(url, params).then((res) => {
          if (res.code == "success") {
          if (this.addCardFromList) {
            this.$emit("toPageCardList");
          } else {
            this.$emit("finishCardBind");
          }
        } else {
          this.dialogInfoOpen(res.data?.msg ?? res.msg);
        }
      });
      // this.$post("/advanceCardBinding", {
      //   secretJson: RSA(JSON.stringify(obj), "PU"),
      //   bankName: this.newCardInfo.bankName,
      //   issueLogo: this.newCardInfo.issueLogo,
      //   cardHolderName: this.cardHolderName,
      //   cardNoComplete: this.newCardInfo.cardNoComplete,
      //   counterId: this.counterId,
      //   fastMode: this.newCardInfo.fastMode,
      //   cardImageUrl: this.newCardInfo.cardImageUrl,
      //   partnerSourceId: this.partnerSourceId
      // }).then((res) => {
      //   if (res.code == "success") {
      //     if (this.addCardFromList) {
      //       this.$emit("toPageCardList");
      //     } else {
      //       this.$emit("finishCardBind");
      //       // 从绑卡添加卡 成功跳转申请单页
      //       // this.$router.push({
      //       //   path: "/Receipt",
      //       //   query: {
      //       //     touristId: this.touristId,
      //       //   },
      //       // });
      //     }
      //   } else {
      //     this.dialogInfoOpen(res.data?.msg ?? res.msg);
      //   }
      // });
    },
    toPageLast() {
      this.$emit("toPageLast");
    },
  },
};
</script>
