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
                      <img src="../assets/image/entry.png" />
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
                      <img src="../assets/image/exit.png" />
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
            <div class="btn-group">
              <div class="btn" @click="toBankCard">
                <span>{{ $t("Passport.btn_next") }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 拍照上传进度loading - start -->
    <div
      class="van-toast van-toast--middle van-toast--loading"
      style="z-index: 2006; /* display: none; */"
      v-show="toastPercent"
    >
      <div class="van-loading van-loading--circular van-toast__loading">
        <span class="">
          <van-circle
            v-model="currentRate"
            size="50"
            color="#fff"
            layer-color="#484848"
            :rate="100"
            :text="num"
            :speed="100"
          />
        </span>
      </div>
      <div class="van-toast__text">
        {{ $t("Receipt.dialog_uploading") }}
      </div>
    </div>
    <!-- 拍照上传进度loading - end -->
  </div>
</template>

<script>
import { Toast, Dialog } from "vant";
import orgLogo from "@/components/orgLogo.vue";
import { compression } from "@/utils/tools";
import { mapGetters } from "vuex";
export default {
  name: "Seal",
  components: { orgLogo },
  data() {
    return {
      // 是否需要出入境章（0：不需要[默认]  1:需要）
      entryExitSeal: this.$store.state.entryExitSeal,
      // 退税点类型（1：机场；0：市区）
      counterTypes: this.$store.state.counterTypes,
      touristId: this.$route.query.touristId || this.$store.state.touristId,

      entrySealBase: "",
      exitSealBase: "",
      entrySealUrl: "",
      exitSealUrl: "",

      // 上传显示百分比
      toastPercent: false,
      currentRate: 0,
      num: "",
    };
  },
  props: {
    idType: String,
  },
  computed: {
    ...mapGetters(["orgId"]),
  },
  watch: {
    // 切换页面时回到顶
    pageType() {
      window.scrollTo(0, 0);
    },
    entrySealUrl(val) {
      if (val) {
        this.$emit("entrySealUrlFn", val);
      }
    },
    exitSealUrl(val) {
      if (val) {
        this.$emit("exitSealUrlFn", val);
      }
    },
  },
  created() {
    // if (this.$store.state.entrySealUrl) {
    //   this.getImgBase(this.$store.state.entrySealUrl, "entry");
    // }
    // if (this.$store.state.exitSealUrl) {
    //   this.getImgBase(this.$store.state.exitSealUrl, "exit");
    // }
    this.entrySealBase = '';
    this.exitSealBase = '';
    this.$store.commit("setEntrySealBase", '')
    this.$store.commit("setExitSealBase", '')
    localStorage.removeItem("setEntrySealBase")
    localStorage.removeItem("setExitSealBase",)
  },
  mounted() {
    // this.$nextTick(() => {
    //   this.entrySealBase = this.$store.state.entrySealBase;
    //   this.exitSealBase = this.$store.state.exitSealBase;
    // });
  },
  methods: {
    // 1.先对图片进行压缩
    compress(e, type) {
      let fileObj = e.target.files[0]; //上传文件的对象
      compression(fileObj, 1024).then((res) => this.upLoad(res.file, type));
      // this.upLoad(fileObj, type);
      if (type == "entry") {
        let fileEntry = document.getElementById("entrySealFile");
        fileEntry.value = ""; // 上传后清空input
      } else {
        let fileExit = document.getElementById("exitSealFile");
        fileExit.value = ""; // 上传后清空input
      }
    },
    // 2.上传
    upLoad(e, type) {
      let that = this;
      let file = e;
      let param = new FormData(); //创建form对象
      param.append("file", file);
      param.append("touristId", this.touristId);
      // for (let [a, b] of param.entries()) {
      //   console.log(a, b);
      // }
      this.toastPercent = true;
      this.$postImgPercent("uploadSeal", param, (e) => {
        this.currentRate = parseInt((e.loaded / e.total) * 100);
        this.num = `${parseInt((e.loaded / e.total) * 100)}%`;
        if (this.currentRate == 100) {
          this.toastPercent = false;
          Toast.loading({
            message: this.$t("Receipt.toast_loading"),
            duration: 0,
            mask: true,
          });
        }
      }).then((response) => {
        this.toastPercent = false;
        if (response.code == "success") {
          // 根据图片地址获取base64
          this.getImgBase(response.data, type);
          if (type == "entry") {
            that.entrySealUrl = response.data;
            this.$store.commit("setEntrySealUrl", that.entrySealUrl);
          } else {
            that.exitSealUrl = response.data;
            this.$store.commit("setExitSealUrl", that.exitSealUrl);
          }

          // 上传成功后显示success
          let toast = Toast({
            message: this.$t("Receipt.upload_success"),
            type: "success",
          });
          setTimeout(() => {
            toast.clear();
          }, 1500);
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
    // 获取图片base64
    getImgBase(url, type) {
      let data = {
        fastdfsUrls: [url],
      };
      this.$post("/getImgBase64", data).then((response) => {
        if (response.code == "success") {
          this.$nextTick(() => {
            if (type == "entry") {
              this.entrySealBase =
                "data:image/png;base64," + response.data[0][url];
              this.$store.commit("setEntrySealBase", this.entrySealBase);
            } else {
              this.exitSealBase =
                "data:image/png;base64," + response.data[0][url];
              this.$store.commit("setExitSealBase", this.exitSealBase);
            }
          });
        }
      });
    },
    // 获取默认卡信息
    getCardDefault() {
      let data = {
        touristId: this.touristId,
        orgId: this.orgId
      };
      this.$post("/getCardDefault", data).then((response) => {
        if (response.code == "success") {
          this.updateUserInfo();
          if (response.data && response.data.cardId) {
            this.$router.push({
              path: "/BankCard",
              query: {
                touristId: this.touristId,
                pageType: "3",
              },
            });
          } else {
            this.$router.push({
              path: "/BankCard",
              query: {
                touristId: this.touristId,
                pageType: "1",
              },
            });
          }
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
    // 确认补全信息并添加用户 跳转添加银行卡页面
    toBankCard() {
      if (this.entryExitSeal == "1" && this.idType == "29") {
        if (!this.entrySealUrl || this.entrySealUrl == "null") {
          if (!this.entrySealBase) {
            Dialog.alert({
              message: this.$t("Seal.entrySealUrl"),
              confirmButtonText: this.$t("App.alert_confirm"),
            }).then(() => {
              // on close
            });
            return;
          }
        }
        if (this.counterTypes == "1") {
          if (!this.exitSealUrl || this.exitSealUrl == "null") {
            if (!this.exitSealBase) {
              Dialog.alert({
                message: this.$t("Seal.exitSealUrl"),
                confirmButtonText: this.$t("App.alert_confirm"),
              }).then(() => {
                // on close
              });
              return;
            }
          }
        }
      } else {
        if (!this.entrySealUrl || this.entrySealUrl == "null") {
          if (!this.entrySealBase) {
            Dialog.alert({
              message: this.$t("Seal.entrySealUrl"),
              confirmButtonText: this.$t("App.alert_confirm"),
            }).then(() => {
              // on close
            });
            return;
          }
        }
      }
      this.$store.commit(
        "setDateUrl",
        new Date(new Date().toLocaleDateString()).getTime()
      );
      this.getCardDefault();
    },
    // 更新用户退税点
    updateUserInfo() {
      let data = {
        touristId: this.touristId,
        counterId: this.$store.state.counterId,
      };
      this.$post("/updateUserInfo", data).then((response) => {
        if (response.code == "success") {
          // 退税点可用
          console.log();
        }
      });
    },
  },
};
</script>
