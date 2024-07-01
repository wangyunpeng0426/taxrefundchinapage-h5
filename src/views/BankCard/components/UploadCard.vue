<template>
  <div class="content-1">
    <div class="content-bottom">
      <p class="input-label">{{ $t("BankCard.card_no") }}</p>
      <van-cell-group>
        <van-field
          v-model="cardNo"
          center
          clearable
          maxlength="23"
          :placeholder="$t('BankCard.input_card_no')"
          :style="{
            'border-bottom-left-radius':
              $store.state.counterReceiveMethod == 0 ? '0px' : '10px',
            'border-bottom-right-radius':
              $store.state.counterReceiveMethod === 0 ? '0px' : '10px',
          }"
        >
          <template #button>
            <label for="imageFile">
              <van-icon name="photograph" />
            </label>
            <input
              ref="file"
              type="file"
              style="display: none"
              id="imageFile"
              accept="image/*"
              @change="compress($event)"
            />
          </template>
        </van-field>
        <div
          v-if="haveActivites"
          style="
            fontsize: 12px;
            textalign: center;
            lineheight: 30px;
            background: #e5e4f2;
            border-bottom-left-radius: 5px;
            border-bottom-right-radius: 5px;
          "
        >
          <!-- *用户首单使用<span style="color:#5f59ae; fontWeight: bold">Visa银行卡</span>退税，平台最高补贴<span style="color:#5f59ae; fontWeight: bold">9.90元</span> -->
          <p v-html="$t('BankCard.subsidyTips')" />
        </div>
      </van-cell-group>
    </div>
    <div
      v-if="showActivity"
      style="
        color: #5f59ae;
        textalign: center;
        margintop: 15px;
        fontsize: 13px;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <img
        src="@/assets/image/bankCard-checkmark.png"
        style="width: 13px; marginright: 5px"
      />
      <!-- 该卡支持平台补贴多推活动,补贴金额9.90元 -->
      {{ $t("BankCard.subsidy_authority") }}
    </div>
    <div class="logo-group">
      <img
        v-for="item in issueLogoList"
        :src="item.issueLogoView"
        :alt="item.issueName"
        :key="item.issueId"
        style="height: 0.4rem"
      />
    </div>

    <div class="btn-group-bottom">
      <div class="logo-icbc">
        <orgLogo></orgLogo>
      </div>
      <div class="btn-group plr-25">
        <van-button
          block
          class="btn"
          :disabled="disabledNext"
          @click="toCardInfo"
          >{{ $t("BankCard.btn_next") }}</van-button
        >
      </div>
    </div>
    <UploadProgress ref="UploadProgress" />
  </div>
</template>

