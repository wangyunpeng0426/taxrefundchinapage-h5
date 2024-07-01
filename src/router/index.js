import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store/index";
import Index from "../views/Index.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Index",
    component: Index,
    meta: {
      keepAlive: false,
      title: "Instant Refund",
    },
  },
  {
    path: "/Passport",
    name: "Passport",
    component: () => import("../views/Passport/index.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/BankCard",
    name: "BankCard",
    component: () => import("../views/BankCard/index.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/Receipt",
    name: "Receipt",
    component: () => import("../views/Receipt/index.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/ReceiptCash",
    name: "ReceiptCash",
    component: () => import("../views/ReceiptCash/index.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/Sign",
    name: "Sign",
    component: () => import("../views/Sign/index.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/Position",
    name: "Position",
    component: () => import("../views/Position/index.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/Accept",
    name: "Accept",
    component: () => import("../views/Accept.vue"),
    meta: {
      title: "Instant Refund",
    },
  },

  {
    path: "/Order",
    name: "Order",
    component: () => import("../views/Order.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/OrderList",
    name: "OrderList",
    component: () => import("../views/OrderList.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/OrderInfo",
    name: "OrderInfo",
    component: () => import("../views/OrderInfo.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/OrderDetails",
    name: "OrderDetails",
    component: () => import("../views/OrderDetails.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/Contact",
    name: "Contact",
    component: () => import("../views/Contact.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/MandatoryPrompt",
    name: "MandatoryPrompt",
    component: () => import("../views/MandatoryPrompt.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
  {
    path: "/CashQrcode",
    name: "CashQrcode",
    component: () => import("../views/Qr/index.vue"),
    meta: {
      title: "Instant Refund",
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: "/",
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

router.beforeEach((to, from, next) => {
  if (
    to.name == "Passport" ||
    to.name == "BankCard" ||
    to.name == "Receipt" ||
    to.name == "Sign"
  ) {
    if (store.state.touristId) {
      addPage(to.name);
    } else {
      if (to.name != "Passport") {
        router.replace({
          path: "Passport",
          query: {
            pageType: "1",
          },
        });
      }
    }
  }
  next();
});

router.afterEach((to) => {
  if (to.name == "Receipt") {
    addPage("BankCard");
  }
  if (to.name == "Sign") {
    addPage("Receipt");
  }
});

function addPage(step) {
  if (store.state.page) {
    store.commit("setPage", `${store.state.page},${step}`);
  } else {
    store.commit("setPage", `${step}`);
  }
  let arr = "";

  if (store.state.page.indexOf(",") != "-1") {
    arr = store.state.page.split(",");
    arr = [...new Set(arr)].join(",");
  } else {
    arr = store.state.page;
  }

  store.commit("setPage", arr);
}

export default router;
