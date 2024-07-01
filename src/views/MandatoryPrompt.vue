<template>
  <div style="height: 100%;width: 100%;">
    <div style="display: flex; flex-direction: column; alignItems: center; fontSize:17px; paddingTop: 69px;
    top:0px; left:0px; right: 0px; bottom: 130px; overflow: auto; paddingLeft: 20px; paddingRight: 20px">
      <div style="color: #534baa; fontWeight: bold; marginBottom: 20px">
        {{$t('MandatoryPrompt.process')}}
      </div>
      <div style="color: #534baa; fontWeight: bold; marginBottom: 10px">
        STEP1
      </div>
      <img src="../assets/image/prompt_seal.png" style="height: 70px; width: 70px; marginBottom: 10px"/>
      {{$t('MandatoryPrompt.seal_title')}}
      <div style="marginTop: 5px; fontSize: 13px; textAlign:center; color: #313233">
        {{$t('MandatoryPrompt.seal')}}
      </div>
      <!-- {{$t('MandatoryPrompt.seal')}} -->
      <img src="../assets/image/prompt_dot.png" style="height: 50px; width: 5px; margin: 20px 0"/>

      <div style="color: #534baa; fontWeight: bold; marginBottom: 10px">
        STEP2
      </div>
      <img src="../assets/image/prompt_mail.png" style="height: 70px; width: 70px; marginBottom: 10px"/>
      {{$t('MandatoryPrompt.mail_title')}}
      <div style="fontSize: 13px; color: #313233; marginTop: 5px">{{$t('MandatoryPrompt.mail')}}</div>
      <!-- <div style="fontSize: 14px; marginTop: 10px">{{$t('MandatoryPrompt.address_title')}}</div>
      <div style="fontSize: 12px; color: #313233; marginTop: 5px">{{$t('MandatoryPrompt.address')}}</div> -->
      <!-- <div style="fontSize: 14px; marginTop: 10px">{{$t('MandatoryPrompt.telephone')}}</div>
      <div style="fontSize: 12px; color: #313233; marginTop: 5px">024-23872988</div> -->
      
      <!-- {{$t('MandatoryPrompt.mail')}} -->
      <!-- <div style="marginTop: 5px; fontSize: 13px; textAlign:center; color: #313233">
        邮寄地址：辽宁省沈阳市沈河区中三路355号<br/>高登国际大厦18层云游智行收
        <p v-html="$t('MandatoryPrompt.address')"/>
      </div> -->
    </div>
    <div style="width: 100%;height: 2.62rem;"></div>
    <div class="btn-group-bottom">
      <div class="logo-icbc">
        <orgLogo></orgLogo>
      </div>
      <div class="btn-group plr-25">
        <!-- 点击返回 -->
        <div class="btn" @click="known">
          <span>{{$t('MandatoryPrompt.known')}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast, Dialog } from "vant";
import orgLogo from "@/components/orgLogo.vue";

export default {
  name: "Contact",
  components: {
    orgLogo,
  },
  data() {
    return {
    };
  },
  watch: {
  },
  computed: {},
  created() {
  },
  mounted() {},
  methods: {
    // 已知晓
    known() {
      this.$router.replace({
        path: "/Accept",
        query: {
          orderId: this.$route.query.orderId,
          subsidy: 1
        },
      });
    },
  },
};
</script>
