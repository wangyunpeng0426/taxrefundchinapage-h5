<template>
  <div>
    <div class="content-top">
      {{ $t("Passport.confirm_infor") }}
    </div>
    <div class="content-bottom">
      <!-- 护照详情页 含不含头部菜单都不可修改 -->
      <van-cell-group>
        <van-field
          v-model="userInfo.firstName"
          :formatter="toFormatterName"
          :label="$t('Passport.label_firstname')"
          label-width="120"
          input-align="right"
          right-icon="edit"
          maxlength="32"
          :disabled="userInfo.hasTaxed"
        />
      </van-cell-group>
      <van-cell-group>
        <van-field
          v-model="userInfo.lastName"
          :formatter="toFormatterName"
          :label="$t('Passport.label_lastname')"
          label-width="120"
          input-align="right"
          right-icon="edit"
          maxlength="32"
          :disabled="userInfo.hasTaxed"
        />
      </van-cell-group>
      <van-cell-group>
        <van-field
          v-model="userInfo.idNo"
          :formatter="toFormatterName"
          :label="$t('Passport.label_passport')"
          label-width="120"
          input-align="right"
          right-icon="edit"
          maxlength="16"
          :disabled="userInfo.hasTaxed"
        />
      </van-cell-group>
      <van-cell-group>
        <van-field
          readonly
          clickable
          :value="userInfo.validity"
          @click="openValidity"
          :label="$t('Passport.label_validity')"
          label-width="120"
          input-align="right"
          right-icon="edit"
          :disabled="userInfo.hasTaxed"
        >
          <!-- v-else -->
        </van-field>
        <van-popup v-model="showPickerValidity" position="bottom" lock-scroll>
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
      <van-cell-group>
        <van-field
          readonly
          clickable
          :key="userInfo.nationality"
          :value="nationalityAll"
          @click="!userInfo.hasTaxed ? searchContentFun() : ''"
          :label="
            passPortType === LICENSE_TYPE.HONG_KONG_MACAO ||
            passPortType === LICENSE_TYPE.TAIWAN ||
            passPortType === LICENSE_TYPE.DOMESTIC_PASSPORT
              ? $t('Passport.label_region')
              : $t('Passport.label_nationality')
          "
          label-width="120"
          input-align="right"
          right-icon="edit"
          :disabled="userInfo.hasTaxed"
        >
        </van-field>
        <van-popup
          v-model="showPickerCountry"
          class="country-model"
          round
          position="bottom"
        >
          <van-picker
            show-toolbar
            :columns="
              passPortType === LICENSE_TYPE.PASSPORT
                ? countryList
                : chinaCountryList
            "
            :confirm-button-text="$t('Passport.pop_confirm')"
            :cancel-button-text="$t('Passport.pop_cancel')"
            @cancel="showPickerCountry = false"
            @confirm="onConfirmCountry"
          >
            <template #option="item">
              <div>
                <div class="img-class">
                  <span
                    >{{ item.countryCode }} - {{ item.countryDictName }}</span
                  >
                </div>
              </div>
            </template>
          </van-picker>
        </van-popup>
      </van-cell-group>
    </div>
    <div class="btn-group-bottom">
      <div class="logo-icbc">
        <orgLogo></orgLogo>
      </div>
      <div class="btn-group plr-25">
        <div class="btn btn-m" @click="toReload">
          <span>{{ $t("Passport.btn_reload") }}</span>
        </div>
        <div class="btn btn-m" @click="() => $emit('toBack')" v-if="backBtnShow">
          <span>{{ $t("Passport.btn_back") }}</span>
        </div>
        <div class="btn btn-m" @click="toSeal" v-else>
          <span>
            {{ $t("Passport.btn_next") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Dialog } from "vant";
import { mapGetters, mapMutations } from "vuex";
import { LICENSE_TYPE } from "@/utils/enum.js";
import { mix } from "./mix";
export default {
  mixins: [mix],
  props: {
    userInfo: {
      type: Object,
      default: () => ({
        firstName: "",
        lastName: "",
        idNo: "",
        validity: "",
        nationality: "",
        hasTaxed: false,
      }),
    },
    backBtnShow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      LICENSE_TYPE,
      showPickerValidity: false,
      currentDate: new Date(),
      minDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
      maxDate: new Date(2040, 12, 31),
      showPickerCountry: false,
      nationality: "",
    };
  },
  computed: {
    ...mapGetters([
      "counterId",
      "touristId",
      "countryList",
      "chinaCountryList",
      "passPortType",
    ]),
    nationalityAll() {
      let list =
        this.passPortType === LICENSE_TYPE.PASSPORT
          ? this.countryList
          : this.chinaCountryList;
      let node = list.find((item) => item.countryCode === this.nationality);
      return node ? `${node.countryCode} - ${node.countryDictName}` : "";
    },
  },
  watch: {
    "userInfo.nationality": {
      handler: function () {
        this.nationality = this.userInfo.nationality;
      },
      immediate: true,
    },
  },
  methods: {
    ...mapMutations(["setPassPortType", "setTouristId"]),
    dialogInfoOpen(msg, buttonText) {
      Dialog.alert({
        message: msg,
        confirmButtonText: buttonText,
      });
    },
    toFormatterName(val) {
      return val.toUpperCase();
    },
    openValidity() {
      if(this.userInfo.hasTaxed) {
        return false;
      }
      this.currentDate = new Date(this.userInfo.validity || this.minDate); 
      this.showPickerValidity = true;
    },
    // 确认选择有效期
    onConfirmValidity(value) {
      let date = new Date(value);
      let y = String(date.getFullYear());
      let m = String(date.getMonth() + 1);
      let d = String(date.getDate());
      m = m < 10 ? "0" + m : m;
      d = d < 10 ? "0" + d : d;
      const time = `${y}-${m}-${d}`;
      this.userInfo.validity = time;
      this.showPickerValidity = false;
    },
    // 取消选择有效期并清空
    onCancelValidity() {
      this.currentDate = "";
      this.userInfo.validity = "";
      this.showPickerValidity = false;
    },
    searchContentFun() {
      this.showPickerCountry = true;
    },
    onConfirmCountry(value) {
      this.userInfo.nationality = value.countryCode;
      this.nationality = value.countryCode;
      this.showPickerCountry = false;
    },
    toReload() {
      if (this.userInfo.hasTaxed) {
        this.dialogInfoOpen(
          this.$t("Passport.donteditid"),
          this.$t("App.alert_confirm")
        );
      } else {
        this.$emit("reUpload");
      }
    },
    checkParams() {
      let filedList = ["firstName", "lastName", "validity"];
      for(let i = 0; i < filedList.length; i ++) {
          if (!this.userInfo[filedList[i]]) {
          this.dialogInfoOpen(
            this.$t(`Passport.input_${filedList[i]}`),
            this.$t("App.alert_confirm")
          );
          return false;
        }
      }
      if (!this.userInfo.idNo) {
        this.dialogInfoOpen(
          this.$t("Passport.input_idnum"),
          this.$t("App.alert_confirm")
        );
        return false;
      }
      if (!this.userInfo.nationality) {
        let msg =
          this.passPortType === LICENSE_TYPE.HONG_KONG_MACAO ||
          this.passPortType === LICENSE_TYPE.TAIWAN ||
          this.passPortType === LICENSE_TYPE.DOMESTIC_PASSPORT
            ? this.$t("Passport.input_region")
            : this.$t("Passport.input_nationality");
        this.dialogInfoOpen(msg, this.$t("App.alert_confirm"));
        return false;
      }
      return true;
    },
    toSeal() {
      let checked = this.checkParams();
      if (!checked) {
        return false;
      }
      if (this.passPortType === LICENSE_TYPE.DOMESTIC_PASSPORT) {
        if (
          this.userInfo.nationality === "HKG" ||
          this.userInfo.nationality == "MAC"
        ) {
          this.setPassPortType(LICENSE_TYPE.HONG_KONG_MACAO);
        } else if (this.userInfo.nationality == "TWN") {
          this.setPassPortType(LICENSE_TYPE.TAIWAN);
        }
      }
      if (this.touristId) {
        this.updateUserInfo(this.touristId);
      } else {
        this.addUser();
      }
    },
  },
};
</script>
