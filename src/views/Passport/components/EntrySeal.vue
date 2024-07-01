<template>
  <div class="page">
    <div class="seal">
      <template>
        <div class="content-1">
          <div class="content-top">
            <p>
              {{ $t("Seal.entry_tip") }}
            </p>
          </div>
          <div class="content-bottom">
            <div class="grid">
              <van-grid :column-num="2" :gutter="10">
                <van-grid-item class="default">
                  <template #default>
                    <div class="grid-top">
                      {{ $t("Seal.example") }}
                    </div>
                    <div class="grid-middle">
                      <img src="@/assets/image/entry.png" />
                    </div>
                  </template>
                </van-grid-item>
                <van-grid-item class="blank" v-if="!entrySealBase">
                  <template #default>
                    <label for="entrySealFile">
                      <div class="grid-top">
                        <span>+</span>
                      </div>
                      <div class="grid-middle">
                        <span>{{ $t("Seal.entry_upload") }}</span>
                      </div>
                    </label>
                  </template>
                </van-grid-item>
                <van-grid-item class="blank" v-else>
                  <template #default>
                    <label for="entrySealFile">
                      <div class="grid-middle">
                        <img :src="entrySealBase" class="url" />
                      </div>
                    </label>
                  </template>
                </van-grid-item>
                <input
                  ref="file"
                  type="file"
                  style="display: none"
                  id="entrySealFile"
                  accept="image/*"
                  @change="compress($event, 'entry')"
                />
              </van-grid>
            </div>
          </div>
          <div class="content-top" v-if="counterTypes == '1'">
            <p>
              {{ $t("Seal.exit_tip") }}
            </p>
          </div>
          <!-- counterTypes为1时是机场 显示出境章 -->
          <div class="content-bottom" v-if="counterTypes == '1'">
            <div class="grid">
              <van-grid :column-num="2" :gutter="10">
                <van-grid-item class="default">
                  <template #default>
                    <div class="grid-top">
                      {{ $t("Seal.example") }}
                    </div>
                    <div class="grid-middle">
                      <img src="@/assets/image/exit.png" />
                    </div>
                  </template>
                </van-grid-item>
                <van-grid-item class="blank" v-if="!exitSealBase">
                  <template #default>
                    <label for="exitSealFile">
                      <div class="grid-top">
                        <span>+</span>
                      </div>
                      <div class="grid-middle">
                        <span>{{ $t("Seal.exit_upload") }}</span>
                      </div>
                    </label>
                  </template>
                </van-grid-item>
                <van-grid-item class="blank" v-else>
                  <template #default>
                    <label for="exitSealFile">
                      <div class="grid-middle">
                        <img :src="exitSealBase" class="url" />
                      </div>
                    </label>
                  </template>
                </van-grid-item>
                <input
                  ref="file"
                  type="file"
                  style="display: none"
                  id="exitSealFile"
                  accept="image/*"
                  @change="compress($event, 'exit')"
                />
              </van-grid>
            </div>
          </div>
          <div class="btn-group-bottom">
            <div class="logo-icbc">
              <orgLogo></orgLogo>
            </div>
            <div class="btn-group plr-25">
              <div class="btn btn-m" @click="toReload">
                <span>{{ $t("Passport.btn_reload") }}</span>
              </div>
              <div
                class="btn btn-m"
                @click="() => $emit('toBack')"
                v-if="backBtnShow"
              >
                <span>{{ $t("Passport.btn_back") }}</span>
              </div>
              <div class="btn btn-m" @click="toBankCard" v-else>
                <span>
                  {{ $t("Passport.btn_next") }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <UploadProgress ref="UploadProgress" />
    </div>
  </div>
</template>

<script>
import { Dialog } from "vant";
import { mapGetters, mapMutations } from "vuex";
import { compression } from "@/utils/tools";
import axios from "axios";
export default {
  props: {
    counterTypes: {
      type: String,
      default: "0",
    },
    entrySealBase: {
      type: String,
      default: "",
    },
    exitSealBase: {
      type: String,
      default: "",
    },
    entrySealUrl: {
      type: String,
      default: "",
    },
    exitSealUrl: {
      type: String,
      default: "",
    },
    backBtnShow: {
      type: Boolean,
      default: false,
    },
  },
  compunted: {
    ...mapGetters(["touristId"]),
  },
  methods: {
    ...mapMutations(["setEntrySealUrl", "setExitSealUrl", "setEntrySealBase", "setExitSealBase"]),
    toReload() {
      this.setEntrySealUrl("");
      this.setExitSealUrl("");
      this.setEntrySealBase("");
      this.setExitSealBase("");
      this.$emit("reUpload");
    },
    checkParams() {
      if (!this.entrySealUrl) {
        Dialog.confirm({
          message: this.$t("Seal.entrySealUrl"),
          confirmButtonText: this.$t("Passport.dialog_confirm"),
          cancelButtonText: this.$t("Passport.dialog_cancel"),
        });
        return false;
      }
      if (this.counterTypes == "1") {
        if (!this.exitSealUrl) {
          Dialog.confirm({
            message: this.$t("Seal.exitSealUrl"),
            confirmButtonText: this.$t("Passport.dialog_confirm"),
            cancelButtonText: this.$t("Passport.dialog_cancel"),
          });
          return false;
        }
      }
      return true;
    },
    toBankCard() {
      let checked = this.checkParams();
      if (!checked) {
        return false;
      }
      //这块删除了更新用户信息逻辑
      this.$emit('gotoBankCard')
    },
    async compress(e, type) {
      let fileObj = e.target.files[0];
      let res = await compression(fileObj, 1024);
      this.uploadAli(res.file, type);
    },
    async uploadAli(file, type) {
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
        // this.analysis(res.data.key);
        if (type == "entry") {
          let fileEntry = document.getElementById("entrySealFile");
          fileEntry.value = ""; // 上传后清空input
          let base64 = await this.getBase64(file);
          this.setEntrySealBase(base64);
          this.setEntrySealUrl(res.data.key);
        } else {
          let fileExit = document.getElementById("exitSealFile");
          fileExit.value = ""; // 上传后清空input
          let base64 = await this.getBase64(file);
          this.setExitSealBase(base64);
          this.setExitSealUrl(res.data.key);
        }
      } catch(error) {
        Dialog.alert({
          message: error,
          confirmButtonText: this.$t("App.alert_confirm"),
        });
      }finally {
        this.$refs.UploadProgress.close(this.$t("Receipt.upload_success"));
      }
    },
    getBase64(file) {
      return new Promise(function (resolve, reject) {
        let reader = new FileReader();
        let imgResult = "";
        reader.readAsDataURL(file);
        reader.onload = function () {
          imgResult = reader.result;
        };
        reader.onerror = function (error) {
          reject(error);
        };
        reader.onloadend = function () {
          resolve(imgResult);
        };
      });
    },
    // compress(e, type) {
    //   let fileObj = e.target.files[0]; //上传文件的对象
    //   compression(fileObj, 1024).then((res) => this.upLoad(res.file, type));
    //   // this.upLoad(fileObj, type);
    //   if (type == "entry") {
    //     let fileEntry = document.getElementById("entrySealFile");
    //     fileEntry.value = ""; // 上传后清空input
    //   } else {
    //     let fileExit = document.getElementById("exitSealFile");
    //     fileExit.value = ""; // 上传后清空input
    //   }
    // },
//     async upLoad(e, type) {
//       // let that = this;
//       let file = e;
//       let param = new FormData(); //创建form对象
//       param.append("file", file);
//       param.append("touristId", this.touristId);
//       this.$refs.UploadProgress.open();
//       // try {
//       let res = await this.$postImgPercent("uploadSeal", param);
//       if (res.code == "success") {
//         this.getImgBase(res.data, type);
//         if (type == "entry") {
//           // that.entrySealUrl = res.data;
//           this.setEntrySealUrl(res.data);
//         } else {
//           // that.exitSealUrl = res.data;
//           this.setExitSealUrl(res.data);
// ;        }
//       } else {
//         Dialog.alert({
//           message: res.msg,
//           confirmButtonText: this.$t("App.alert_confirm"),
//         });
//       }
//     },
//     async getImgBase(url, type) {
//       let data = {
//         fastdfsUrls: [url],
//       };
//       try {
//         let res = await this.$post("/getImgBase64", data, false);
//         if (type == "entry") {
//           // this.entrySealBase = "data:image/png;base64," + res.data[0][url];
//           this.setEntrySealBase("data:image/png;base64," + res.data[0][url]);
//         } else {
//           // this.exitSealBase = "data:image/png;base64," + res.data[0][url];
//           this.setExitSealBase("data:image/png;base64," + res.data[0][url]);
//         }
//         this.$refs.UploadProgress.close(this.$t("Receipt.upload_success"));
//       } catch {
//         this.$refs.UploadProgress.close(this.$t("Receipt.upload_success"));
//       }
//     },
  },
};
</script>

<style lang="scss" scoped></style>
