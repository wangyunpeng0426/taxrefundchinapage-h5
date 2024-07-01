<template>
  <div>
    <hearderBlock />
    <div class="content-1" v-if="pageType == 1">
      <div class="content-top">
        <label for="imageVoucherFile">
          <img src="@/assets/image/receipt-bg1.png" />
        </label>
      </div>
      <p class="content-tip">{{ $t("Receipt.img_sample") }}</p>
      <div class="content-middle">
        <van-cell>
          <template #title>
            <span>{{ $t("Receipt.voucher_title") }}</span>
          </template>
          <template #default>
            <!-- 申请单总金额 -->
            <span> {{ total != 0 ? `￥${total}` : "--" }}</span>
          </template>
        </van-cell>
      </div>
      <div class="content-bottom">
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
    <div class="content-2" v-if="pageType == 2">
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
              >{{ length }}/<span class="font-purple">{{
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
                  <span @click="toInfo(item.invoiceId, 'invoiceArr')"
                    ><img src="@/assets/image/point-gray.png"
                  /></span>
                  <span @click="toDel(item.invoiceId, 'invoiceArr')"
                    >{{ $t("Receipt.btn_del") }}<van-icon name="delete-o"
                  /></span>
                </div>
              </template>
            </van-grid-item>
            <van-grid-item class="blank" v-show="length != invoiceCounts">
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
        <!-- pageType 1 申请单详情 -->
        <div class="content-middle" v-if="pageType == 1">
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
        <!-- pageType 2 发票详情 -->
        <div class="content-middle" v-else>
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
export default {
  props: {
    PAGE_TYPE: {
      type: Object,
    },
    pageType: {
      type: String,
      default: "1",
    },
    qrInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      voucherList: [],
      voucherInfo: {},

      invoiceList: [],
      invoiceInfo: {},
      invoiceCounts: 0,

      dialog_info: false,
    };
  },
  computed: {
    ...mapGetters(["touristId", "counterId"]),
    total() {
      if (this.voucherList.length > 0) {
        let total = 0;
        for (let i = 0; i < this.voucherList.length; i++) {
          if (this.voucherList[i].applyTaxSum == 0) {
            return 0;
          } else {
            total += Number(this.voucherList[i].applyTaxSum);
          }
        }
        return this.$toFixed2(Number(total));
      } else {
        return 0;
      }
    },
    length() {
      return this.invoiceList.length;
    },
  },
  methods: {
    compress(e, type) {
      let fileObj = e.target.files[0]; //上传文件的对象
      compression(fileObj, 2048).then((res) => this.upLoad(res.file, type));

      switch (type) {
        case "voucherArr":
          let fileVoucher = document.getElementById("imageVoucherFile");
          fileVoucher.value = ""; // 上传后清空input
          break;
        case "invoiceArr":
          let fileInvoice = document.getElementById("imageInvoiceFile");
          fileInvoice.value = ""; // 上传后清空input
          break;
        default:
          break;
      }
    },
    async upLoad(e, type) {
      let file = e;
      let param = new FormData(); //创建form对象
      param.append("file", file);
      param.append("touristId", this.touristId);

      let url = "";

      switch (type) {
        case "voucherArr":
          param.append("counterId", this.counterId);
          param.append("qrCodeResult", JSON.stringify(this.qrInfo));
          url = "uploadVoucher";
          break;
        case "invoiceArr":
          url = "uploadInvoice";
          break;
        default:
          break;
      }
      this.$refs.UploadProgress.open();
      try {
        let res = await this.$postImgPercent(url, param);
        this.$refs.UploadProgress.close();
        if (res.code == "success") {
          this.getTaxOrderListFromRedis(type);
        } else {
          Dialog.alert({
            message: res.msg,
            confirmButtonText: this.$t("App.alert_confirm"),
          });
        }
      } catch {
        this.$refs.UploadProgress.close();
      }
    },
    getTaxOrderListFromRedis(type) {
      this.$post("/getTaxOrderListFromRedis", {
        step: type,
        touristId: this.touristId,
      }).then((response) => {
        if (response.code == "success") {
          if (type == "voucherArr") {
            this.voucherList = JSON.parse(response.data) || [];
          }
          if (type == "invoiceArr") {
            this.invoiceList = JSON.parse(response.data) || [];
            this.getTaxOrderListFromRedis("total");
          }
          if (type == "total") {
            this.invoiceCounts = JSON.parse(response.data).invoiceCounts || 0;
          }
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
    toInfo(id, type) {
      if (type == "voucherArr") {
        for (let i in this.voucherList) {
          if (id == this.voucherList[i].voucherId) {
            this.voucherInfo = this.voucherList[i];
          }
        }
      }
      if (type == "invoiceArr") {
        for (let i in this.invoiceList) {
          if (id == this.invoiceList[i].invoiceId) {
            this.invoiceInfo = this.invoiceList[i];
          }
        }
      }
      this.dialog_info = true;
    },
    toDel(id, type) {
      let message = "";
      if (type == "voucherArr") {
        if (this.voucherList.length == 1) {
          // 清空申请单提示
          message = this.$t("Receipt.clearvoucher");
        } else {
          // 删除申请单提示
          message = this.$t("Receipt.makesuredelvoucher");
        }
      } else {
        // 删除发票提示
        message = this.$t("Receipt.makesuredelinvoice");
      }
      Dialog.confirm({
        message: message,
        confirmButtonText: this.$t("App.dialog_confirm"),
        cancelButtonText: this.$t("App.dialog_cancel"),
      })
        .then(() => {
          let data = {
            touristId: this.touristId,
            type: type == "voucherArr" ? 2 : 3, // 1:身份证件，2：退税申请单，3：发票
            imgId: id,
          };
          this.$post("/delUpload", data).then((response) => {
            if (response.code == "success") {
              this.getTaxOrderListFromRedis(type);
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
    toInvoice() {
      this.$emit("toInvoice");
      this.getTaxOrderListFromRedis("invoiceArr");
    },
    toVoucher() {
      this.$emit("toApplication");
      this.getTaxOrderListFromRedis("voucherArr");
    },
    toOrderInfo() {
      if (this.length == this.invoiceCounts) {
        if (this.invoiceCounts != 0) {
          this.$emit("toOrder")
        }
      } else {
        if (this.length > this.invoiceCounts) {
          Dialog.alert({
            message: this.$t("Receipt.morethanreachnuminvoice"),
            confirmButtonText: this.$t("App.alert_confirm"),
          });
        } else if (this.length < this.invoiceCounts && this.length != 0) {
          Dialog.alert({
            message: this.$t("Receipt.reachnuminvoice"),
            confirmButtonText: this.$t("App.alert_confirm"),
          });
        }
      }
    },
    
  },
  created() {
    this.getTaxOrderListFromRedis(this.pageType === this.PAGE_TYPE.APPLICATION_FORM ? "voucherArr" : "invoiceArr");
  },
};
</script>
