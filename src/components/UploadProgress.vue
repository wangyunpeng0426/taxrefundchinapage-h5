<template>
  <div
    class="van-toast van-toast--middle van-toast--loading"
    style="z-index: 2006"
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
          :text="`${currentRate}%`"
          :speed="100"
        />
      </span>
    </div>
    <div class="van-toast__text">
      {{ $t("Passport.dialog_uploading") }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      toastPercent: false,
      currentRate: 0,
      showText: '',
      timer: null,
    };
  },
  methods: {
    open() {
      this.toastPercent = true;
      this.currentRate = 0;
      this.timer = setInterval(() => {
        this.currentRate++;
        this.showText = `${this.currentRate}%`
        if (this.currentRate === 99) {
          clearInterval(this.timer);
        }
      }, 50);
    },
    close(text = '上传成功') {
      clearInterval(this.timer);
      this.currentRate = 100;
      this.showText = text;
      setTimeout(() => {
        this.toastPercent = false;
      }, 100);
    },
  },
};
</script>

<style scoped></style>
