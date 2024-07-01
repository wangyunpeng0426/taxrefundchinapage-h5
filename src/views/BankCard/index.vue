<template>
  <div class="page">
    <div class="bankcard">
      <hearderBlock v-show="head != 'no'" />
      <UploadCard
        :cardRealNo="newCardInfo.cardRealNo"
        :termRealValidity="newCardInfo.termValidity"
        @finishUploadCard="finishUploadCard"
        v-if="pageType === PAGE_TYPE.UPLOAD_CARD"
      />
      <EditCard
        ref="EditCard"
        :addCardFromList="addCardFromList"
        :newCardInfo="newCardInfo"
        @toPageLast="toPageLast"
        @toPageCardList="toPageCardList"
        @finishCardBind="finishCardBind"
        v-else-if="pageType === PAGE_TYPE.CARD_INFO"
      />
      <CardList
        :head="head != 'no'"
        @toAddCard="toAddCard"
        @toPageEdit="toPageEdit"
        v-else
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import UploadCard from "./components/UploadCard.vue";
import EditCard from "./components/EditCard.vue";
import CardList from "./components/CardList.vue";
const PAGE_TYPE = {
  UPLOAD_CARD: "1",
  CARD_INFO: "2",
  CARD_LIST: "3",
};
export default {
  data() {
    return {
      PAGE_TYPE,
      head: this.$route.query.head || "",
      pageType: PAGE_TYPE.UPLOAD_CARD,
      newCardInfo: {
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
        cardImageUrl: "",
        activities: [],
      },
      addCardFromList: false,
    };
  },
  computed: {
    ...mapGetters([
      "touristId",
      "issueIds",
      "orgId",
      "partnerSourceId",
      "issueLogoList",
      "taxRefundType"
    ]),
  },
  components: {
    UploadCard,
    EditCard,
    CardList,
  },
  methods: {
    async getCardDefault() {
      let res = await this.$post("/getCardDefault", {
        touristId: this.touristId,
        orgId: this.orgId,
      });
      if (res.code == "success") {
        if (res.data?.cardId) {
          this.pageType = PAGE_TYPE.CARD_LIST;
        } else {
          this.pageType = PAGE_TYPE.UPLOAD_CARD;
        }
      } else {
        Dialog.alert({
          message: response.msg,
          confirmButtonText: this.$t("App.alert_confirm"),
        });
      }
    },
    finishUploadCard(data) {
      for (let key in this.newCardInfo) {
        this.newCardInfo[key] = data[key];
      }
      this.pageType = PAGE_TYPE.CARD_INFO;
    },
    toPageLast() {
      if (this.addCardFromList) {
        this.addCardFromList = false;
        this.pageType = PAGE_TYPE.CARD_LIST;
      } else {
        this.pageType = PAGE_TYPE.UPLOAD_CARD;
      }
    },
    toAddCard() {
      this.addCardFromList = true;
      this.pageType = PAGE_TYPE.UPLOAD_CARD;
    },
    toPageEdit(data) {
      this.newCardInfo = data;
      this.addCardFromList = true;
      this.pageType = PAGE_TYPE.CARD_INFO;
      this.$nextTick(() => {
        this.$refs.EditCard.cardHolderName = data.cardHolderName;
      });
    },
    toPageCardList() {
      this.addCardFromList = false;
      this.pageType = PAGE_TYPE.CARD_LIST;
    },
    finishCardBind() {
      if (this.addCardFromList) {
        this.addCardFromList = false;
        this.pageType = PAGE_TYPE.CARD_LIST;
      } else {
        let path = '/Receipt'
        if(this.taxRefundType === "Cash") {
          path = '/ReceiptCash'
        }
        this.$router.push({
          path: path,
          query: {
            touristId: this.touristId,
          },
        });
      }
    },
    async getIssueOrg() {
      let res = await this.$get("/getIssueOrg");
      if (res.code == "success") {
        let issueIds = this.issueIds?.split(",") ?? [];
        this.$store.commit(
          "setIssueLogoList",
          res.data
            .filter((item) => issueIds.includes(item.issueId))
            .map((item) => ({
              issueId: item.issueId,
              issueName: item.issueName,
              issueLogo: item.issueLogo,
              issueLogoView: item.issueLogoView,
            }))
        );
        // this.issueLogoList.splice(
        //   0,
        //   this.issueLogoList.length,
        //   ...res.data
        //     .filter((item) => issueIds.includes(item.issueId))
        //     .map((item) => ({
        //       issueId: item.issueId,
        //       issueName: item.issueName,
        //       issueLogo: item.issueLogo,
        //       issueLogoView: item.issueLogoView
        //     }))
        // );
      }
    },
  },
  created() {
    if (this.$route.query.hasOwnProperty("pageType")) {
      this.pageType = this.$route.query.pageType;
    }
    this.getCardDefault();
    if (!this.partnerSourceId) {
      this.getIssueOrg();
    }
  },
};
</script>
