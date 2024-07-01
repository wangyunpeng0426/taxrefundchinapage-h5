<template>
  <div class="page">
    <div class="orderList">
      <div class="content">
        <!-- 订单列表 - start -->
        <template  v-if="temlength == 1">
          <van-list
            v-model="loading"
            :finished="finished"
            :immediate-check="false"
            @load="getTaxOrderList"
            style="min-height: 9rem"
          >
            <div class="block" v-for="item in orderList" :key="item.orderId">
              <p class="block-title">{{ toOrderStatus(item.orderStatus) }}</p>
              <van-cell-group class="card">
                <van-cell @click="toOrder(item.orderId)">
                  <template #title>
                    <div class="title">
                      <div class="title-left">
                        <p class="card-address">
                          <van-icon name="location" />{{ item.counterName }}
                        </p>
                        <div class="card-money">
                          {{
                            item.taxSubsidyOrderMoney ? $toFixed2(item.taxAmountReal+item.taxSubsidyOrderMoney) : $toFixed2(item.taxAmountReal)
                       
                          }}
                              <!-- item.orderStatus == "2"
                              ? `${item.currency}${$toFixed2(
                                  item.taxAmountReal+item.taxSubsidyOrderMoney
                                )}`
                              : `${item.currency}0.00` -->
                        </div>
                        <div class="card-num">
                          {{ $t("OrderList.ordernum")
                          }}<span class="font-black">{{ item.orderId }}</span>
                        </div>
                      </div>
                      <div class="title-right">
                        <p class="num">{{ item.counts }}</p>
                        <p class="num-text">{{ $t("OrderList.numform") }}</p>
                      </div>
                    </div>
                    <van-divider />
                  </template>
                  <template #label>
                    <div class="label">
                      <div class="label-left font-gray">
                        {{ $t("OrderList.ordertime") }}
                      </div>
                      <div class="label-right font-black">
                        {{ toFormatTime(item.submitTime) }}
                      </div>
                    </div>
                  </template>
                </van-cell>
              </van-cell-group>
            </div>
          </van-list>
          <div class="btn-group-follow">
            <div class="logo-icbc">
              <orgLogo></orgLogo>
            </div>
            <div class="btn-group">
              <div class="btn" @click="toBack">
                <span> {{ $t("OrderList.btn_back") }} </span>
              </div>
            </div>
          </div>
        </template>
        <!-- 订单列表 - end -->

        <!-- 空订单列表 - start -->
        <template  v-else-if="temlength == 2">
          <div class="blank">
            <div class="text">
              <img src="../assets/image/img-3.png" />
              <p>{{ $t("OrderList.blank") }}</p>
            </div>
            <div class="btn-group-bottom">
              <div class="logo-icbc">
                <orgLogo></orgLogo>
              </div>
              <div class="btn-group">
                <div class="btn" @click="toBack">
                  <span> {{ $t("OrderList.btn_back") }} </span>
                </div>
              </div>
            </div>
          </div>
        </template>
        <!-- 空订单列表 - end -->
      </div>
    </div>
    <div class="list">
      <van-overlay :show="isShow" @click="isShow = false">
        <div class="wrapper" @click.stop>
          <div class="block">
            <van-loading color="#E5E5E5" v-show="isShow" size="29px" vertical></van-loading>
          </div>
        </div>
      </van-overlay>
    </div>
    
  </div>
</template>

<script>
import { Dialog } from "vant";
import { formatTime } from "../utils/tools";
import orgLogo from "@/components/orgLogo.vue";

export default {
  name: "OrderList",
  components: { orgLogo },
  data() {
    return {
      touristId: this.$route.query.touristId || this.$store.state.touristId,

      // 列表相关
      orderList: [],
      pageNo: 1,
      pageSize: 5,
      temlength:0,
      isShow: true,
      loading: true,
      finished: false,
    };
  },
  mounted() {
    this.getTaxOrderList();
  },
  methods: {
    // 订单列表
    getTaxOrderList() {
      let data = {
        touristId: this.touristId,
        pageSize: this.pageSize,
        pageNo: this.pageNo,
      };
      this.$postNoLoading("/getTaxOrderList", data).then((response) => {
        if (response.code == "success") {
          this.pageNo++;
          this.orderList = this.orderList.concat(response.data.taxOrderList);
          if(this.orderList.length != 0){
            this.temlength = 1
          }else{
            this.temlength = 2
          }
          this.isShow = false;
          this.loading = false;
          if (this.orderList.length == response.data.totalCount) {
            this.finished = true;
          }
          // this.orderList = response.data.taxOrderList;
        } else {
          Dialog.alert({
            message: response.msg,
            confirmButtonText: this.$t("App.alert_confirm"),
          }).then(() => {
            // on close
          });
        }
      });
    },
    // 跳转订单详情
    toOrder(orderId) {
      this.$router.push({
        path: "/Order",
        query: {
          orderId: orderId,
          touristId: this.touristId,
        },
      });
    },
    // 订单状态格式化
    toOrderStatus(val) {
      // 订单状态
      // 已退税（processed）：1：已退税，4：已完成，6：追缴中，8：待追缴
      // 已受理（accepted）： 2：失败，3：待审核，9：待确认，10：审核中
      // 已撤销 (withdrawn)：5：已撤销，7：已追缴
      switch (val) {
        case "2":
          // 已完成
          return this.$t("OrderList.processed");
        case "1":
          // 已受理
          return this.$t("OrderList.accepted");
        case "3":
          // 已撤销
          return this.$t("OrderList.withdrawn");
        default:
          return this.$t("OrderList.accepted");
      }
    },
    // 格式化日期时间
    toFormatTime(val) {
      return formatTime(val);
    },
    // 返回上一页
    toBack() {
      this.$router.go(-1);
    },
  },
};
</script>
<style>
  .list .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .list .block {
    width: 2.5rem;
    height: 2.5rem;
    background-color: #1C1C1C;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
  }
</style>