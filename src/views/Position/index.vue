<template>
  <div class="page">
    <div class="position">
      <div class="location">
        <div class="location-label">{{ $t("Position.location") }}</div>
        <div class="location-name">
          {{ cityCode }}
        </div>
      </div>
      <div
        class="manual-position"
        :style="{ color: cityName === 'unknown' ? '#7200cc' : '' }"
        @click="initMap"
      >
        {{ $t("Position.manual") }}
      </div>
      <div class="provinces">
        <div class="province" v-for="province in provinceList">
          <div class="province-label">
            {{ $t(`Position.${province.provinceCode}`) }}
          </div>
          <div class="city-button">
            <template v-for="item in province.cityList">
              <van-button
                :plain="item.cityName != cityName"
                type="primary"
                @click="changeCityName(item)"
                >{{ $t(`Position.${item.cityCode}`) }}</van-button
              >
            </template>
          </div>
        </div>
      </div>
      <div class="content-button">
        <van-button
          type="primary"
          :disabled="!this.counterId"
          @click="goPassport"
          >{{ $t("Passport.btn_next") }}</van-button
        >
      </div>
    </div>
    <div
      class="van-toast van-toast--middle van-toast--loading"
      style="z-index: 2006"
      v-show="loading"
    >
      <div class="van-loading van-loading--circular van-toast__loading">
        <span class="">
          <van-loading text-color="#7200cc" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      cityName: "unknown",
      cityCode: "",
      province: "",
      provinceList: [],
      counterId: "",
      loading: false,
    };
  },
  computed: {
    ...mapGetters(["langInfo", "partnerSourceId"]),
  },
  watch: {
    "langInfo.lan"() {
      if (this.provinceList.length > 0) {
        for (let item of this.provinceList) {
          let node = item.cityList.find((el) => this.cityName === el.cityName);
          if (node) {
            this.cityCode = this.$t(`Position.${node.cityCode}`);
            this.counterId = node.counterId;
            break;
          }
        }
        if (!this.cityCode) {
          this.cityCode = this.cityName;
        }
      }
    },
  },
  methods: {
    initMap() {
      if (this.cityName !== "unknown") {
        return false;
      }
      const geolocation = new BMap.Geolocation();
      this.loading = true;
      geolocation.getCurrentPosition(
        (position) => {
          this.cityName = position.address.city || "unknown"; //获取城市信息
          this.province = position.address.province; //获取省份信息
          if (this.provinceList.length > 0) {
            for (let item of this.provinceList) {
              let node = item.cityList.find(
                (el) => this.cityName === el.cityName
              );
              if (node) {
                this.cityCode = this.$t(`Position.${node.cityCode}`);
                this.counterId = node.counterId;
                break;
              }
            }
            if (!this.cityCode) {
              this.cityCode = this.cityName;
            }
          }
          this.loading = false;
        },
        (e) => {
          console.log("定位失败");
          this.loading = false;
        },
        { provider: "baidu" }
      );
    },
    goPassport() {
      let partnerSourceId =
        this.$route.query.partnerSourceId || this.partnerSourceId;
      this.$router.push({
        path: "/",
        query: {
          counterId: this.counterId,
          partnerSourceId: partnerSourceId,
          stats: partnerSourceId ? "enable" : "disable",
          pageType: "1",
        },
      });
    },
    getRegionConfigList() {
      this.$post("/getRegionConfigList", {}).then((res) => {
        if (res.code == "success") {
          this.provinceList.push(...res.data);
          if (this.city) {
            for (let item of this.provinceList) {
              let node = item.cityList.find(
                (el) => this.cityName === el.cityName
              );
              if (node) {
                this.cityCode = this.$t(`Position.${node.cityCode}`);
                this.counterId = node.counterId;
                break;
              }
            }
            if (!this.cityCode) {
              this.cityCode = this.cityName;
            }
          }
        }
      });
    },
    async getPartnerInfo() {
      let res = await this.$post("/v1/getPartnerInfo", {
        partnerSourceId:
          this.$route.query.partnerSourceId || this.partnerSourceId,
      });
      if (res.code == 200 && res.data.setMealStatus === 1) {
        this.$store.commit("setOrgLogo", res.data.cardOrgLogo);
      } else {
        this.$router.replace({
          path: "/",
          query: {
            stats: "disable",
          },
        });
      }
    },
    changeCityName(node) {
      this.cityCode = this.$t(`Position.${node.cityCode}`);
      this.cityName = node.cityName;
      this.counterId = node.counterId;
    },
  },
  created() {
    let currentUrl = window.location.href;
    if (currentUrl.includes("reload")) {
      let urlObject = new URL(currentUrl);
      urlObject.searchParams.delete("reload");
      window.location.href = urlObject.toString();
    }
    this.initMap();
  },
  mounted() {
    if (!this.$route.query.partnerSourceId && !this.partnerSourceId) {
      this.$router.replace({
        path: "/",
        query: {
          stats: "disable",
        },
      });
      return false;
    }
    this.getRegionConfigList();
    // this.getPartnerInfo();
    this.$bus.$emit("changeElfShow", false);
      this.$bus.$emit("openLanguageDialog", false);
  },
};
</script>

<style lang="scss" scoped></style>
