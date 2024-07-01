<template>
  <div style="width: 100%; height: 100%">
    <canvas
      id="mobilePoint"
      @touchstart.prevent="touchstart"
      @touchmove.prevent="touchmove"
      @touchend.prevent="touchend"
      v-if="mobile"
    >
    </canvas>
    <canvas
      id="pcPoint"
      @mousedown="mousedown"
      @mousemove="mousemove"
      @mouseup="mouseup"
      @mouseout="mouseout"
      v-if="pc"
    >
    </canvas>
  </div>
</template>

<script>
let el = "";
let ctx = "";
export default {
  name: "signatureToPoint",
  props: {
    lineWidth: {
      type: String,
      default: "10",
    },
    lineColor: {
      type: String,
      default: "#000",
    },
    background: {
      type: String,
      default: "#fff",
    },
    bgOpacity: {
      type: String,
      default: "1",
    },
  },
  data() {
    return {
      mp: {},
      pagewrite: "",
      onm: false, // 落笔 true 抬笔 false
    };
  },
  mounted() {
    let that = this;
    let userAgent = navigator.userAgent.toLowerCase();
    let checkCanvas = function () {
      if (
        userAgent.indexOf("iphone") !== -1 ||
        userAgent.indexOf("android") !== -1
      ) {
        return "#mobilePoint";
      } else {
        return "#pcPoint";
      }
    };
    el = document.querySelector(checkCanvas());
    // 动态设置元素的prop => height & width ，防止笔画变形
    el.style.width = "100%";
    el.style.height = "100%";
    el.height = el.offsetHeight;
    el.width = el.offsetWidth;

    ctx = el.getContext("2d");
    ctx.lineWidth = that.lineWidth;
    ctx.strokeStyle = that.lineColor;
    el.style.backgroundColor = that.background;
    el.style.opacity = that.bgOpacity;

    // 修改笔迹 去掉锯齿
    let width = el.width,
      height = el.height;
    if (window.devicePixelRatio) {
      el.style.width = width + "px";
      el.style.height = height + "px";
      el.height = height * window.devicePixelRatio;
      el.width = width * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    this.loadSignature();
  },
  methods: {
    touchstart(e) {
      this.mp = {
        x: e.touches[0].clientX - e.target.offsetLeft,
        y: e.touches[0].clientY - e.target.offsetTop,
      };
      this.onm = true;
    },
    touchmove(e) {
      let that = this;
      if (this.onm) {
        // 落笔
        ctx.beginPath();
        ctx.moveTo(that.mp["x"], that.mp["y"]);
        that.mp = {
          x: e.touches[0].clientX - e.target.offsetLeft,
          y: e.touches[0].clientY - e.target.offsetTop,
        };
        ctx.lineTo(that.mp["x"], that.mp["y"]);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        if (!this.pagewrite) {
          // 没有值 点阵开头
          this.pagewrite +=
            "&lt;0," +
            "384," +
            "485," +
            // el.width +
            // "," +
            // el.height +
            // "," +
            ctx.strokeStyle +
            "(" +
            that.mp["x"] +
            "," +
            that.mp["y"] +
            "," +
            ctx.lineWidth +
            ";";
        } else {
          // 有值
          if (this.pagewrite[this.pagewrite.length - 1] == ")") {
            // 第二笔
            this.pagewrite +=
              "(" +
              that.mp["x"] +
              "," +
              that.mp["y"] +
              "," +
              ctx.lineWidth +
              ";";
          } else {
            // 第一笔
            this.pagewrite +=
              that.mp["x"] + "," + that.mp["y"] + "," + ctx.lineWidth + ";";
          }
        }
      }
    },
    touchend() {
      this.mp = {};
      this.onm = false;
      this.pagewrite += ")";
    },
    reset() {
      let that = this;
      ctx.clearRect(0, 0, el.offsetWidth, el.offsetHeight);
      let canvasPic = new Image();
      canvasPic.src = that.firstStatus;
      canvasPic.addEventListener("load", () => {
        ctx.drawImage(canvasPic, 0, 0);
      });

      this.pagewrite = "";
      this.onm = false;
    },
    getCode() {
      if (this.pagewrite[this.pagewrite.length - 1] == ")") {
        this.pagewrite += "&gt;";
      }
      return this.pagewrite;
    },
    validateAndLoadSignature(value) {
      if (value) {
        const isValid = this.validateSignature(value);
        if (isValid) {
          this.loadSignature(value);
        } else {
          this.loadSignatureSwitch(value);
        }
      }
    },  
    validateSignature(signature) {
      // 解析签名数据，并检查每个坐标点是否在画布范围内
      const canvasWidth = el.width / window.devicePixelRatio;
      const canvasHeight = el.height / window.devicePixelRatio;
      const instructions = signature.replace("&lt;", "").replace("&gt;", "").split(")");
      for (const instruction of instructions) {
        if (instruction) {
          const [header, ...lines] = instruction.split("(");
          for (const line of lines) {
            if (line) {
              const points = line.split(";").filter(Boolean);
              for (const point of points) {
                const [x, y] = point.split(",");
                if (
                  parseFloat(x) + 10 < 0 ||
                  parseFloat(x) - 10 > canvasWidth ||
                  parseFloat(y) + 10 < 0 ||
                  parseFloat(y) - 0 > canvasHeight
                ) {
                  console.log(parseFloat(x));
                  console.log(parseFloat(y));
                  return false; // 坐标超出画布范围
                }
              }
            }
          }
        }
      }
      return true; // 所有坐标都在画布范围内
    },
    loadSignature(value) {
      if (value) {
        ctx.clearRect(0, 0, el.width, el.height); // 清空画布
        const instructions = value
          .replace("&lt;", "")
          .replace("&gt;", "")
          .split(")");
        instructions.forEach(instruction => {
          if (instruction) {
            const [header, ...lines] = instruction.split("(");
            lines.forEach(line => {
              if (line) {
                const points = line.split(";").filter(Boolean);
                ctx.beginPath(); // 开始新的路径
                points.forEach((point, index) => {
                  const [x, y, lineWidth] = point.split(",");
                  ctx.lineWidth = lineWidth;
                  if (index === 0) {
                    ctx.moveTo(parseFloat(x), parseFloat(y));
                  } else {
                    ctx.lineTo(parseFloat(x), parseFloat(y));
                  }
                });
                ctx.stroke();
                ctx.closePath(); // 关闭路径
              }
            });
          }
        });
      }
    },
    loadSignatureSwitch(value) {
      if (value) {
        ctx.clearRect(0, 0, el.width, el.height); // 清空画布
        const instructions = value
          .replace("&lt;", "")
          .replace("&gt;", "")
          .split(")");
        instructions.forEach(instruction => {
          if (instruction) {
            const [header, ...lines] = instruction.split("(");
            lines.forEach(line => {
              if (line) {
                const points = line.split(";").filter(Boolean);
                ctx.beginPath(); // 开始新的路径
                points.forEach((point, index) => {
                  const [x, y, lineWidth] = point.split(",");
                  ctx.lineWidth = lineWidth;
                  if (index === 0) {
                    ctx.moveTo(parseFloat((el.width / 2) - y), parseFloat(x));
                  } else {
                    ctx.lineTo(parseFloat((el.width / 2) - y), parseFloat(x));
                  }
                });
                ctx.stroke();
                ctx.closePath(); // 关闭路径
              }
            });
          }
        });
      }
    },
  },
  computed: {
    mobile() {
      return (
        navigator.userAgent.toLowerCase().indexOf("iphone") !== -1 ||
        navigator.userAgent.toLowerCase().indexOf("android") !== -1
      );
    },
    pc() {
      return !(
        navigator.userAgent.toLowerCase().indexOf("iphone") !== -1 ||
        navigator.userAgent.toLowerCase().indexOf("android") !== -1
      );
    },
  },
};
</script>

<style scoped>
* {
  touch-action: none;
}
</style>
