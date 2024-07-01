<template>
  <div class="elf-component">
    <!-- 小精灵 - start -->
    <div
      ref="elf"
      class="elf"
      id="elf"
      v-show="elfShow && !dialog.agreement && !dialog.prompt"
      @touchstart="start"
      @touchmove="move"
      @touchend="end"
      @click="elfClick()"
      :style="{ top: top + 'px', left: left + 'px' }"
    >
      <img src="../assets/image/elf-logo.png" />
    </div>
    <!-- 小精灵 - end -->

    <!-- 侧边栏 - start -->
    <van-popup
      ref="pop"
      id="pop"
      v-model="popShow"
      :position="popPostion"
      :style="{ width: '67%', height: '100%' }"
    >
      <div class="content">
        <div class="title">{{ $t("elf.pop_menu") }}</div>
        <div class="group">
          <div class="row" @click="toJump('Login')">
            <div class="icon-block">
              <img src="../assets/image/1.png" />
            </div>
            <div class="text-block" v-if="touristIdShowMenu">
              {{ $t("elf.pop_form") }}
            </div>
            <div class="text-block" v-else>{{ $t("elf.pop_login") }}</div>
          </div>
          <div class="row" @click="toJump('Contact')" v-if="touristId">
            <div class="icon-block">
              <img src="../assets/image/6.png" />
            </div>
            <div class="text-block">{{ $t("elf.pop_mailphone") }}</div>
          </div>
          <div class="row" @click="toJump('About')">
            <div class="icon-block">
              <img src="../assets/image/2.png" />
            </div>
            <div class="text-block">{{ $t("elf.pop_about") }}</div>
          </div>
          <div class="row" @click="toJump('Language')">
            <div class="icon-block">
              <img src="../assets/image/3.png" />
            </div>
            <div class="text-block">{{ $t("elf.pop_lang") }}</div>
          </div>
          <div class="row" @click="toJump('Suggestions')">
            <div class="icon-block">
              <img src="../assets/image/4.png" />
            </div>
            <div class="text-block">{{ $t("elf.pop_support") }}</div>
          </div>
          <div class="row" @click="toJump('Exit')" v-if="touristIdShowMenu">
            <div class="icon-block">
              <img src="../assets/image/5.png" />
            </div>
            <div class="text-block">{{ $t("elf.pop_logout") }}</div>
          </div>
        </div>
        <div
          style="
            position: absolute;
            bottom: 0.3rem;
            right: 0.3rem;
            font-size: 0.3rem;
          "
        >
          V{{ version }}
        </div>
      </div>
    </van-popup>
    <!-- 侧边栏 - end -->

    <!-- 选择语言弹层 - start -->
    <van-dialog v-model="dialog.lang" :show-confirm-button="false">
      <div class="lang">
        <van-radio-group v-model="radio">
          <van-cell-group v-for="item in langList" :key="item.dictCode">
            <van-cell clickable @click="radio = item.dictCode">
              <template #title>
                <!-- <img :src="item.dictValue" /> -->
                <span
                  :class="radio == item.dictCode ? 'moutn' : 'custom-title'"
                  >{{ item.dictLabel }}</span
                >
              </template>
              <template #right-icon v-if="radio == item.dictCode">
                <van-radio :name="item.dictCode" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
        <div class="agree" v-if="dialog.agreement">
          <van-checkbox v-model="checked" checked-color="#594ab1">
            I agree to the
            <a class="agree-link" @click.stop="toAgreement"
              >《Service Agreement》</a
            >
          </van-checkbox>
        </div>
        <div class="btn-group">
          <van-button
            class="btn"
            block
            :disabled="(dialog.agreement && !checked) || !radio"
            @click="getLabel(radio)"
            >{{ $t("elf.dialog_btn") }}</van-button
          >
        </div>
      </div>
    </van-dialog>
    <!-- title="温馨提示" -->
    <van-dialog v-model="dialog.prompt" :show-confirm-button="false">
      <div
        style="width: 100%; height: 56px; line-height: 56px; text-align: center"
      >
        {{ $t("Agreement.tip") }}
      </div>
      <div style="width: 100%; padding: 0.1rem 0.4rem 1rem 0.4rem">
        {{ $t("Agreement.prompt_front") }}{{ promptRecoverDays
        }}{{ $t("Agreement.prompt_behind") }}
      </div>
      <div
        @click="closePrompt()"
        :style="{
          width: '100%',
          height: '1rem',
          display: 'flex',
          'justify-content': 'center',
          'align-items': 'center',
          border: '1px solid rgba(242, 242, 242, 1)',
          color: dialog.promptDisabled === 0 ? '#47007F' : '#7F7F7F',
        }"
      >
        {{ $t("Agreement.knowed")
        }}<span v-if="dialog.promptDisabled !== 0"
          >({{ dialog.promptDisabled }})</span
        >
      </div>
    </van-dialog>
    <!-- 选择语言弹层 - end -->

    <!-- 登录弹层 - start -->
    <van-popup
      class="login-pop"
      v-model="dialog.login"
      closeable
      :style="{ height: 'auto' }"
    >
      <div class="content">
        <div class="content-top">
          <div class="title">{{ $t("elf.welcome") }}</div>
          <div class="radio">
            <van-radio-group v-model="login_radio" direction="horizontal">
              <van-radio name="Tel" checked-color="#594ab1">{{
                $t("elf.tel")
              }}</van-radio>
              <van-radio name="Mail" checked-color="#594ab1">{{
                $t("elf.mail")
              }}</van-radio>
            </van-radio-group>
          </div>
          <div class="input">
            <div class="tel" v-show="login_radio == 'Tel'">
              <van-cell-group class="tel-group">
                <van-field
                  class="tel-country"
                  readonly
                  clickable
                  :value="value"
                  @click="
                    () => {
                      if (!login_notchange) {
                        showPicker = true;
                      }
                    }
                  "
                  :disabled="login_notchange"
                  :left-icon="
                    icon ? icon : require(`../assets/image/flags/cn.png`)
                  "
                />
                <div class="line"></div>
                <van-field
                  class="tel-input"
                  v-model.trim="tel"
                  :disabled="login_notchange"
                  maxlength="16"
                  :placeholder="$t('elf.input_tel')"
                />
              </van-cell-group>
              <van-cell-group class="code-group" style="margin-top: 0.2rem">
                <van-field v-model="telCode" maxlength="6" />
                <van-button
                  type="default"
                  style="height: auto"
                  v-show="telShow"
                  @click="sendValidCode"
                  :disabled="login_radio == 'Tel' && !tel"
                  >{{ $t("elf.getcode") }}</van-button
                >
                <van-button v-show="!telShow" type="default"
                  >{{ telCount }}s
                </van-button>
              </van-cell-group>
            </div>
            <div class="tel" v-show="login_radio == 'Mail'">
              <van-cell-group class="tel-group">
                <van-field
                  class="tel-input"
                  v-model.trim="mail"
                  maxlength="50"
                  :disabled="login_notchange"
                  :placeholder="$t('elf.input_mail')"
                />
              </van-cell-group>
              <van-cell-group class="code-group" style="margin-top: 0.2rem">
                <van-field v-model="mailCode" maxlength="6" />
                <van-button
                  type="default"
                  style="height: auto"
                  v-show="mailShow"
                  @click="sendValidCode"
                  :disabled="login_radio == 'Mail' && !mail"
                  >{{ $t("elf.getcode") }}</van-button
                >
                <van-button v-show="!mailShow" type="default"
                  >{{ mailCount }}s
                </van-button>
              </van-cell-group>
            </div>
            <!-- <div class="tel">
              <van-cell-group class="code-group">
                <van-field v-model="code" maxlength="6" />
                <van-button
                  type="default"
                  style="height: auto"
                  v-show="show"
                  @click="sendValidCode"
                  :disabled="
                    (login_radio == 'Tel' && !tel) ||
                    (login_radio == 'Mail' && !mail)
                  "
                  >{{ $t("elf.getcode") }}</van-button
                >
                <van-button v-show="!show" type="default"
                  >{{ count }}s
                </van-button>
              </van-cell-group>
            </div> -->
          </div>
        </div>
      </div>
      <div class="btn-group-follow">
        <div class="btn-group">
          <div class="btn" @click="checkValidCode">
            <span>{{ $t("elf.btn") }}</span>
          </div>
        </div>
      </div>
    </van-popup>
    <!-- 登录弹层 - end -->

    <!-- 关于我们 - start -->
    <van-popup
      class="about-pop"
      v-model="dialog.about"
      closeable
      :style="{ height: '85%' }"
    >
      <div class="content">
        <div class="block">
          <div class="title">{{ $t("elf.title_company") }}</div>
          <div class="label">
            {{ $t("elf.label_company") }}
          </div>
        </div>
        <div class="block">
          <div class="title">{{ $t("elf.title_program") }}</div>
          <div class="label">{{ $t("elf.version") }}</div>
        </div>
        <div class="block">
          <div class="title">{{ $t("elf.title_mail") }}</div>
          <div class="label">{{ $t("elf.mail_code") }}</div>
        </div>
        <div class="block">
          <div class="title">
            {{ $t("elf.title_picture") }}
          </div>
          <div class="img"><img src="../assets/image/mail.png" /></div>
        </div>
        <!-- <div class="block" style="padding-bottom: 0.3rem">
          <div class="title">
            {{ $t("elf.title_supported") }}<br />{{
              $t("elf.title_supported_1") ? "" : ""
            }}
          </div>
          <div class="label point">
            {{ $t("elf.label_bj_jct2") }}
          </div>
          <div class="label point">
            {{ $t("elf.label_bj_jct3") }}
          </div>
          <div class="label point">
            {{ $t("elf.label_bj_dxjc") }}
          </div>
          <div class="label point">
            {{ $t("elf.label_sy_tx") }}
          </div>
          <div class="label point">
            {{ $t("elf.label_sy_qps") }}
          </div>
        </div> -->
      </div>
    </van-popup>
    <!-- 关于我们 - end -->

    <!-- 建议弹层 - start -->
    <van-popup
      class="suggestions-pop"
      v-model="dialog.suggestions"
      closeable
      :style="{ height: '70%' }"
    >
      <div class="content">
        <div class="block">
          <p class="block-title">
            {{ $t("Suggestions.title") }}
          </p>
          <p class="block-title">
            <span>{{ length }}</span
            >/1500
          </p>
        </div>
        <div class="field">
          <van-field
            v-model="msgboardContent"
            rows="6"
            type="textarea"
            maxlength="1500"
          />
        </div>
        <div class="block">
          <p class="block-text">
            {{ $t("Suggestions.text") }}
          </p>
        </div>
        <!-- <div class="block">
          <p class="block-text">
            {{ $t("Suggestions.teltip") }}
            <span>
              <van-icon name="phone-o" />
              <a :href="'tel://' + this.$t('Suggestions.tel')">
                {{ $t("Suggestions.tel") }}</a
              >
            </span>
          </p>
        </div> -->
      </div>
      <div class="btn-group-bottom">
        <div class="btn-group">
          <div class="btn" @click="toSubmit">
            <span>{{ $t("Suggestions.submit") }}</span>
          </div>
        </div>
      </div>
    </van-popup>
    <!-- 建议弹层 - end -->

    <!-- 国家选择弹层 - start -->
    <van-popup
      v-model="showPicker"
      class="country-model"
      round
      position="bottom"
    >
      <van-picker
        show-toolbar
        :columns="countryList"
        :confirm-button-text="$t('Passport.pop_confirm')"
        :cancel-button-text="$t('Passport.pop_cancel')"
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
    <!-- 国家选择弹层 - end -->

    <!-- 协议弹层 - start -->
    <!-- 协议弹层 - start -->
    <van-dialog
      v-model="dialog_agreement"
      :show-confirm-button="false"
      :overlay="false"
      class="agreement-dialog main"
    >
      <template #title>
        <div>
          <div style="margin: 0px 32px">
            <span class="dialog-agreement-title" v-if="radio == 46"
              >The User Service Agreement of Instant Refund</span
            >
            <span class="dialog-agreement-title" v-if="radio == 45"
              >離境即時退用戶服務協議</span
            >
            <span class="dialog-agreement-title" v-if="radio == 44"
              >离境即时退用户服务协议</span
            >
            <span class="dialog-agreement-title" v-if="radio == 49"
              >Соглашение о услугах по мгновенному возврату</span
            >
          </div>
          <span class="dialog-close-icon"
            ><van-icon name="clear" @click="dialog_agreement = false"
          /></span>
        </div>
      </template>
      <div class="agreement" v-if="radio == 46">
        <agreeMentEn :childPrivacy="parentPrivacy" />
      </div>
      <div class="agreement" v-if="radio == 45">
        <agreeMentZh :childPrivacy="parentPrivacy" />
      </div>
      <div class="agreement" v-if="radio == 44">
        <agreeMentZn :childPrivacy="parentPrivacy" />
      </div>
      <div class="agreement" v-if="radio == 49">
        <agreeMentRu :childPrivacy="parentPrivacy" />
      </div>
    </van-dialog>
    <!-- 协议弹层 - start -->
    <van-dialog
      v-model="agreementType"
      :show-confirm-button="false"
      :overlay="false"
      class="agreement-dialog main"
    >
      <template #title>
        <div>
          <span class="dialog-agreement-title">{{ title }}</span>
          <span class="dialog-close-icon"
            ><van-icon
              name="clear"
              @click="
                agreementType = false;
                dialog_agreement = true;
              "
          /></span>
        </div>
      </template>
      <div class="agreement" v-if="radio == 46">
        <privacyEn />
      </div>
      <div class="agreement" v-if="radio == 45">
        <privacyZh />
      </div>
      <div class="agreement" v-if="radio == 44">
        <privacyZn />
      </div>
      <div class="agreement" v-if="radio == 49">
        <privacyRu />
      </div>
    </van-dialog>
    <!-- 协议弹层 - end -->
  </div>
