import Vue from "vue";
import Compressor from "compressorjs";

// 保留两位小数
export function toFixed2(val) {
  if (val) {
    return Number(val).toFixed(2);
  } else {
    return 0;
  }
}

// 去除空格
export function removeSpaces(val) {
  return val.replace(/\s*/g, "");
}

// 银行卡格式化
export function bankCardStyle(val) {
  return val
    .replace(/\s/g, "")
    .replace(/[^\d]/g, "")
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

// 截取后四位
export function cutFour(val) {
  if (val) {
    return val.substr(val.length - 4);
  }
}

// 每四位加空格
export function addSpace(val) {
  if (val) {
    return val.replace(/(.{4})/g, "$1 ");
  }
}

// 时间转时间戳
export function unixTimes(val) {
  if (val) {
    let date = new Date(val);
    let time = date.getTime();
    return time;
  } else {
    return "";
  }
}

// 时间戳格式化
export function formatTime(val, type) {
  if (val) {
    let date = new Date(val);
    if (type) {
      let Y = date.getFullYear();
      let M =
        date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1;
      let D = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      if (type == "days") {
        return Y + "年" + M + "月" + D + "日";
      }
    } else {
      let Y = date.getFullYear() + "-";
      let M =
        (date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1) + "-";
      let D =
        (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
      let h =
        (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
      let m =
        (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
        ":";
      let s =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      return Y + M + D + h + m + s;
    }
  } else {
    return "";
  }
}

// 时间戳格式化
export function formatDate(val) {
  if (val) {
    let date = new Date(val * 1000);
    let Y = date.getFullYear() + "-";
    let M =
      (date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) + "-";
    let D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
    return Y + M + D;
  } else {
    return "";
  }
}

// 截取时间
export function cutData(val) {
  if (val) {
    return val.substr(0, 10);
  }
}

// 银行卡校验
export function bankCard(val) {
  if (val) {
    val = val.replace(/\s*/g, "");
    let reg = /^\d{15,19}$/;
    let flag = reg.test(val);
    if (!flag) {
      // Toast('银行卡格式有误')
      return false;
    } else {
      return true;
    }
  }
}

export function compression(file, size = 1024, device = 1) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileSize = Number((file.size / 1024).toFixed(2));
      if (fileSize <= size) {
        resolve({
          file: file,
          origin: file,
          beforeSrc: e.target.result.src,
          afterSrc: e.target.result.src,
          beforeKB: fileSize + "KB",
          afterKB: fileSize + "KB",
          detail: [],
          quality: null,
        });
      } else {
        new Compressor(file, {
          quality: 0.6, // 设置压缩质量，范围从 0 到 1（默认为0.6）
          maxWidth: 1024, // 设置压缩后的图片最大宽度
          maxHeight: 1024, // 设置压缩后的图片最大高度
          maxSize: Math.floor(size / 1024), // 设置压缩后的图片最大大小，单位为MB
          success: (result) => {
            console.log("压缩后的图片：", result);
            resolve({
              file: result,
              origin: result,
              beforeSrc: e.target.result.src,
              afterSrc: e.target.result.src,
              beforeKB: fileSize + "KB",
              afterKB: Number((result.size / 1024).toFixed(2)) + "KB",
              detail: [],
              quality: null,
            });
          },
          error: (err) => {
            // 压缩失败时的处理
            console.error("图片压缩失败：", err);
          },
        });
      }
      
    };

    reader.readAsDataURL(file);
    // new Compressor(file, {
    //   quality: quality || 0.6, //压缩质量
    //   success(result) {
    //     if (!backType || backType == "blob") {
    //       resolve(result);
    //     } else if (backType == "file") {
    //       resolve(file);
    //     } else {
    //       resolve(file);
    //     }
    //     // resolve(result);
    //   },
    //   error(err) {
    //     console.log("图片压缩失败");
    //     reject(err);
    //   },
    // });
  });

  // return new Promise((resolve) => {
  //   const reader = new FileReader(); // 创建 FileReader
  //   reader.onload = ({ target: { result: src } }) => {
  //     const fileSize = Number((file.size / 1024).toFixed(2));
  //     if (fileSize <= size) {
  //       resolve({
  //         file: file,
  //         origin: file,
  //         beforeSrc: src,
  //         afterSrc: src,
  //         beforeKB: fileSize + "KB",
  //         afterKB: fileSize + "KB",
  //         detail: [],
  //         quality: null,
  //       });
  //     } else {
  //       const image = new Image(); // 创建 img 元素
  //       image.onload = async () => {
  //         const canvas = document.createElement("canvas"); // 创建 canvas 元素
  //         canvas.width = image.width;
  //         canvas.height = image.height;
  //         canvas
  //           .getContext("2d")
  //           .drawImage(image, 0, 0, image.width, image.height); // 绘制 canvas
  //         let canvasURL, miniFile;
  //         let L = true;
  //         let quality = 1;
  //         const detail = [];
  //         let start = Date.now();
  //         for (let i = 1; i <= device; i++) {
  //           canvasURL = canvas.toDataURL(
  //             "image/jpeg",
  //             L ? Math.round(quality * 100) / 100 : ""
  //           );
  //           const buffer = atob(canvasURL.split(",")[1]);
  //           let length = buffer.length;
  //           const bufferArray = new Uint8Array(new ArrayBuffer(length));
  //           while (length--) {
  //             bufferArray[length] = buffer.charCodeAt(length);
  //           }
  //           miniFile = new File([bufferArray], file.name, {
  //             type: "image/jpeg",
  //           });
  //           quality -= 0.1;
  //           if (miniFile.size / 1024 > size && quality > 0) {
  //             i--;
  //           }
  //           detail.push({
  //             quality,
  //             size: miniFile.size,
  //             kb: Number((miniFile.size / 1024).toFixed(2)),
  //             time: Date.now() - start,
  //           });
  //           start = Date.now();
  //         }
  //         resolve({
  //           detail,
  //           quality,
  //           file: miniFile,
  //           origin: file,
  //           beforeSrc: src,
  //           afterSrc: canvasURL,
  //           beforeKB: Number((file.size / 1024).toFixed(2)),
  //           afterKB: Number((miniFile.size / 1024).toFixed(2)),
  //         });
  //       };
  //       image.src = src;
  //     }
  //   };
  //   reader.readAsDataURL(file);
  // });

  // if (file[0]) {
  //   return Promise.all(
  //     Array.from(file).map((e) => Vue.prototype.$compression(e, size))
  //   ); // 如果是 file 数组返回 Promise 数组
  // } else {
  //   return new Promise((resolve) => {
  //     const reader = new FileReader(); // 创建 FileReader
  //     reader.onload = ({ target: { result: src } }) => {
  //       const fileSize = Number((file.size / 1024).toFixed(2));
  //       if (fileSize <= size) {
  //         resolve({
  //           file: file,
  //           origin: file,
  //           beforeSrc: src,
  //           afterSrc: src,
  //           beforeKB: fileSize + "KB",
  //           afterKB: fileSize + "KB",
  //           detail: [],
  //           quality: null,
  //         });
  //       } else {
  //         const image = new Image(); // 创建 img 元素
  //         image.onload = async () => {
  //           const canvas = document.createElement("canvas"); // 创建 canvas 元素
  //           canvas.width = image.width;
  //           canvas.height = image.height;
  //           canvas
  //             .getContext("2d")
  //             .drawImage(image, 0, 0, image.width, image.height); // 绘制 canvas
  //           let canvasURL, miniFile;
  //           let L = true;
  //           let quality = 1;
  //           const detail = [];
  //           let start = Date.now();
  //           for (let i = 1; i <= device; i++) {
  //             canvasURL = canvas.toDataURL(
  //               "image/jpeg",
  //               L ? Math.round(quality * 100) / 100 : ("")
  //             );
  //             const buffer = atob(canvasURL.split(",")[1]);
  //             let length = buffer.length;
  //             // console.log(Math.round(quality * 100) / 100);
  //             // console.log(length / 1024);
  //             // console.log('---------');
  //             const bufferArray = new Uint8Array(new ArrayBuffer(length));
  //             while (length--) {
  //               bufferArray[length] = buffer.charCodeAt(length);
  //             }
  //             miniFile = new File([bufferArray], file.name, {
  //               type: "image/jpeg",
  //             });
  //             quality -= 0.1
  //             if (miniFile.size / 1024 > size && quality > 0) {
  //               i--
  //             }
  //             // else{
  //             // L = false
  //             // }
  //             detail.push({
  //               quality,
  //               size: miniFile.size,
  //               kb: Number((miniFile.size / 1024).toFixed(2)),
  //               time: Date.now() - start,
  //             });
  //             start = Date.now();
  //           }
  //           resolve({
  //             detail,
  //             quality,
  //             file: miniFile,
  //             origin: file,
  //             beforeSrc: src,
  //             afterSrc: canvasURL,
  //             beforeKB: Number((file.size / 1024).toFixed(2)),
  //             afterKB: Number((miniFile.size / 1024).toFixed(2)),
  //           });
  //         };
  //         image.src = src;
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   });
  // }
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  const clone = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }

  return clone;
}

