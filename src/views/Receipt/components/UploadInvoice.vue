<template>
  <div>
    <hearderBlock />
    <div class="content-2">
      <div class="content-top">
        <label for="imageInvoiceFile">
          <img src="@/assets/image/receipt-bg2.png" />
        </label>
      </div>
      <p class="content-tip">{{ $t("Receipt.img_sample") }}</p>
      <div class="content-middle">
        <van-cell>
          <template #title>
            <span>{{ $t("Receipt.invoice_title") }}</span>
          </template>
          <template #default>
            <!-- 需上传的发票数 -->
            <span
              >{{ invoiceList.length }}/<span class="font-purple">{{
                invoiceCounts
              }}</span></span
            >
          </template>
        </van-cell>
      </div>
      <div class="content-bottom">
        <div class="grid">
          <van-grid :column-num="2" :gutter="5">
            <van-grid-item
              class="default"
              v-for="item in invoiceList"
              :key="item.invoiceId"
            >
              <template #default>
                <div class="grid-top">
                  {{ $t("Receipt.invoice_top") }}
                </div>
                <div class="grid-middle">
                  {{
                    item.taxPriceSum ? `¥${$toFixed2(item.taxPriceSum)}` : "--"
                  }}
                </div>
                <div class="grid-bottom">
                  <span @click="toInfo(item.invoiceId)"
                    ><img src="@/assets/image/point-gray.png"
                  /></span>
                  <span @click="toDel(item.invoiceId, 'invoiceArr')"
                    >{{ $t("Receipt.btn_del") }}<van-icon name="delete-o"
                  /></span>
                </div>
              </template>
            </van-grid-item>
            <van-grid-item class="blank" v-show="invoiceCounts != invoiceList.length">
              <template #default>
                <label for="imageInvoiceFile">
                  <div class="grid-top">
                    <span>+</span>
                  </div>
                  <div class="grid-middle">
                    <span>{{ $t("Receipt.invoice_middle") }}</span>
                  </div>
                  <input
                    ref="file"
                    type="file"
                    style="display: none"
                    id="imageInvoiceFile"
                    accept="image/*"
                    @change="compress($event, 'invoiceArr')"
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
          <div class="btn btn-m" @click="toVoucher">
            <span>{{ $t("Receipt.btn_prev") }}</span>
          </div>
          <div class="btn btn-m" @click="toOrderInfo">
            <span>{{ $t("Receipt.btn_next") }}</span>
          </div>
        </div>
      </div>
    </div>
    <UploadProgress ref="UploadProgress" />

    <van-dialog v-model="dialog_info" :show-confirm-button="false">
      <div class="info">
        <div class="content-middle">
          <div class="block">
            <p class="block-title">
              {{ $t("Receipt.dialog_invoicecode") }}
            </p>
            <p class="block-text">{{ invoiceInfo.invoiceCode }}</p>
          </div>
          <div class="block">
            <p class="block-title">
              {{ $t("Receipt.dialog_invoicecodeNo") }}
            </p>
            <p class="block-text">
              {{ invoiceInfo.invoiceNo }}
            </p>
          </div>
          <div class="block">
            <p class="block-title">
              {{ $t("Receipt.dialog_taxpricesum") }}
            </p>
            <p class="block-text">
              {{
                invoiceInfo.taxPriceSum
                  ? `¥${$toFixed2(invoiceInfo.taxPriceSum)}`
                  : "--"
              }}
            </p>
          </div>
          <div class="block">
            <p class="block-title">
              {{ $t("Receipt.dialog_invoicedate") }}
            </p>
            <p class="block-text">
              {{ invoiceInfo.invoiceDate }}
            </p>
          </div>
          <div class="block">
            <p class="block-title">
              {{ $t("Receipt.dialog_verifycode") }}
            </p>
            <p class="block-text">
              {{ invoiceInfo.verifyCode }}
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
  </div>
</template>

<script>
import { Dialog } from "vant";
import { compression } from "@/utils/tools";
import { mapGetters } from "vuex";
import axios from "axios";
export default {
  props: {
    voucherListLength: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      invoiceList: [],
      invoiceInfo: {},
      dialog_info: false,
      invoiceCounts: 0
    };
  },
  computed: {
    ...mapGetters(["touristId", "counterId"]),
  },
  methods: {
    async compress(e) {
      let fileObj = e.target.files[0];
      let res = await compression(fileObj, 2048);
      this.uploadAli(res.file);
      let imageFile = document.getElementById("imageInvoiceFile");
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
        let res = await this.$postImgPercent("uploadInvoice", {
          touristId: this.touristId,
          key: key
        });
        if (res.code == "success") {
          this.$refs.UploadProgress.close(this.$t("Receipt.upload_success"));
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
    getTaxOrderListFromRedis(type = "invoiceArr") {
      this.$post("/getTaxOrderListFromRedis", {
        step: type,
        touristId: this.touristId,
      }).then((response) => {
        if (response.code == "success") {
          if (type == "invoiceArr") {
            this.invoiceList = JSON.parse(response.data) || [];
            this.getTaxOrderListFromRedis("total");
          }
          if (type == "total") {
            this.invoiceCounts = JSON.parse(response.data).invoiceCounts || 0;
          }
        } else {
          Dialog.alert({
            message: response.msg,
            confirmButtonText: this.$t("App.alert_confirm"),
          });
        }
      });
    },
    toInfo(id) {
        for (let i in this.invoiceList) {
          if (id == this.invoiceList[i].invoiceId) {
            this.invoiceInfo = this.invoiceList[i];
          }
        }
      this.dialog_info = true;
    },
    toDel(id) {
      let message = this.$t("Receipt.makesuredelinvoice");
      Dialog.confirm({
        message: message,
        confirmButtonText: this.$t("App.dialog_confirm"),
        cancelButtonText: this.$t("App.dialog_cancel"),
      })
        .then(() => {
          let data = {
            touristId: this.touristId,
            type: 3, // 1:身份证件，2：退税申请单，3：发票
            imgId: id,
          };
          this.$post("/delUpload", data).then((response) => {
            if (response.code == "success") {
              this.getTaxOrderListFromRedis();
            } else {
              Dialog.alert({
                message: response.msg,
                confirmButtonText: this.$t("App.alert_confirm"),
              })
            }
          });
        })
    },
    toVoucher() {
      this.$emit("toApplication");
    },
    toOrderInfo() {
      if (this.invoiceCounts == this.invoiceList.length) {
        if (this.invoiceList.length != 0) {
          this.$emit("toOrder")
        }
      } else {
        if (this.invoiceCounts > this.invoiceList.length) {
          Dialog.alert({
            message: this.$t("Receipt.morethanreachnuminvoice"),
            confirmButtonText: this.$t("App.alert_confirm"),
          });
        } else if (this.invoiceCounts < this.invoiceList.length && this.invoiceCounts != 0) {
          Dialog.alert({
            message: this.$t("Receipt.reachnuminvoice"),
            confirmButtonText: this.$t("App.alert_confirm"),
          });
        }
      }
    },
    
  },
  created() {
    this.getTaxOrderListFromRedis();
  },
};
</script>
