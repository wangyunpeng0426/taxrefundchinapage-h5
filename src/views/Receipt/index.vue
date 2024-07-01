<template>
  <div class="page">
    <div class="receipt">
      <UploadApplication
        v-if="pageType === PAGE_TYPE.APPLICATION_FORM"
        @toInvoice="toInvoice"
      />
      <UploadInvoice
        v-else-if="pageType === PAGE_TYPE.INVOICE_FORM"
        :voucherListLength="voucherListLength"
        @toApplication="toApplication"
        @toOrder="toOrder"
      />
      <OrderForm
        v-else-if="pageType === PAGE_TYPE.ORDER_FORM"
        @toInvoice="toInvoiceFromForm"
      />
    </div>
  </div>
</template>

<script>
const PAGE_TYPE = {
  APPLICATION_FORM: "1",
  INVOICE_FORM: "2",
  ORDER_FORM: "3",
};
// import UploadForm from "./components/UploadForm.vue";
import OrderForm from "./components/OrderForm.vue";
import UploadApplication from "./components/UploadApplication";
import UploadInvoice from "./components/UploadInvoice";
export default {
  data() {
    return {
      PAGE_TYPE,
      pageType: PAGE_TYPE.APPLICATION_FORM,
      voucherListLength: 0,
    };
  },
  components: {
    UploadApplication,
    UploadInvoice,
    OrderForm,
  },
  methods: {
    toInvoice(value) {
      this.pageType = PAGE_TYPE.INVOICE_FORM;
      this.voucherListLength = value;
    },
    toInvoiceFromForm() {
      this.pageType = PAGE_TYPE.INVOICE_FORM;
    },
    toApplication() {
      this.pageType = PAGE_TYPE.APPLICATION_FORM;
    },
    toOrder() {
      this.pageType = PAGE_TYPE.ORDER_FORM;
    },
  },
};
</script>