</template>

<script>
import { Dialog } from "vant";
import { mapGetters, mapMutations } from "vuex";
import agreeMentEn from "@/components/agreeMentEn.vue";
import privacyEn from "@/components/privacyEn.vue";
import agreeMentRu from "@/components/agreeMentRu.vue";
import agreeMentZh from "@/components/agreeMentZh.vue";
import privacyZh from "@/components/privacyZh.vue";
import privacyRu from "@/components/privacyRu.vue";
import agreeMentZn from "@/components/agreeMentZn.vue";
import privacyZn from "@/components/privacyZn.vue";
export default {
  components: {
    agreeMentEn,
    privacyEn,
    agreeMentZh,
    privacyRu,
    privacyZh,
    agreeMentRu,
    agreeMentZn,
    privacyZn,
  },
  data() {
    return {
      // 小精灵相关
      changeLanguaged: false,
      elfShow: true,
      popPostion: "left",
      popShow: false,
      flags: false,
      position: { x: 0, y: 0, left: 0, top: 0 },
      top: 240,
      left: 0,
      width:
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth,
      height:
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight,

      touristId: this.$route.query.touristId || this.$store.state.touristId,
      pathName: this.$route.name,

      // 弹层状态
      dialog: {
        lang: false,
        login: false,
        about: false,
        suggestions: false,
        agreement: false,
        prompt: false,
        promptDisabled: 5,
      },

      // lang弹层相关
      radio: "",
      checked: false,
      langList: [],
      language: "",
      // checked: false,
      dialog_agreement: false,
      agreementType: false,

      // login弹层相关
      login_radio: "Tel",
      login_notchange: false,
      tel: "",
      mail: "",
      code: "",
      telCode: "",
      mailCode: "",
      type: true,

      value: "+86",
      icon: "",
      showPicker: false,
      countryList: [], // 国籍列表

      show: true,
      count: "",
      timer: null,
      telCount: "",
      telShow: true,
      mailCount: "",
      mailShow: true,
      telTimer: null,
      mailTimer: null,

      // about弹层相关
      version: process.env.APP_VERSION,

      // suggestions弹层相关
      msgboardContent: "",
      length: 0,
      promptTimer: null,
      openPrompt: true,
    };
  },
  watch: {
    // 侧边栏打开时 小精灵不显示
    popShow(val) {
      if (!val) {
        let that = this;
        setTimeout(function () {
          that.elfShow = true;
        }, 300);
        if (this.popPostion == "left") {
          this.left = 0;
        } else {
          let width = window.innerWidth - this.$refs.elf.clientWidth;
          this.left = width + "px";
        }
      } else {
        this.elfShow = false;
      }
    },
    // 未选择语言时 小精灵不显示
    "$store.state.langInfo"(val) {
      if (JSON.stringify(val) != {} || JSON.stringify(val) != null) {
        this.changeLanguaged = true;
      } else {
        this.changeLanguaged = false;
      }
    },
    // login_radio(val) {
    //   if (val == "Tel") {
    //     this.mail = "";
    //   } else {
    //     this.tel = "";
    //   }
    // },
    // 显示建议字数
    msgboardContent() {
      this.length = this.msgboardContent.length;
    },
    // 移除默认移动事件
    flags(val) {
      if (!val) {
        let page = document.getElementById("app");
        page.removeEventListener("touchmove", this.moveDefault, {
          passive: false,
        });
      }
    },
    $route() {
      this.touristId =
        this.$route.query.touristId || this.$store.state.touristId;
    },
  },
  computed: {
    ...mapGetters(["promptRecoverDays", "partnerSourceId"]),
    touristIdShowMenu() {
      if (this.$store.state.touristId) {
        return true;
      } else {
        return false;
      }
    },
  },
  created() {
    this.getCountryList();
  },
  mounted() {
    if (
      JSON.stringify(this.$store.state.langInfo) != {} ||
      JSON.stringify(this.$store.state.langInfo) != null
    ) {
      this.changeLanguaged = true;
    } else {
      this.changeLanguaged = false;
    }
    this.$bus.$on("openLanguageDialog", (flag = true) => {
      this.openPrompt = flag;
      if (!this.checked) {
        this.getLanguageList();
        this.tel = "";
        this.mail = "";
        this.code = "";
        this.telCode = "";
        this.mailCode = "";
        this.checked = false;
        this.dialog.lang = true;
        this.dialog.agreement = true;
      } else {
        if (!this.dialog.agreement && this.openPrompt) {
          this.openPromptDialog();
        }
      }
    });
    this.$bus.$on("openPromptDialog", (flag = true) => {
      this.openPromptDialog();
    });
    this.$bus.$on("closePromptDialog", (flag = true) => {
      this.closePromptDialog();
    });
    this.$bus.$on("openLoginDialog", (data) => {
      this.login_notchange = true;
      this.login_radio = data.login_radio || "Tel";
      this.tel = data.tel || "";
      this.value = data.value || "";
      if (this.value) {
        let node = this.countryList.find(
          (item) => item.areaCode === this.value
        );
        this.icon = node?.icon ?? "";
      }
      this.mail = data.mail || "";
      this.dialog.login = true;
    });
    this.$bus.$on("changeElfShow", (elfShow) => {
      this.elfShow = elfShow;
    });
  },
  methods: {
    ...mapMutations(["setCountryList", "setChinaCountryList", "setUserInfo"]),
    // 显示协议
    toAgreement() {
      this.agreementType = false;
      this.dialog_agreement = true;
    },
    // 显示子协议
    parentPrivacy(title) {
      this.dialog_agreement = false;
      this.agreementType = true;
      this.title = title;
    },
    // 获取国家列表
    getCountryList() {
      this.$post("/getCountryList", {}).then((res) => {
        if (res.code == "success") {
          this.countryList = res.data;
          this.countryList = this.countryList.filter((item) => {
            return item.countryIconView;
          });
          this.setCountryList(this.countryList);
          this.setChinaCountryList(
            this.countryList.filter(
              (item) =>
                item.countryCode === "MAC" ||
                item.countryCode === "HKG" ||
                item.countryCode === "TWN"
            )
          );
          if (this.$store.state.touristId) {
            let data = {
              touristId: this.$store.state.touristId,
            };
            this.$post("/getUserInfo", data).then((res2) => {
              if (res2.code == "success") {
                // 修改为只要进入签字页就显示联系方式弹窗
                this.countryList.forEach((item) => {
                  if (item.countryCode == res2.data.touristNationCode) {
                    this.value = item.areaCode;
                    this.icon = item.countryIconView;
                  }
                });
                // this.setUserInfo(res2.data);
              }
            });
          }
        }
      });
    },
    // 点击显示侧边栏
    elfClick() {
      if (!this.popShow) {
        this.popShow = true;
        if (this.left < window.innerWidth / 2) {
          this.popPostion = "left";
        } else {
          this.popPostion = "right";
        }
      }
    },
    // 拖动开始的操作
    start() {
      this.flags = true;
      if (this.elfShow) {
        // const refs = document.getElementById("elf").getBoundingClientRect() || {};
        const refs = this.$refs.elf.getBoundingClientRect();
        let touch = event;
        if (event.touches) {
          touch = event.touches[0];
        }
        this.position.x = touch.clientX;
        this.position.y = touch.clientY;
        this.position.left = refs.left;
        this.position.top = refs.top;
      }
    },
    // 拖动中的操作
    move() {
      if (!this.popShow) {
        if (this.flags) {
          this.$refs.elf.style.borderRadius = "0.15rem";
          let touch = event;
          if (event.touches) {
            touch = event.touches[0];
          }
          const xPum = this.position.left + touch.clientX - this.position.x;
          const yPum = this.position.top + touch.clientY - this.position.y;
          this.left = xPum;
          this.top = yPum;
          this.banOut();

          let page = document.getElementById("app");
          // 阻止页面的滑动默认事件
          page.addEventListener("touchmove", this.moveDefault, {
            passive: false,
          });
        }
      }
    },
    // 拖动结束的操作
    end() {
      // 屏幕宽度 - 小精灵宽度
      if (this.popShow) {
        return;
      } else {
        if (this.left < (window.innerWidth - this.$refs.elf.clientWidth) / 2) {
          this.left = 0;
          this.$refs.elf.style.borderRadius = "0 0.15rem 0.15rem 0";
        } else {
          this.left = window.innerWidth;
          this.$refs.elf.style.borderRadius = "0.15rem 0 0 0.15rem";
        }
      }

      this.banOut();
      this.flags = false;
    },
    // 避免拖动出界的限制
    banOut() {
      // const refs = document.getElementById("elf").getBoundingClientRect() || {};
      const refs = this.$refs.elf.getBoundingClientRect();
      if (this.left < 0) {
        this.left = 0;
      } else if (this.left > this.width - refs.width) {
        this.left = this.width - refs.width;
      }
      if (this.top < 0) {
        this.top = 0;
      } else if (this.top > this.height - refs.height) {
        this.top = this.height - refs.height;
      }
    },
    // 获取语言列表
    getLanguageList() {
      let lang =
        JSON.stringify(this.$store.state.langInfo) != {}
          ? this.$store.state.langInfo.lang
          : ""; //常规浏览器语言和IE浏览器 e.g. => en-US
      let lan = lang?.substr(0, 2); //截取lang前2位字符 e.g. => en
      this.$get("/getLanList", {}).then((response) => {
        if (response.code == "success") {
          this.langList = response.data;
          this.dialog_lang = true;
          let lostal = JSON.parse(localStorage.getItem("langInfo"));
          if (lostal) {
            this.radio = lostal.lan;
            this.language = lostal.lang;
          } else {
            this.radio = 44;
            this.language = "zh-CN";
          }
          // for (let i = 0; i < this.langList.length; i++) {
          //   if (lang.toUpperCase() == this.langList[i].remark.toUpperCase()) {
          //     this.language = this.langList[i].remark; // e.g. => zh-CN
          //     this.radio = this.langList[i].dictCode; // e.g. => 44
          //     return;
          //   } else {
          //     if (lan.toUpperCase() == "ZH") {
          //       this.radio = 45;
          //       this.language = "zh-CHT";
          //       return;
          //     } else {
          //       this.radio = 46;
          //       this.language = "en-US";
          //       return;
          //     }
          //   }
          // }
        }
      });
    },
    // 获取语言相关文字
    getLabel(radio) {
      let data = {
        language: radio,
      };
      this.$post("/tag/getTagList", data).then((response) => {
        if (response.code == "success") {
          for (let i = 0; i < this.langList.length; i++) {
            if (radio == this.langList[i].dictCode) {
              this.language = this.langList[i].remark;
            }
          }
          if (this.$store.state.touristId) {
            // 每次切换语种时更新用户语种
            let data = {
              touristId: this.$store.state.touristId,
              language: radio,
            };
            this.$post("/updateUserInfo", data).then((response) => {
              if (response.code == "success") {
                console.log();
              }
            });
          }
          this.$store.commit("setLangInfo", {
            lang: this.language, // e.g. => zh-CN
            lan: this.radio, // e.g. => 44
          });
          this.$store.commit("setTouristId", this.$store.state.touristId || ""); // 缓存 - 用户id
          this.$store.commit("setTag", "");
          this.$store.commit("setTag", response.data); // 缓存 - 标签内容
          this.$i18n.locale = this.language;
          this.$i18n.setLocaleMessage(
            `${this.language}`,
            this.$store.state.tag
          );
          this.dialog.lang = false;
          console.log(this.dialog.agreement);
          // if (this.dialog.agreement && this.openPrompt) {
          //   this.openPromptDialog();
          // }
          this.dialog.agreement = false;
          this.radio = "";
          //打开提示弹窗
        }
      });
    },
    openPromptDialog() {
      this.dialog.promptDisabled = 5;
      this.dialog.prompt = true;
      this.promptTimer = setInterval(() => {
        this.dialog.promptDisabled--;
        if (this.dialog.promptDisabled === 0) {
          clearInterval(this.promptTimer);
        }
      }, 1000);
    },
    closePromptDialog() {
      this.dialog.promptDisabled = 5;
      this.dialog.prompt = false;
      if (this.promptTimer) {
        clearInterval(this.promptTimer);
      }
    },
    closePrompt() {
      if (this.dialog.promptDisabled === 0) {
        this.dialog.prompt = false;
      }
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
          if (this.login_radio == "Tel") {
            this.telCount = TIME_COUNT;
            this.telShow = false;
            this.telTimer = setInterval(() => {
              if (this.telCount > 0 && this.telCount <= TIME_COUNT) {
                this.telCount--;
              } else {
                this.telShow = true;
                clearInterval(this.telTimer);
                this.telTimer = null;
              }
            }, 1000);
          } else {
            this.mailCount = TIME_COUNT;
            this.mailShow = false;
            this.mailTimer = setInterval(() => {
              if (this.mailCount > 0 && this.mailCount <= TIME_COUNT) {
                this.mailCount--;
              } else {
                this.mailShow = true;
                clearInterval(this.mailTimer);
                this.mailTimer = null;
              }
            }, 1000);
          }
        }

        let data = {
          contentDetail:
            this.login_radio == "Tel" ? this.value + this.tel : this.mail,
          validType: this.login_radio == "Tel" ? "1" : "2", // 1：手机号；2：邮箱
        };
        this.$post("/sendValidCode", data).then((response) => {
          if (response.code == "success") {
            console.log();
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
      if (this.login_radio == "Tel" && this.telCode == "") {
        Dialog.alert({
          message: this.$t("elf.input_code"),
          confirmButtonText: this.$t("App.alert_confirm"),
        }).then(() => {
          // on close
        });
        return;
      }
      if (this.login_radio == "Mail" && this.mailCode == "") {
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
          validCode: this.login_radio == "Tel" ? this.telCode : this.mailCode, // 1：手机号；2：邮箱
        };

        this.$post("/checkValidCode", data).then((response) => {
          if (response.code == "success") {
            this.$store.commit("setDateUrl", "");
            this.$store.commit("setEntrySealUrl", "");
            this.$store.commit("setExitSealUrl", "");
            this.$store.commit("setEntrySealBase", "");
            this.$store.commit("setExitSealBase", "");
            this.$store.commit("setDateOfEntry", ""); // 港澳台离境时间
            this.dialog.login = false;
            this.$store.commit("setTouristId", response.data); // 缓存 - 用户id
            this.$router.push({
              path: `/OrderInfo`,
              query: {
                touristId: this.$route.query.touristId,
              },
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
      }
    },
    // 点击提交
    toSubmit() {
      if (!this.msgboardContent) {
        Dialog.alert({
          message: this.$t("elf.input_suggestion"),
          confirmButtonText: this.$t("App.alert_confirm"),
        }).then(() => {
          // on close
        });
        return;
      }
      let data = {
        msgboardContent: this.msgboardContent,
        touristId: this.touristId,
      };
      this.$post("/saveMsg", data).then((response) => {
        if (response.code == "success") {
          Dialog.alert({
            message: this.$t("elf.suggestion_finish"),
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            this.msgboardContent = "";
            this.dialog.suggestions = false;
            // on close
          });
        }
      });
    },
    // 点击侧边栏跳转事件
    toJump(name) {
      for (let item in this.dialog) {
        this.dialog[item] = false;
      }
      if (name == "Language") {
        this.getLanguageList();
        this.tel = "";
        this.mail = "";
        this.code = "";
        this.telCode = "";
        this.mailCode = "";
        this.dialog.lang = true;
      } else if (name == "About") {
        this.dialog.about = true;
      } else if (name == "Suggestions") {
        this.dialog.suggestions = true;
      } else if (name == "Login") {
        this.touristId =
          this.$route.query.touristId || this.$store.state.touristId;
        if (this.touristId) {
          if (this.pathName != "OrderInfo") {
            this.$router.push({
              path: `/OrderInfo`,
              query: {
                touristId: this.touristId,
              },
            });
          }
        } else {
          this.login_notchange = false;
          this.dialog.login = true;
        }
      } else if (name == "Exit") {
        Dialog.confirm({
          message: this.$t("elf.makesurelogout"),
          confirmButtonText: this.$t("App.dialog_confirm"),
          cancelButtonText: this.$t("App.dialog_cancel"),
        })
          .then(() => {
            // 注销 1.清空缓存 2.清空touristId 3.清空header选中
            this.$store.commit("setLangShow", "true");
            this.$store.commit("setLangInfo", {});
            this.$store.commit("setTouristId", "");
            this.$store.commit("setCardId", "");
            this.$store.commit("setTag", {});
            this.$store.commit("setPage", "Passport");
            this.$store.commit("setEntrySealUrl", "");
            this.$store.commit("setExitSealUrl", "");
            this.$store.commit("setEntrySealBase", "");
            this.$store.commit("setExitSealBase", "");
            this.$store.commit("setDateOfEntry", "");
            this.$store.commit("setDateUrl", "");
            this.$store.commit("setTaxRefundType", "");
            this.checked = false;
            this.openPrompt = true;
            if (this.partnerSourceId) {
              this.$router.push({
                path: "/Position",
                query: {
                  reload: "1",
                },
              });
            } else {
              if (this.$route.name == "Passport") {
                location.href = "/Passport?pageType=1";
              } else {
                this.$router.push({
                  path: "/Passport",
                  query: {
                    pageType: "1",
                    reload: "1",
                  },
                });
              }
            }
            // on close
          })
          .catch(() => {
            // on cancel
          });
      } else if (name == "Contact") {
        if (this.$route.name != "Contact") {
          this.touristId =
            this.$route.query.touristId || this.$store.state.touristId;
          if (this.touristId) {
            if (this.pathName != "Contact") {
              this.$router.push({
                path: `/Contact`,
                query: {
                  touristId: this.touristId,
                },
              });
            }
          }
        }
      }

      this.popShow = false;
    },
    // 默认移动事件
    moveDefault() {
      event.preventDefault();
    },
  },
};
</script>
