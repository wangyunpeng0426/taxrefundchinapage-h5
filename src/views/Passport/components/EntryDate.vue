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
                @click="openVanDatetimePicker"
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
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
export default {
  props: {
    dateOfEntry: {
      type: String,
      default: "",
    },
    backBtnShow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentDate: new Date(),
      minDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 6),
      maxDate: new Date(new Date().getTime()),
      showPickerValidity: false,
    };
  },
  methods: {
    ...mapMutations(["setDateOfEntry"]),
    onConfirmValidity(value) {
      let date = new Date(value);
      let y = String(date.getFullYear());
      let m = String(date.getMonth() + 1);
      let d = String(date.getDate());
      m = m < 10 ? "0" + m : m;
      d = d < 10 ? "0" + d : d;
      const time = `${y}-${m}-${d}`;
      this.setDateOfEntry(time);
      this.showPickerValidity = false;
    },
    // 取消选择有效期并清空
    onCancelValidity() {
      this.currentDate = "";
      this.setDateOfEntry("");
      this.showPickerValidity = false;
    },
    toReload() {
      this.setDateOfEntry("");
      this.$emit("reUpload");
    },
    checkParams() {
      if (!this.dateOfEntry) {
        Dialog.confirm({
          message: this.$t("Date.choose_date"),
          confirmButtonText: this.$t("Passport.dialog_confirm"),
          cancelButtonText: this.$t("Passport.dialog_cancel"),
        });
        return false;
      }
      return true;
    },
    toBankCard() {
      let checked = this.checkParams();
      if (!checked) {
        return false;
      }
      //这块删除了更新用户信息逻辑
      this.$emit("gotoBankCard");
    },
    openVanDatetimePicker() {
      if(this.dateOfEntry) {
        this.currentDate = this.dateOfEntry;
      } else {
        this.currentDate = this.maxDate;
      }
      this.showPickerValidity = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