/* 判断各个浏览器版本号 */
export function matchBrowserVesion() {
  let userAgent = window.navigator.userAgent;
  let rMsie = /(msie\s|trident.*rv:)([\w.]+)/;
  let rEdge = /(edg)\/([\w.]+)/;
  let rFirefox = /(firefox)\/([\w.]+)/;
  let rOpera = /(opera).+version\/([\w.]+)/;
  let rChrome = /(chrome)\/([\w.]+)/;
  let rSafari = /version\/([\w.]+).*(safari)/;
  let rWechat = /(micromessenger)\/([\w.]+)/;
  let ua = userAgent.toLowerCase();
  var match = rMsie.exec(ua);

  if (match !== null) {
    return { browser: "IE", version: match[2] || "0" };
  }
  var rEmatch = rEdge.exec(ua);
  if (rEmatch !== null) {
    return { browser: "Edge", version: rEmatch[2] || "0" };
  }
  var rFmatch = rFirefox.exec(ua);
  if (rFmatch !== null) {
    return { browser: rFmatch[1] || "", version: rFmatch[2] || "0" };
  }
  var rOmatch = rOpera.exec(ua);
  if (rOmatch !== null) {
    return { browser: rOmatch[1] || "", version: rOmatch[2] || "0" };
  }
  var rCmatch = rChrome.exec(ua);
  if (rCmatch !== null) {
    return { browser: rCmatch[1] || "", version: rCmatch[2] || "0" };
  }
  var rSmatch = rSafari.exec(ua);
  if (rSmatch !== null) {
    return { browser: rSmatch[2] || "", version: rSmatch[1] || "0" };
  }
  var rWmatch = rWechat.exec(ua);
  if (rWmatch !== null) {
    return { browser: rWmatch[1] || "", version: rWmatch[2] || "0" };
  }
  if (match !== null) {
    return { browser: "", version: "0" };
  }
}

//获取被点击元素方法
export function getPath(e) {
  let domPath = Array();
  //判断是否存在ID
  if (e.id) {
      domPath.unshift('#'+e.id.toLocaleLowerCase());
  } else {
      //循环匹配元素
      while (e && e?.nodeName.toLowerCase() !== "html") {
        if (e.id) {
          //判断是否存在ID
          domPath.unshift("#" + e.id.toLocaleLowerCase());
          break;
        } else if (e.tagName.toLocaleLowerCase() == "body") {
          //判断是否是BODY元素
          domPath.unshift(e.tagName.toLocaleLowerCase());
        } else {
          if (e && e?.parentNode?.childElementCount) {
            //遍历获取元素顺序
            for (var i = 0; i < e.parentNode.childElementCount; i++) {
              if (e.parentNode.children[i] == e) {
                domPath.unshift(
                  e.tagName.toLocaleLowerCase() + ":nth-child(" + (i + 1) + ")"
                );
              }
            }
          }
        }
        e = e?.parentNode ?? null;
      }
    //domPath.unshift('html');
    domPath = domPath.toString().replaceAll(",", ">");
  }

  //返回结果
  return domPath;
}
