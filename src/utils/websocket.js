import { RSA } from "./RSA";
import store from "../store";
import { postNoLoading } from "./api";
export default class WebSocketService {
  constructor(orderId, cb) {
    let connectionUrl = "dev-keepalive-itrmch.yunupay.com";
    if (
      window.APP_WEB_SOCKET_URL &&
      window.APP_WEB_SOCKET_URL !== "APP_WEB_SOCKET_URL_PLACEHOLDER"
    ) {
      connectionUrl = window.APP_WEB_SOCKET_URL;
    }
    this.url = `wss://${connectionUrl}/websocket/${orderId}`;
    this.callback = cb;
    this.hearBeatInterval = 60000;
    this.hearBeatNumber = 0;
    this.ws = null;
    this.activeClosed = false;
    this.timer = null;
    this.intervalTime = null;
  }

  async connect() {
    let timestamp = new Date().getTime() + "";
    let data = {
      key: RSA(timestamp, "PU"),
    };
    let response = await postNoLoading("/getToken", data);
    store.commit("setToken", response.data);
    this.ws = new WebSocket(this.url, [response.data]);
    hina.track("websocket", {
      url: "connect",
      request_data: "webskcoet connect",
      data: "webskcoet connect",
      headers: "webskcoet connect",
    });
    // this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      hina.track("websocket", {
        url: "onopen",
        request_data: "webskcoet connect success",
        data: "webskcoet connect",
        headers: "webskcoet connect",
      });
      this.intervalTime = setInterval(() => {
        this.sendHeartBeat();
      }, this.hearBeatInterval);
    };

    this.ws.onmessage = (event) => {
      console.log(event.data);
      let json = JSON.parse(event.data);
      if (json.type === "heartbeat") {
        this.hearBeatNumber = 0;
        return;
      }
      hina.track("websocket", {
        url: "onmessage",
        request_data: event.data,
        data: event.data,
        headers: event.data,
      });
      this.callback(json);
      // this.onMessage(event.data);
    };

    this.ws.onclose = (event) => {
      hina.track("websocket", {
        url: "onclose",
        request_data: "webskcoet connect error",
        data: "webskcoet error",
        headers: "webskcoet error",
      });
      clearInterval(this.intervalTime);
      this.timer = setTimeout(() => {
        if (!this.activeClosed) {
          this.connect();
        }
      }, 1000);
    };
    this.ws.onerror = (error) => {};
  }

  sendHeartBeat() {
    this.hearBeatNumber++;
    if (this.hearBeatNumber > 3) {
      this.close();
      this.connect();
      return;
    }
    let json = { type: "heartbeat" };
    this.sendMessage(JSON.stringify(json));
  }

  onMessage(data) {
    console.log("Received:", data);
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }
  }

  close() {
    if (this.ws) {
      this.activeClosed = true;
      clearInterval(this.intervalTime);
      clearTimeout(this.timer);
      this.ws.close();
    }
  }
}
