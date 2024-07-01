<template>
  <div class="loading-container">
    <div class="loading">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div
      style="color: #ccc; font-size: 20px; margin-top: 30px"
      v-if="!isRevoke"
    >
      柜台处理中...
    </div>
    <div style="color: #ccc; font-size: 20px; margin-top: 30px" v-else>
      柜台取消交易中，{{ timer }}秒后自动跳转...
    </div>
  </div>
</template>

<script>
export default {
  name: "customLoading",
  props: {
    isRevoke: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      timer: 3,
    };
  },
  watch: {
    isRevoke: {
      handler(val) {
        if (val) {
          this.timer = 3;
          const timer = setInterval(() => {
            this.timer--;
            if (this.timer === 0) {
              clearInterval(timer);
              this.$emit("goPassport");
            }
          }, 1000);
        }
      },
      immediate: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.loading-container {
  position: absolute;
  left: 0px;
  top: 0px;
  right: 0px;
  bottom: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
}
.loading,
.loading > div {
  position: relative;
  box-sizing: border-box;
}

.loading {
  display: block;
  font-size: 0;
  color: #ccc;
}

.loading.la-dark {
  color: #333;
}

.loading > div {
  display: inline-block;
  float: none;
  background-color: currentColor;
  border: 0 solid currentColor;
}

.loading {
  width: 64px;
  height: 64px;
}

.loading > div {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  margin-top: -6px;
  margin-left: -6px;
  border-radius: 100%;
  animation: ball-spin-clockwise 1s infinite ease-in-out;
}

.loading > div:nth-child(1) {
  top: 5%;
  left: 50%;
  animation-delay: -0.875s;
}

.loading > div:nth-child(2) {
  top: 18.1801948466%;
  left: 81.8198051534%;
  animation-delay: -0.75s;
}

.loading > div:nth-child(3) {
  top: 50%;
  left: 95%;
  animation-delay: -0.625s;
}

.loading > div:nth-child(4) {
  top: 81.8198051534%;
  left: 81.8198051534%;
  animation-delay: -0.5s;
}

.loading > div:nth-child(5) {
  top: 94.9999999966%;
  left: 50.0000000005%;
  animation-delay: -0.375s;
}

.loading > div:nth-child(6) {
  top: 81.8198046966%;
  left: 18.1801949248%;
  animation-delay: -0.25s;
}

.loading > div:nth-child(7) {
  top: 49.9999750815%;
  left: 5.0000051215%;
  animation-delay: -0.125s;
}

.loading > div:nth-child(8) {
  top: 18.179464974%;
  left: 18.1803700518%;
  animation-delay: 0s;
}

.loading.la-sm {
  width: 16px;
  height: 16px;
}

.loading.la-sm > div {
  width: 4px;
  height: 4px;
  margin-top: -2px;
  margin-left: -2px;
}

.loading.la-2x {
  width: 64px;
  height: 64px;
}

.loading.la-2x > div {
  width: 16px;
  height: 16px;
  margin-top: -8px;
  margin-left: -8px;
}

.loading.la-3x {
  width: 96px;
  height: 96px;
}

.loading.la-3x > div {
  width: 24px;
  height: 24px;
  margin-top: -12px;
  margin-left: -12px;
}

@keyframes ball-spin-clockwise {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  20% {
    opacity: 1;
  }

  80% {
    opacity: 0;
    transform: scale(0);
  }
}
</style>