<script>
import { Dialog } from "vant";
import { mapGetters } from "vuex";
import { bankCardStyle, removeSpaces, compression } from "@/utils/tools";
import { RSA } from "@/utils/RSA";
import axios from "axios";
export default {
  props: {
    cardRealNo: {
      type: String,
      default: "",
    },
    termRealValidity: {
      type: String,
      default: "",
    },
    // issueLogoList: {
    //   type: Array,
    //   default: () => [],
    // },
  },
  data() {
    return {
      cardNo: "",
      haveActivites: false, // 是否显示补贴提示
      showActivity: false, // 卡号是否支持活动
      disabledNext: true, // 下一步是否可点
      termValidity: "",
      key: "",
    };
  },
  computed: {
    ...mapGetters([
      "orgId",
      "counterId",
      "touristId",
      "counterTypes",
      "issueLogoList",
      "partnerSourceId",
      "taxRefundType"
    ]),
  },
  watch: {
    cardNo: {
      handler: function (newData, oldData) {
        this.cardNo = bankCardStyle(this.cardNo);
        let flag = /^\d{15,19}$/.test(this.cardNo.replace(/\s*/g, ""));
        if (flag) {
          this.disabledNext = false;
          if (
            newData > oldData &&
            this.cardNo.length === 18 &&
            this.haveActivites
          ) {
            this.checkCardNo("haveActivites");
          }
        } else {
          this.disabledNext = true;
          this.showActivity = false;
        }
      },
      immediate: true,
    },
    cardRealNo: {
      handler: function (value) {
        if (value) {
          this.cardNo = value;
          this.termValidity = this.termRealValidity;
        }
      },
      immediate: true,
    },
  },
  methods: {
    dialogInfoOpen(msg) {
      Dialog.alert({
        message: msg,
        confirmButtonText: this.$t("App.alert_confirm"),
      });
    },
    toCardInfo() {
      this.checkCardNo();
    },

    async getOrgActivities() {
      let res = await this.$post("/getOrgActivities", { taxOrgId: this.orgId });
      if (res.code == "success") {
        if (res.data == null) {
          this.haveActivites = false;
        } else {
          this.haveActivites = true;
        }
      }
    },
    async compress(e, type) {
      let fileObj = e.target.files[0];
      let res = await compression(fileObj, 1024);
      this.uploadAli(res.file, type);
      let imageFile = document.getElementById("imageFile");
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
        let res = await this.$postImgPercent("cardNoDiscen", { key });
        if (res.code == "success") {
          this.cardNo = bankCardStyle(RSA(res.data.cardNo, "PR"));
          if (res.data.certifTp) {
            let expirationTime = RSA(res.data.certifTp, "PR").split("/");
            if (expirationTime.length > 0) {
              let currentDate = new Date();
              let judgmentTime = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 6,
                currentDate.getDate(),
                currentDate.getHours(),
                currentDate.getMinutes(),
                currentDate.getSeconds()
              );
              if (
                new Date(judgmentTime).getTime() >
                new Date(expirationTime[1], expirationTime[0], 0).getTime()
              ) {
                this.cardNo = "";
                Dialog.alert({
                  message: this.$t("BankCard.sixMonths"),
                });
              } else {
                this.termValidity = `${
                  expirationTime[0]
                }/${expirationTime[1].substring(2, 4)}`;
              }
            }
            this.key = key;
            this.$refs.UploadProgress.close(this.$t("Receipt.upload_success"));
          }
        } else {
          this.dialogInfoOpen(res.msg);
          this.$refs.UploadProgress.close("上传失败");
        }
      } catch {
        this.$refs.UploadProgress.close("上传失败");
      }
    },

    // compress(e) {
    //   let fileObj = e.target.files[0];
    //   compression(fileObj, 2048).then((res) => {
    //     new Compressor(fileObj, {
    //       quality: 0.6, // 压缩质量，可根据需要进行调整
    //       maxWidth: 800, // 最大宽度，可根据需要进行调整
    //       maxHeight: 800, // 最大高度，可根据需要进行调整
    //       mimeType: "image/jpeg", // 目标图片类型，可根据需要进行调整
    //       maxSizeMB: 1,
    //       success: (result) => {
    //         // 压缩成功后的操作
    //         const compressedFile = new File([result], res.file.name, {
    //           type: "image/jpeg",
    //           lastModified: Date.now(),
    //         });
    //         this.upLoad(compressedFile);
    //         console.log(compressedFile);
    //       },
    //       error(err) {
    //         // 压缩失败后的操作
    //         console.log(err.message);
    //       },
    //     });

    //   });
    //   let imageFile = document.getElementById("imageFile");
    //   imageFile.value = "";
    // },
    // async upLoad(e) {
    //   let file = e;
    //   let param = new FormData();
    //   param.append("file", file);
    //   this.$refs.UploadProgress.open();
    //   try {
    //     let res = await this.$postImgPercent("cardNoDiscen", param);
    //     this.$refs.UploadProgress.close();
    //     if (res.code == "success") {
    //       //返回银行卡号
    //       this.cardNo = bankCardStyle(RSA(res.data.cardNo, "PR"));
    //       if (res.data.certifTp) {
    //         let expirationTime = RSA(res.data.certifTp, "PR").split("/");
    //         if (expirationTime.length > 0) {
    //           let currentDate = new Date();
    //           let judgmentTime = new Date(
    //             currentDate.getFullYear(),
    //             currentDate.getMonth() + 6,
    //             currentDate.getDate(),
    //             currentDate.getHours(),
    //             currentDate.getMinutes(),
    //             currentDate.getSeconds()
    //           );
    //           if (
    //             new Date(judgmentTime).getTime() >
    //             new Date(expirationTime[1], expirationTime[0], 0).getTime()
    //           ) {
    //             this.cardNo = "";
    //             Dialog.alert({
    //               message: this.$t("BankCard.sixMonths"),
    //             });
    //           } else {
    //             this.termValidity = `${
    //               expirationTime[0]
    //             }/${expirationTime[1].substring(2, 4)}`;
    //           }
    //         }
    //       }
    //     } else {
    //       this.dialogInfoOpen(res.msg);
    //     }
    //   } catch {
    //     this.$refs.UploadProgress.close();
    //   }
    // },
    async checkCardNo(type) {
      this.$post("/checkBankCardNo", {
        touristId: this.touristId,
        counterId: this.counterId,
        cardNoComplete: RSA(removeSpaces(this.cardNo), "PU"),
        partnerSourceId: this.partnerSourceId,
      }).then((res) => {
        if (res.code == "success") {
          if ("haveActivites" === type) {
            if (res.data.activities.length > 0) {
              this.showActivity = true;
            } else {
              this.showActivity = false;
            }
          } else {
            if (res.data.status == "1") {
              //判断退税点是否支持当前卡组织
              if (
                !this.issueLogoList
                  .map((item) => item.issueName)
                  .includes(res.data.issueOrgCode)
              ) {
                this.dialogInfoOpen(this.$t("BankCard.no_issue"));
                return false;
              }
              //新增现金退税业务 储蓄卡无法担保
              if(this.taxRefundType === "Cash" && res.data.bankCardType == "0") {
                this.dialogInfoOpen("现金退税业务需要信用卡进行担保，请上传信用卡继续操作");
                  return false;
              }
              //市区
              if (this.counterTypes === "0") {
                if (
                  res.data.issueOrgCode == "CHINA UNIONPAY" &&
                  res.data.bankCardType == "0"
                ) {
                  this.dialogInfoOpen(
                    this.$t("BankCard.nodebitcard_choose_another")
                  );
                  return false;
                } else {
                  this.$emit("finishUploadCard", {
                    ...res.data,
                    cardRealNo: this.cardNo,
                    termValidity: this.termValidity,
                    cardImageUrl: this.key,
                  });
                }
              } else {
                if (res.data.issueOrgCode == "VISA") {
                  this.$emit("finishUploadCard", {
                    ...res.data,
                    cardRealNo: this.cardNo,
                    termValidity: this.termValidity,
                    cardImageUrl: this.key,
                  });
                } else if (res.data.issueOrgCode == "CHINA UNIONPAY") {
                  this.$emit("finishUploadCard", {
                    ...res.data,
                    cardRealNo: this.cardNo,
                    termValidity: this.termValidity,
                    cardImageUrl: this.key,
                  });
                }
              }
            } else {
              this.dialogInfoOpen(res.data?.msg ?? res.msg);
            }
          }
        } else {
          this.dialogInfoOpen(res.data?.msg ?? res.msg);
        }
      });
    },
  },
  created() {
    this.getOrgActivities();
  },
};
</script>
