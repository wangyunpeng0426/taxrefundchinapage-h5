import axios from "axios";
import { Toast } from "vant";
import store from "../store";
import router from "../router";
import { RSA } from "@/utils/RSA";
import GLOBAL from "@/utils/Global";

//创建axios实例
const Axios = axios.create({
  // baseURL: `${GLOBAL.baseURL}api/taxrefundchina/`,
  baseURL: `${GLOBAL.baseURL}`,
  timeout: 50000,
  responseType: "json",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

//request 拦截器
Axios.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = store.state.token;

    if (store.state.langInfo) {
      config.headers["lan"] = store.state.langInfo.lan;
    }
    return config;
  },
  (error) => {

    hina.track(
      'api_response_error',
      {
        error_message: error.toString(),
        url: error.config.url,
        request_data: JSON.stringify(error.config.data),
        headers: JSON.stringify(error.config.headers)
      }
    );  
    return Promise.reject(error);
  }
);

//response 拦截器
Axios.interceptors.response.use(
  (response) => {
    if (response.data.code == 200 || response.data.code == 'success') {
      hina.track(
        'api_response',
        {
          url: response.config.url,
          request_data: JSON.stringify(response.config.data),
          data: JSON.stringify(response.data),
          headers: JSON.stringify(response.config.headers)
        }
      ); 
    } else {
      hina.track(
        'api_response_error',
        {
          error_message: '接口错误',
          url: response.config.url,
          request_data: JSON.stringify(response.config.data),
          data: JSON.stringify(response.data),
          headers: JSON.stringify(response.config.headers)
        }
      );
    }
    if (response.data.code == "401") {
      getToken();
    } else {
      store.commit("setToken", response.headers.authorization);
      return response;
    }
  },
  (error) => {
    console.log(error);
    hina.track(
      'api_response_error',
      {
        error_message: error.toString(),
        url: error?.config?.url,
        request_data: JSON.stringify(error?.config?.data),
        headers: JSON.stringify(error?.config?.headers),
        data: error?.request?.response,
      }
    );
    return Promise.reject(error);
  }
);

export function get(url, params = {}) {
  return new Promise((resolve, reject) => {
    Axios.get(url, {
      params: params,
    })
      .then((response) => {
        Toast.clear();
        resolve(response.data);
      })
      .catch((err) => {
        Toast.clear();
        reject(err);
      });
  });
}

export function post(url, data = {}, loading = true) {
  return new Promise((resolve, reject) => {
    if (loading) {
      Toast.loading({
        duration: 0,
        overlay: true,
      });
    }
    Axios.post(url, data)
      .then(
        (response) => {
          Toast.clear();
          resolve(response.data);
        },
        (err) => {
          // if (url == `${GLOBAL.baseURL}/getUserInfo`) {
          if (url == `/prod-api/getUserInfo`) {
            let num = String(err).replace(/[^0-9]/gi, "");
            if (num == 400) {
              store.commit("setTouristId", "");
              if (router.history.current.name == "Passport") {
                location.href = `${window.location.origin}/Passport?pageType=1`;
              } else {
                router.replace({
                  path: "/Passport",
                  query: {
                    pageType: "1",
                  },
                });
              }
            }
            Toast.clear();
          } else {
            Toast.clear();
            reject(err);
          }
        }
      )
      .catch((err) => {
        Toast.clear();
        reject(err);
      });
  });
}

export function postNoLoading(url, data = {}) {
  return new Promise((resolve, reject) => {
    Axios.post(url, data)
      .then(
        (response) => {
          Toast.clear();
          resolve(response.data);
        },
        (err) => {
          reject(err);
          Toast.clear();
        }
      )
      .catch((err) => {
        Toast.clear();
        reject(err);
      });
  });
}

export function postImgPercent(url, data = {}, callback) {
  return new Promise((resolve, reject) => {
    axios({
      // url: `${GLOBAL.baseURL}api/taxrefundchina/${url}`,
      url: `${GLOBAL.baseURL}${url}`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        lan: store.state.langInfo.lan || "46",
        Authorization: store.state.token,
      },
      params: data, //请求数据
      onUploadProgress: (progressEvent) => {
        // 原生获取上传进度的事件
        if (progressEvent.lengthComputable) {
          callback && callback(progressEvent);
        }
      },
    })
      .then((response) => {
        Toast.clear();
        if (response.data.code == "401") {
          getToken();
        } else {
          store.commit("setToken", response.headers.authorization);
          resolve(response.data);
        }
      })
      .catch((err) => {
        Toast.clear();
        reject(err);
      });
  });
}

function getToken() {
  let timestamp = new Date().getTime() + "";
  let data = {
    key: RSA(timestamp, "PU"),
  };
  Axios.post("/getToken", data)
    .then(
      (response) => {
        store.commit("setToken", response.data.data);
        location.reload();
      },
      (err) => {
        reject(err);
      }
    )
    .catch((err) => {
      reject(err);
    });
}


export const getAliToken = (data) =>
  Axios({
    url: "/upload/getAliToken",
    method: "post",
    data: data,
  });