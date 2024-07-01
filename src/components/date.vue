<template>
  <div class="page">
    <div class="date">
      <template>
        <div class="content-1">
          <div class="content-bottom">
            <van-cell-group>
              <!-- :label="$t('Passport.label_validity')" -->
              <van-field
                readonly
                clickable
                v-model="dateOfEntry"
                @click="showPickerValidity = true"
                :label="$t('Date.label_dateofentry')"
                label-width="120"
                input-align="right"
                right-icon="edit"
              />
              <van-popup
                v-model="showPickerValidity"
                position="bottom"
                lock-scroll
              >
                <van-datetime-picker
                  v-model="currentDate"
                  type="date"
                  :title="$t('Passport.pop_title')"
                  :min-date="minDate"
                  :max-date="maxDate"
                  :columns-order="['year', 'month']"
                  :confirm-button-text="$t('Passport.pop_confirm')"
                  :cancel-button-text="$t('Passport.pop_cancel')"
                  @confirm="onConfirmValidity"
                  @cancel="onCancelValidity"
                />
              </van-popup>
            </van-cell-group>
            <div class="content-top">
              {{ $t("Date.confirm_date") }}
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
  </div>
</template>

<script>
import { Toast, Dialog } from "vant";
import orgLogo from "@/components/orgLogo.vue";
import { mapGetters } from "vuex";
export default {
  name: "Date",
  components: { orgLogo },
  data() {
    return {
      // 是否需要选择入境时间（0：不需要[默认]  1:需要）
      isDateOfEntry: this.$store.state.isDateOfEntry,
      // 退税点类型（1：机场；0：市区）
      counterTypes: this.$store.state.counterTypes,
      touristId: this.$route.query.touristId || this.$store.state.touristId,

      dateOfEntry: "",
      currentDate: new Date(),
      // 最小日期为当前日期前180天
      minDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 6),
      // 最大日期为当前日期
      maxDate: new Date(new Date().getTime()),

      // 上传显示百分比
      toastPercent: false,
      currentRate: 0,
      num: "",

      showPickerValidity: false,
    };
  },
  computed: {
    ...mapGetters(["orgId"]),
  },
  props: {
    idType: String,
  },
  watch: {
    // 切换页面时回到顶
    pageType() {
      window.scrollTo(0, 0);
    },
    dateOfEntry(val) {
      if (val) {
        this.$emit("dateOfEntryFn", val);
      }
    },
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.dateOfEntry = this.$store.state.dateOfEntry;
    });
  },
  methods: {
    // 确认选择有效期
    onConfirmValidity(value) {
      let date = new Date(value);
      let y = String(date.getFullYear());
      let m = String(date.getMonth() + 1);
      let d = String(date.getDate());
      m = m < 10 ? "0" + m : m;
      d = d < 10 ? "0" + d : d;
      const time = `${y}-${m}-${d}`;
      this.dateOfEntry = time;
      this.showPickerValidity = false;
    },
    // 取消选择有效期并清空
    onCancelValidity() {
      this.currentDate = "";
      this.dateOfEntry = "";
      this.showPickerValidity = false;
    },
    // 获取默认卡信息
    getCardDefault() {
      let data = {
        touristId: this.touristId,
        orgId: this.orgId
      };
      this.$post("/getCardDefault", data).then((response) => {
        if (response.code == "success") {
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
      if (this.isDateOfEntry == "1" && this.idType != "29") {
        if (this.dateOfEntry) {
          this.updateUserInfo();
          this.$store.commit("setDateOfEntry", this.dateOfEntry);
          this.$store.commit(
            "setDateUrl",
            new Date(new Date().toLocaleDateString()).getTime()
          );
          this.getCardDefault();
        } else {
          Dialog.alert({
            message: this.$t("Date.choose_date"),
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            // on close
          });
          return;
        }
      } else {
        Dialog.alert({
          message: this.$t("Date.choose_date"),
          confirmButtonText: this.$t("App.alert_confirm"),
        }).then(() => {
          // on close
        });
        return;
      }
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
