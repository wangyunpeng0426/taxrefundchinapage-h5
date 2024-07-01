<template>
  <div id="app">
    <template v-show="orientation">
      <router-view v-wechat-title="$route.meta.title" />
      <elf v-if="!elf_show"></elf>
    </template>
    <div id="orientation-tip" v-show="!orientation">
      <i class="icon"></i>
      <p>{{ $t("App.for_better") }}</p>
    </div>
  </div>
</template>
<script>
window.onload = function () {
  var lastTouchEnd = 0;
  document.addEventListener("touchstart", function (event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  });
  document.addEventListener(
    "touchend",
    function (event) {
      var now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );

  document.addEventListener("gesturestart", function (event) {
    event.preventDefault();
  });
  document.addEventListener("dblclick", function (event) {
    event.preventDefault();
  });
};
import { Dialog } from "vant";
import elf from "@/components/elf.vue";
import { matchBrowserVesion, getPath } from "@/utils/tools";
import { mapGetters, mapMutations } from 'vuex';

export default {
  components: {
    elf,
  },
  data() {
    return {
      orientation: true,
      sign: false,
      fullHeight: document.documentElement.clientHeight,
      height: 0,
      show: true,
      orderShow: true,
      footerIcon: "",
      touristId:
        this.$route.query.touristId || this.$store.state.touristId || "",
      lang: "",

      elf_show: false,
    };
  },
  computed: {
    ...mapGetters(["taxRefundType"]),
  },
  watch: {
    fullHeight() {
      if (this.orderShow === false) {
        this.show = false;
      } else {
        if (this.fullHeight <= this.height * 0.7) {
          this.show = false;
        } else {
          this.show = true;
        }
      }
    },
    "$route.path"(val) {
      if (val == "/Sign") {
        this.orientation = true;
      } else {
        let width = document.documentElement.clientWidth;
        let height = document.documentElement.clientHeight;
        if (window.orientation === 90 || window.orientation === -90) {
          this.orientation = false;
        } else {
          this.orientation = true;
        }
      }
    },
    "$store.state.langShow"(val) {
      this.elf_show = val;
    },
    "$store.state.tag"(val) {
      if (JSON.stringify(val) == "{}") {
        this.getLabel();
      }
    },
  },
  created() {
    if (this.$route.name == "Index" && this.$route.query.stats != "enable") {
      this.$nextTick(() => {
        this.elf_show = true;
      });
    } else {
      this.$nextTick(() => {
        this.elf_show = false;
      });
    }
  },
  mounted() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
      console.log("微信端");
      hina.registerCommonProperties({
        H_os_version: '微信端',
      })
    } else if (ua.match(/Alipay/i) == "alipay") {
      console.log("支付宝端");
      hina.registerCommonProperties({
        H_os_version: '支付宝端',
      })
    } else {
      console.log("其他浏览器");
      hina.registerCommonProperties({
        H_os_version: '其他浏览器',
      })
    }

    this.renderResize();
    window.addEventListener("resize", this.renderResize, false);
    window.addEventListener("offline", () => {
      Dialog.alert({
        message: this.$t("App.no_wifi"),
        confirmButtonText: this.$t("App.alert_confirm"),
      }).then(() => {
      });
    });
    this.getLabel();
    this.buryingPoint();
    if(this.touristId && this.taxRefundType === "Cash") {
      this.$postNoLoading("/getTaxOrderAndGuanranteeList", {
        touristId: this.touristId,
        pageSize: 1,
        pageNo: 1,
        orderStatus: "1",
        taxRefundType: "1"
      }).then((response) => {
        if (response.code == "success") {
          if(response.data.taxOrderList.length > 0) {
            if(response.data.taxOrderList[0].guanranteeState === "4") {
              localStorage.setItem("OrderSign", response.data.taxOrderList[0].orderSign);
              this.$router.push({
                path: `/Sign`,
                query: {
                  touristId: this.touristId,
                  cardId: response.data.taxOrderList[0].cardId,
                  taxOrderId: response.data.taxOrderList[0].orderId,
                  isSign: 1,
                },
              })
            } else {
              this.$router.push({
                path: `/CashQrcode`,
                query: {
                  taxOrderId: response.data.taxOrderList[0].orderId,
                },
              })
            }
          } else {
            localStorage.setItem("noticeContent", "");
            if(this.$route.name === "CashQrcode") {
              this.setTaxRefundType("");
              this.setPage("Passport,BankCard");
              this.$router.push({ path: "/Passport" });
            }
          }
        }
      });
    }
  },
  methods: {
    ...mapMutations(["setTaxRefundType", "setPage"]),
    renderResize() {
      if (window.orientation === 90 || window.orientation === -90) {
        console.log("横屏1");
        if (this.$route.path == "/Sign") {
          this.orientation = true;
        } else {
          this.orientation = false;
        }
      } else {
        console.log("素平2");
        this.orientation = true;
      }
    },
    getLabel() {
      if (
        JSON.stringify(this.$store.state.tag) == "{}" &&
        JSON.stringify(this.$store.state.langInfo) == "{}"
      ) {
        let data = {
          language: "46",
        };
        this.$post("/tag/getTagList", data).then((response) => {
          if (response.code == "success") {
            this.$store.commit("setLangInfo", {
              lang: "en-US",
              lan: 46,
            });
            this.$store.commit("setTag", response.data);
            this.$i18n.locale = "en-US";
            this.$i18n.setLocaleMessage("en-US", this.$store.state.tag);
          }
        });
      }
    },
    buryingPoint(params) {
      window.addEventListener('error', (reason) => {
          const { filename, message, error } = reason;
          hina.track(
            'error',
            {
              errorType: 'js_error',
              errorPath: filename,
              info : message,
              errorData : error.toString(),
            }
          );
      })
      document.addEventListener('click', (e) => {
        const { className, outerHTML, innerText } = e.target
        hina.track(
          'click_handle',
          {
            className: className,
            outerHTML: outerHTML,
            innerText: innerText,
            clickPath: this.$route.fullPath,
            H_element_selector: getPath(e.target)
          }
        )
      })
      var browserInfo = matchBrowserVesion()
      hina.registerCommonProperties({
        H_os: window.navigator.userAgent,
        H_browser: browserInfo?.browser ?? "未知",
        H_browser_version: browserInfo?.version ?? "0",
        H_browser_lang: window.navigator.language.replace(/-(\s*)/, ''),

      })
      hina.setUserUId(this.touristId)
    }
  },
};
</script>
