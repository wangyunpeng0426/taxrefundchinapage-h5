<template>
  <div>
    <hearderBlock />
    <div class="content-1">
      <div class="content-middle">
        <van-cell>
          <template #title>
            <span>{{ $t("Receipt.voucher_title") }}</span>
          </template>
          <template #default>
            <span> {{ total != 0 ? `￥${total}` : "--" }}</span>
          </template>
        </van-cell>
        <van-cell v-if="'1' === bankCardType || 'VISA' === issueOrgCode" style="margin-top: 10px">
          <template #title>
            <span>{{ $t("BankCard.Collection") }}</span>
          </template>
          <template #default>
            <span :style="{color: limit < 0 ? 'red' : ''}">￥ {{ limit }}</span>
          </template>
        </van-cell>
        <!-- <div v-else style="height: 1.08rem; width: 100%"></div> -->
      </div>
      <div class="content-bottom" :style="{'min-height': '1' === bankCardType || 'VISA' === issueOrgCode ? '5rem' : '6.08rem'}">
        <div class="grid">
          <van-grid :column-num="2" :gutter="5">
            <van-grid-item
              class="default"
              v-for="item in voucherList"
              :key="item.voucherId"
            >
              <template #default>
                <div class="grid-top">
                  {{ $t("Receipt.voucher_top") }}
                </div>
                <div class="grid-middle">
                  {{
                    item.applyTaxSum ? `¥${$toFixed2(item.applyTaxSum)}` : "--"
                  }}
                </div>
                <div class="grid-bottom">
                  <span @click="toInfo(item.voucherId, 'voucherArr')"
                    ><img src="@/assets/image/point-gray.png"
                  /></span>
                  <span @click="toDel(item.voucherId, 'voucherArr')"
                    >{{ $t("Receipt.btn_del") }}<van-icon name="delete-o"
                  /></span>
                </div>
              </template>
            </van-grid-item>
            <van-grid-item class="blank" v-show="voucherList.length <= 9">
              <template #default>
                <label for="imageVoucherFile">
                  <div class="grid-top">
                    <span>+</span>
                  </div>
                  <div class="grid-middle">
                    <span>{{ $t("Receipt.voucher_middle") }}</span>
                  </div>
                  <input
                    ref="file"
                    type="file"
                    style="display: none"
                    id="imageVoucherFile"
                    accept="image/*"
                    @change="compress($event, 'voucherArr')"
                  />
                </label>
              </template>
            </van-grid-item>
          </van-grid>
        </div>
      </div>
      <div class="btn-group-follow">
        <div class="logo-icbc">
          <orgLogo></orgLogo>
        </div>
        <div class="btn-group">
          <van-button
            block
            class="btn"
            :disabled="voucherList.length == 0"
            @click="toInvoice"
            >{{ $t("Receipt.btn_next") }}</van-button
          >
        </div>
      </div>
    </div>

    <UploadProgress ref="UploadProgress" />

    <van-dialog v-model="dialog_info" :show-confirm-button="false">
      <div class="info">
        <div class="content-middle">
          <div class="block">
            <p class="block-title">
              {{ $t("Receipt.dialog_voucherId") }}
            </p>
            <p class="block-text">{{ voucherInfo.taxNo }}</p>
          </div>
          <div class="block">
            <p class="block-title">{{ $t("Receipt.dialog_name") }}</p>
            <p class="block-text">
              {{ voucherInfo.name }}
            </p>
          </div>
          <div class="block">
            <p class="block-title">{{ $t("Receipt.dialog_idNo") }}</p>
            <p class="block-text">
              {{ voucherInfo.idHideNo }}
            </p>
          </div>
          <div class="block">
            <p class="block-title">
              {{ $t("Receipt.dialog_pricetaxsum") }}
            </p>
            <p class="block-text">
              {{
                voucherInfo.priceTaxSum
                  ? `¥${$toFixed2(voucherInfo.priceTaxSum)}`
                  : "--"
              }}
            </p>
          </div>
          <div class="block">
            <p class="block-title">
              {{ $t("Receipt.dialog_taxfeesum") }}
            </p>
            <p class="block-text">
              {{
                voucherInfo.applyTaxSum
                  ? `¥${$toFixed2(voucherInfo.applyTaxSum)}`
                  : "--"
              }}
            </p>
          </div>
        </div>
        <div class="btn-group">
          <van-button class="btn" block @click="dialog_info = false">
            {{ $t("Receipt.dialog_confirm") }}
          </van-button>
        </div>
      </div>
    </van-dialog>

    <van-dialog v-model="dialog_prompt" :show-confirm-button="false">
      <!-- <div style="width: 100%; height: 56px; line-height: 56px; text-align: center;">{{ $t("Agreement.tip") }}</div> -->
      <div style="width: 100%; padding: 0.5rem 0.4rem 0.5rem 0.4rem">
        <!-- {{ $t("Agreement.prompt_front") }}{{promptRecoverDays}}{{ $t("Agreement.prompt_behind") }}  -->
        {{$t("BankCard.overage_after")}}
      </div>
      <div @click="goBackList" :style="{'width': '100%', 'height': '1rem', 'display': 'flex', 'justify-content': 'center', 'align-items': 'center', 'border': '1px solid rgba(242, 242, 242, 1)', 'color': '#47007F'}">
        {{$t("BankCard.change_bank_card")}}
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { Dialog } from "vant";
import { compression } from "@/utils/tools";
import { mapGetters } from "vuex";
import axios from "axios";
export default {
  props: {
    qrInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      voucherList: [],
      voucherInfo: {},
      dialog_info: false,
      cardLimit: 0,
      bankCardType: "1",
      issueOrgCode: "",
      limit: "",
      total: 0,
      dialog_prompt: false,
      lastVoucherId: "",
    };
  },
  computed: {
    ...mapGetters(["touristId", "counterId", "orgId"]),
    // total() {
    //   if (this.voucherList.length > 0) {
    //     let total = 0;
    //     for (let i = 0; i < this.voucherList.length; i++) {
    //       if (this.voucherList[i].applyTaxSum == 0) {
    //         return 0;
    //       } else {
    //         total += Number(this.voucherList[i].applyTaxSum);
    //       }
    //     }
    //     return this.$toFixed2(Number(total));
    //   } else {
    //     return 0;
    //   }
    // },
  },
  methods: {
    async compress(e) {
      let fileObj = e.target.files[0];
      let res = await compression(fileObj, 2048);
      this.uploadAli(res.file);
      let imageFile = document.getElementById("imageVoucherFile");
      imageFile.value = "";
    },
    async uploadAli(file) {
      this.$refs.UploadProgress.open();
      const header = {
        headers: {
          "Content-Type": "multipart/form-data;",
        },
      };
      try {
        let response = await this.$getAliToken({
          objectName: file.name,
          dir: "taxRefund",
          bucketName: "public",
        });
        let res = response.data;
        let formData = new FormData();
        formData.append("key", res.data.key);
        formData.append("name", file.name);
        formData.append("OSSAccessKeyId", res.data.accessId);
        formData.append("policy", res.data.policy);
        formData.append("success_action_status", "200");
        formData.append("signature", res.data.signature);
        formData.append("file", file);
        await axios.post(res.data.host, formData, header);
        this.analysis(res.data.key);
      } catch {
        this.$refs.UploadProgress.close("上传失败");
      }
    },
    async analysis(key) {
      try {
        let res = await this.$postImgPercent("uploadVoucher", {
          touristId: this.touristId,
          counterId: this.counterId,
          qrCodeResult: JSON.stringify(this.qrInfo),
          key: key,
        });
        if (res.code == "success") {
          this.$refs.UploadProgress.close(this.$t("Receipt.upload_success"));
          this.lastVoucherId = res.data.voucherId;
          this.getTaxOrderListFromRedis();
        } else {
          this.$refs.UploadProgress.close("上传失败");
          Dialog.alert({
            message: res.msg,
            confirmButtonText: this.$t("App.alert_confirm"),
          });
        }
      } catch {
        this.$refs.UploadProgress.close("上传失败");
      }
    },
    getTaxOrderListFromRedis() {
      this.$post("/getTaxOrderListFromRedis", {
        step: "voucherArr",
        touristId: this.touristId,
      }).then((response) => {
        if (response.code == "success") {
          this.voucherList = JSON.parse(response.data) || [];
          if (this.voucherList.length == 0) {
            this.$store.commit("setPage", "Passport,BankCard,Receipt");
          }
          this.getTotal();
        } else {
          Dialog.alert({
            message: response.msg,
            confirmButtonText: this.$t("App.alert_confirm"),
          });
        }
      });
    },
    getTotal() {
      let total = 0;
      if (this.voucherList.length > 0) {
        for (let i = 0; i < this.voucherList.length; i++) {
          if (this.voucherList[i].applyTaxSum == 0) {
            this.total = this.$toFixed2(Number(total));
          } else {
            total += Number(this.voucherList[i].applyTaxSum);
          }
        }
        this.total = this.$toFixed2(Number(total));
      } else {
        this.total = this.$toFixed2(Number(total));
      }
      if ("1" === this.bankCardType|| 'VISA' === this.issueOrgCode) {
        this.limit = Number(this.cardLimit - this.total).toFixed(2);
        // if (this.total > this.cardLimit) {
        //   // 打开提示框
        //   this.$post("/delUpload", {
        //     touristId: this.touristId,
        //     type: 2, // 1:身份证件，2：退税申请单，3：发票
        //     imgId: this.lastVoucherId || this.voucherList[this.voucherList.length - 1]["voucherId"],
        //   }).then((response) => {
        //     if (response.code == "success") {
        //       this.getTaxOrderListFromRedis();
        //     }
        //   });
        //   this.dialog_prompt = true;
        // } else {
        //   this.limit = Number(this.cardLimit - this.total).toFixed(2);
        // }
      }
    },
    toInfo(id) {
      for (let i in this.voucherList) {
        if (id == this.voucherList[i].voucherId) {
          this.voucherInfo = this.voucherList[i];
        }
      }
      this.dialog_info = true;
    },
    toDel(id) {
      let message = "";
      if (this.voucherList.length == 1) {
        // 清空申请单提示
        message = this.$t("Receipt.clearvoucher");
      } else {
        // 删除申请单提示
        message = this.$t("Receipt.makesuredelvoucher");
      }
      Dialog.confirm({
        message: message,
        confirmButtonText: this.$t("App.dialog_confirm"),
        cancelButtonText: this.$t("App.dialog_cancel"),
      }).then(() => {
        let data = {
          touristId: this.touristId,
          type: 2, // 1:身份证件，2：退税申请单，3：发票
          imgId: id,
        };
        this.$post("/delUpload", data).then((response) => {
          if (response.code == "success") {
            this.getTaxOrderListFromRedis();
          } else {
            Dialog.alert({
              message: response.msg,
              confirmButtonText: this.$t("App.alert_confirm"),
            });
          }
        });
      });
    },
    toInvoice() {
      if ("1" === this.bankCardType || 'VISA' === this.issueOrgCode) {
        this.limit = Number(this.cardLimit - this.total).toFixed(2);
        if (this.total > this.cardLimit) {
          // 打开提示框
          this.dialog_prompt = true;
          return false;
        }
      }
      this.$emit("toInvoice", this.voucherList.length);
    },
    async getCardDefault() {
      let data = {
        touristId: this.touristId,
        orgId: this.orgId,
      };
      let response = await this.$post("/getCardDefault", data);
      // .then((response) => {
      if (response.code == "success") {
        console.log(response);
        this.bankCardType = response.data.bankCardType;
        this.issueOrgCode = response.data.issueOrgCode;
        this.cardLimit = response.data.cardLimit || 0;
        // this.cardLimit = 1000;
        if ("1" === this.bankCardType || "VISA" === this.issueOrgCode) {
          if (this.total) {
            this.limit = Number(this.cardLimit - this.total).toFixed(2);
          } else {
            this.limit = Number(this.cardLimit).toFixed(2);
          }
        }
      } else {
        Dialog.alert({
          message: response.msg,
          confirmButtonText: this.$t("App.alert_confirm"),
        });
      }
      // });
    },
    goBackList() {
      this.$router.push({
        path: `/BankCard`,
        query: {
          touristId: this.touristId,
          pageType: "3",
        },
      });
      this.dialog_prompt = false;
    },
  },
  async created() {
    await this.getCardDefault();
    await this.getTaxOrderListFromRedis();
  },
};
</script>
