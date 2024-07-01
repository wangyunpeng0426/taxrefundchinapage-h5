import signatureToPoint from "./main.vue";

signatureToPoint.install = function (Vue) {
  Vue.component(signatureToPoint.name, signatureToPoint);
};

export default signatureToPoint;
