<template>
  <div class="content-1">
    <div class="btn-top">
      <div class="btn-group">
        <van-tabs type="card" v-model="idType">
          <!-- 护照 -->
          <van-tab
            :title="$t('Passport.tab_passport')"
            :name="LICENSE_TYPE.PASSPORT"
          >
            <div class="content-top">
              <label for="imageFile">
                <img src="@/assets/image/passport-bg.png" />
              </label>
            </div>
            <!-- <p class="content-tip">
                  {{ $t("Passport.img_sample") }}
                </p> -->
          </van-tab>
          <!-- 港澳往来大陆通行证 -->
          <van-tab
            :title="$t('Passport.tab_HMpass')"
            :name="LICENSE_TYPE.DOMESTIC_PASSPORT"
          >
            <div class="content-top">
              <label for="imageFile">
                <img src="@/assets/image/gat.png" />
              </label>
            </div>
            <p class="content-tip">
              {{ $t("Passport.img_sample") }}
            </p>
          </van-tab>
        </van-tabs>
      </div>
    </div>
    <div class="content-bottom" style="text-align: left">
      <span>
        {{ $t("Passport.img_tip") }}
      </span>
    </div>
    <div class="btn-group-bottom">
      <div class="logo-icbc">
        <orgLogo></orgLogo>
      </div>
      <div class="btn-group">
        <label for="imageFile" class="btn">
          <div>
            <span><img src="@/assets/image/camera.png" /></span>
            <span>
              {{ $t("Passport.btn_upload") }}
            </span>
          </div>
        </label>
        <input
          ref="file"
          type="file"
          style="display: none"
          id="imageFile"
          accept="image/*"
          @change="compress($event)"
        />
      </div>
    </div>
    <UploadProgress ref="UploadProgress" />
  </div>
</template>

<script>
import { Dialog } from "vant";
import { compression } from "@/utils/tools";
import axios from "axios";
import { LICENSE_TYPE, OND_DAY } from "@/utils/enum.js";
import { mapGetters, mapMutations } from "vuex";
export default {
  data() {
    return {
      LICENSE_TYPE,
      idType: LICENSE_TYPE.PASSPORT,
      userInfo: {
        firstName: "",
        lastName: "",
        idNo: "",
        validity: "",
        imgUrl: "",
        nationality: "",
      },
    };
  },
  computed: {
    ...mapGetters(["counterId", "countryList"]),
  },
  methods: {
    ...mapMutations(["setPassPortType"]),
    async compress(e) {
      this.setPassPortType(this.idType);
      let fileObj = e.target.files[0];
      let res = await compression(fileObj, 2048);
      this.uploadAli(res.file);
      let imageFile = document.getElementById("imageFile");
      imageFile.value = "";
    },
    async uploadAli(file) {
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
        this.analysis(res.data.key);
      } catch {
        this.$refs.UploadProgress.close("上传失败");
      }
    },
    async analysis(key) {
      try {
        let res = await this.$postImgPercent("uploadLicense", {
          counterId: this.counterId,
          idType:
            this.idType == "29"
              ? "PASSPORT"
              : this.idType == "100"
              ? "HK&M"
              : "TWN",
          key: key
        });
        if (res.code == "success") {
          if (
            new Date(res.data.validity).getTime() - new Date().getTime() <
            OND_DAY
          ) {
            res.data.validity = "";
          }
          this.$refs.UploadProgress.close(this.$t("Receipt.upload_success"));
          this.$emit("finishUploadPassPort", {...res.data, key: key});
        } else {
          this.$refs.UploadProgress.close("上传失败");
          this.uploadFail(res);
        }
      } catch {
        this.$refs.UploadProgress.close("上传失败");
      }
    },
    // async upLoad(e) {
    //   let file = e;
    //   let param = new FormData(); // 创建form对象
    //   param.append("counterId", this.counterId); // 退税点id
    //   param.append(
    //     "idType",
    //     this.idType == "29" ? "PASSPORT" : this.idType == "100" ? "HK&M" : "TWN"
    //   );
    //   param.append("file", file);
    //   this.$refs.UploadProgress.open();
    //   try {
    //     let res = await this.$postImgPercent("uploadLicense", param);
    //     if (res.code == "success") {
    //       this.$refs.UploadProgress.close();
    //       //证件过期，清空证件有效期数据不显示
    //       if (
    //         new Date(res.data.validity).getTime() - new Date().getTime() <
    //         OND_DAY
    //       ) {
    //         res.data.validity = "";
    //       }
    //       this.$emit("finishUploadPassPort", res.data);
    //     } else {
    //       this.$refs.UploadProgress.close("上传失败");
    //       this.uploadFail(res);
    //     }
    //   } catch {
    //     this.$refs.UploadProgress.close("上传失败");
    //   }
    // },
    uploadFail(res) {
      Dialog.confirm({
        message: res.msg,
        confirmButtonText: this.$t("Passport.btn_hand"),
        cancelButtonText: this.$t("Passport.btn_reload"),
      })
        .then(() => {
          this.$emit("finishUploadPassPort", this.userInfo);
        })
        .catch(() => {});
    },
  },
};
</script>
