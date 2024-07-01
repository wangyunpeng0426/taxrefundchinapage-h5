<template>
  <div class="page">
    <div style="width: 100%; text-align: center">
      <van-image ref="orgLogo" fit="scale-down" :src="orgLogo" />
    </div>
  </div>
</template>

<script>
export default {
  // 机构logo图片
  name: "orgLogo",
  data() {
    return {};
  },
  props: {},
  watch: {},
  computed: {
    orgLogo() {
      return this.$store.state.orgLogo;
    },
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>
