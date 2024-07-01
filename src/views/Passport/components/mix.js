import { Dialog } from "vant";
import { mapMutations } from "vuex";
export const mix = {
  methods: {
    ...mapMutations(["setTouristId"]),
    addUser() {
      Dialog.confirm({
        message: this.$t("Passport.makesurevalidity"),
        confirmButtonText: this.$t("Passport.dialog_confirm"),
        cancelButtonText: this.$t("Passport.dialog_cancel"),
      })
        .then(() => {
          // 新增
          let data = {
            firstName: this.userInfo.firstName,
            lastName: this.userInfo.lastName,
            idType: this.passPortType,
            language: "44", //this.radio,
            merchantId: this.counterId,
            passportDueTime: this.userInfo.validity,
            userNationalityCode: this.userInfo.nationality || "CHN", // 港澳台有可能识别不出来国籍
            userPassport: this.userInfo.idNo,
            idImgUrl: this.userInfo.imgUrl,
            userSex: this.userInfo.sex,
            userBirthday: this.userInfo.birthday,
            userNameCn: this.userInfo.userNameCn,
            idImgUrl: this.userInfo.key,
          };
          this.$post("/addUser", data).then((res) => {
            if (res.code !== "success") {
              Dialog.alert({
                message: res.msg,
                confirmButtonText: this.$t("App.alert_confirm"),
              });
            } else {
              if (res.data.phone || res.data.mail) {
                this.openLogin(res.data);
              } else {
                if (res.data.touristId) {
                  this.$emit("finishAddUser", res.data.touristId);
                  hina.setUserUId(res.data.touristId)
                }
              }
            }
          });
        })
        .catch(() => {});
    },
    updateUserInfo(touristId) {
      Dialog.confirm({
        message: this.$t("Passport.makesurevalidity"),
        confirmButtonText: this.$t("Passport.dialog_confirm"),
        cancelButtonText: this.$t("Passport.dialog_cancel"),
      })
        .then(() => {
          let data = {
            firstName: this.userInfo.firstName,
            lastName: this.userInfo.lastName,
            idType: this.passPortType,
            passportDueTime: this.userInfo.validity,
            userPassport: this.userInfo.idNo,
            touristId: touristId,
            counterId: this.counterId,
            userNationalityCode: this.userInfo.nationality,
            userNationalityCn: this.userInfo.nationalitycn,
            idImgUrl: this.userInfo.key,
          };
          this.$post("/updateUserInfo", data).then((res) => {
            if (res.code == "success") {
              this.$emit("finishUpdateUser", res.data);
            } else if(res.code == "550006") {
              Dialog.alert({
                message: this.$t("Passport.updateUserInfoError"),
                confirmButtonText: this.$t("App.alert_confirm"),
              });
            } else {
              Dialog.alert({
                message: res.msg,
                confirmButtonText: this.$t("App.alert_confirm"),
              });
            }
          });
        })
        .catch(() => {});
    },
    // 弹出登录
    openLogin(data) {
      if ((data.phoneAreaCode && data.phone) || data.mail) {
        this.$bus.$emit("openLoginDialog", {
          login_radio: data.phone ? "Tel" : "Mail",
          tel: data.phone,
          value: data.phoneAreaCode,
          mail: data.mail,
        });
      }
    },
  },
};
