<template>
  <div class="page">
    <div class="contact">
      <div class="content-2">
        <template>
          <div class="content-top">{{ $t("Contact.mailphone") }}</div>
          <div class="content-bottom">
            <van-cell-group :title="$t('Contact.mail')">
              <van-field
                v-model="userInfo.mail"
                label-width="120"
                input-align="left"
                right-icon="edit"
                maxlength="32"
                readonly
                @click="toEdit('Mail')"
              />
            </van-cell-group>
            <van-cell-group :title="$t('Contact.phone')">
              <van-field
                v-model="userInfo.phone"
                label-width="120"
                input-align="left"
                right-icon="edit"
                maxlength="32"
                readonly
                @click="toEdit('Tel')"
              />
            </van-cell-group>
            <div class="content-top">
              {{ $t("Contact.tip") }}
            </div>
          </div>
        </template>
        <div class="btn-group-bottom">
          <div class="logo-icbc">
            <orgLogo></orgLogo>
          </div>
          <div class="btn-group plr-25">
            <!-- 点击返回 -->
            <div class="btn" @click="toBack">
              <span>{{ $t("Passport.btn_back") }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 登录弹层 - start -->
      <van-popup
        class="login-pop"
        v-model="dialog_login"
        closeable
        @close="close"
        :style="{ height: 'auto' }"
      >
        <div class="content">
          <div class="content-top">
            <div class="title">{{ title }}</div>
            <div class="input">
              <div class="tel" v-if="login_radio == 'Tel'">
                <van-cell-group class="tel-group">
                  <van-field
                    class="tel-country"
                    readonly
                    clickable
                    :value="value"
                    @click="showPicker = true"
                    :left-icon="
                      icon ? icon : require(`../assets/image/flags/cn.png`)
                    "
                  />
                  <div class="line"></div>
                  <van-field
                    class="tel-input"
                    v-model.trim="tel"
                    maxlength="16"
                    :placeholder="$t('elf.input_tel')"
                  />
                </van-cell-group>
              </div>
              <div class="tel" v-else>
                <van-cell-group class="tel-group">
                  <van-field
                    class="tel-input"
                    v-model.trim="mail"
                    maxlength="50"
                    :placeholder="$t('elf.input_mail')"
                  />
                </van-cell-group>
              </div>
              <div class="tel">
                <van-cell-group class="code-group">
                  <van-field v-model="code" maxlength="6" />
                  <van-button
                    type="default"
                    v-show="show"
                    style="height: auto;"
                    @click="sendValidCode"
                    :disabled="
                      (login_radio == 'Tel' && !tel) ||
                      (login_radio == 'Mail' && !mail)
                    "
                    >{{ $t("elf.getcode") }}
                  </van-button>
                  <van-button v-show="!show" type="default"
                    >{{ count }}s
                  </van-button>
                </van-cell-group>
              </div>
              <div class="tip" v-show="login_tip">
                {{
                  login_radio == "Tel"
                    ? $t("Contact.sendphone")
                    : $t("Contact.sendmail")
                }}
                <!-- ? "验证码已发送至您要修改的新手机号码， 请在30分钟之内验证修改"
                    : "验证码已发送至您要修改的新邮箱地址， 请在30分钟之内验证修改" -->
              </div>
            </div>
          </div>
          <div class="btn-group-follow">
            <div class="btn-group">
              <div class="btn" @click="checkValidCode">
                <span>{{ $t("Contact.submit") }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-popup>
      <!-- 登录弹层 - end -->
    </div>

    <!-- 国家区号选择弹层 - start -->
    <van-popup
      v-model="showPicker"
      class="country-model"
      round
      position="bottom"
    >
      <van-picker
        :confirm-button-text="$t('Passport.dialog_confirm')"
        :cancel-button-text="$t('Passport.dialog_cancel')"
        show-toolbar
        :columns="countryList"
        @cancel="showPicker = false"
        @confirm="onConfirm"
      >
        <template #option="item">
          <div>
            <div class="img-class">
              <img class="country-logo" :src="item.countryIconView" />
              <span>{{ item.countryCode }} {{ item.areaCode }}</span>
            </div>
          </div>
        </template>
      </van-picker>
    </van-popup>
    <!-- 国家区号选择弹层 - end -->
  </div>
</template>

<script>
import { Toast, Dialog } from "vant";
import orgLogo from "@/components/orgLogo.vue";

export default {
  name: "Contact",
  components: {
    orgLogo,
  },
  data() {
    return {
      touristId: "", // 用户id

      userInfo: {},

      // login弹层相关
      dialog_login: false,
      title: "",
      login_radio: "Tel", // 选中的类型
      tel: "",
      mail: "",
      code: "",

      value: "+86", // 默认值
      icon: "",
      showPicker: false,
      showPickerCountry: false,
      countryList: [], // 国籍列表

      // 验证码相关
      show: true,
      count: "",
      timer: null,

      login_tip: false,
    };
  },
  watch: {
    // 重置登录框数据
    dialog_login(val) {
      if (val) {
        this.show = true;
        this.count = "";
        this.timer = null;
      }
    },
  },
  computed: {},
  created() {
    this.getCountryList();
    this.touristId = this.$route.query.touristId || this.$store.state.touristId;
  },
  mounted() {},
  methods: {
    close(){
      clearInterval(this.timer);
    },
    // 获取国家列表
    getCountryList() {
      this.$post("/getCountryList", {}).then((response) => {
        if (response.code == "success") {
          this.countryList = response.data;
          this.countryList = this.countryList.filter((item) => {
            return item.countryIconView;
          });
          this.getUserInfo();
        }
      });
    },
    // 获取用户信息
    getUserInfo() {
      let data = {
        touristId: this.touristId,
      };
      this.$post("/getUserInfo", data).then((res) => {
        if (res.code == "success") {
          this.userInfo = {
            phone: res.data.phone,
            mail: res.data.mail,
            phoneAreaCode: res.data.phoneAreaCode,
          };
          // 修改为只要进入签字页就显示联系方式弹窗
          this.countryList.forEach((item) => {
            if (item.countryCode == res.data.touristNationCode) {
              this.userInfo.phoneAreaCode = item.areaCode;
              this.userInfo.icon = item.countryIconView;
            }
          });
        } else {
          if (res.code == "200006") {
            this.$store.commit("setTouristId", "");
            location.reload();
          } else {
            Dialog.alert({
              message: res.msg,
              confirmButtonText: this.$t("App.alert_confirm"),
            }).then(() => {
              // on close
            });
          }
        }
      });
    },
    toEdit(type) {
      this.title =
        type == "Mail"
          ? this.$t("Contact.editmail")
          : this.$t("Contact.editphone");
      this.icon = this.userInfo.icon || "";
      this.value = this.userInfo.phoneAreaCode || "+86";
      this.tel = this.userInfo.phone;
      this.mail = this.userInfo.mail;
      this.code = "";
      this.login_radio = type;
      this.dialog_login = true;
    },
    // 发送验证码
    sendValidCode() {
      if (this.tel) {
        if (!/^[0-9]{8,16}$/.test(this.tel)) {
          Dialog.alert({
            message: this.$t("elf.input_tel_right"),
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            // on close
          });
          return;
        }
      }
      if (this.mail) {
        if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(this.mail)) {
          Dialog.alert({
            message: this.$t("elf.input_mail_right"),
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            // on close
          });
          return;
        }
      }
      if (
        (this.login_radio == "Tel" && this.tel) ||
        (this.login_radio == "Mail" && this.mail)
      ) {
        // 倒计时60s
        const TIME_COUNT = 60;
        if (!this.timer) {
          this.count = TIME_COUNT;
          this.show = false;
          this.timer = setInterval(() => {
            if (this.count > 0 && this.count <= TIME_COUNT) {
              this.count--;
            } else {
              this.show = true;
              clearInterval(this.timer);
              this.timer = null;
            }
          }, 1000);
        }

        let data = {
          contentDetail:
            this.login_radio == "Tel" ? this.value + this.tel : this.mail,
          validType: this.login_radio == "Tel" ? "1" : "2", // 1：手机号；2：邮箱
        };
        this.$post("/sendValidCode", data).then((response) => {
          if (response.code == "success") {
            this.login_tip = true;
          } else {
            Dialog.alert({
              message: response.msg,
              confirmButtonText: this.$t("App.alert_confirm"),
            }).then(() => {
              // on close
            });
          }
        });
      }
    },
    // 选中国家电话编号
    onConfirm(value) {
      this.value = value.areaCode;
      this.icon = value.countryIconView;
      this.showPicker = false;
    },
    // 校验验证码
    checkValidCode() {
      if (this.tel) {
        if (!/^[0-9]{8,16}$/.test(this.tel)) {
          Dialog.alert({
            message: this.$t("elf.input_tel_right"),
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            // on close
          });
          return;
        }
      }
      if (this.mail) {
        if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(this.mail)) {
          Dialog.alert({
            message: this.$t("elf.input_mail_right"),
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            // on close
          });
          return;
        }
      }
      if (this.login_radio == "Tel" && !this.tel) {
        Dialog.alert({
          message: this.$t("elf.input_tel"),
          confirmButtonText: this.$t("App.alert_confirm"),
        }).then(() => {
          // on close
        });
        return;
      }
      if (this.login_radio == "Mail" && !this.mail) {
        Dialog.alert({
          message: this.$t("elf.input_mail"),
          confirmButtonText: this.$t("App.alert_confirm"),
        }).then(() => {
          // on close
        });
        return;
      }
      if (!this.code) {
        Dialog.alert({
          message: this.$t("elf.input_code"),
          confirmButtonText: this.$t("App.alert_confirm"),
        }).then(() => {
          // on close
        });
        return;
      }
      if (
        (this.login_radio == "Tel" && this.tel) ||
        (this.login_radio == "Mail" && this.mail)
      ) {
        let data = {
          contentDetail:
            this.login_radio == "Tel" ? this.value + this.tel : this.mail,
          validCode: this.code, // 1：手机号；2：邮箱
        };

        this.$post("/checkValidCodeForUpdate", data).then((response) => {
          if (response.code == "success") {
            this.updateUserInfo();
          } else {
            Dialog.alert({
              message: response.msg,
              confirmButtonText: this.$t("App.alert_confirm"),
            }).then(() => {
              // on close
            });
          }
        });
      }
    },
    // 更新用户信息
    updateUserInfo() {
      let data = {
        touristId: this.touristId,
      };
      if (this.login_radio == "Tel") {
        data.phone = this.tel;
        data.phoneAreaCode = this.value;
      } else {
        data.mail = this.mail;
      }

      this.$post("/updateUserInfo", data).then((response) => {
        if (response.code == "success") {
          Dialog.alert({
            message: this.$t("Contact.success"),
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            // on close
            this.dialog_login = false;
            this.icon = "";
            this.value = "+86";
            this.tel = "";
            this.mail = "";
            this.code = "";
            this.show = true;
            this.timer = null;
            this.getUserInfo();
          });
        } else {
          Toast(response.msg);
        }
      });
    },
    // 返回上一页
    toBack() {
      this.$router.go(-1);
    },
  },
};
</script>
