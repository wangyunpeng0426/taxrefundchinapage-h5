<template>
  <div class="page passport">
    <!-- 竖屏 -->
    <div class="sign-1" v-if="orientation">
      <!-- <hearderBlock /> -->
      <!-- header - start -->
      <div class="header">
        <div class="step" @click="toJump('Passport')">
          <div ref="Passport" class="step-block">
            <img src="@/assets/image/passport.png" />
          </div>
          <span>{{ $t("Sign.header_passport") }}</span>
        </div>
        <div class="point">
          <img src="@/assets/image/point.png" />
        </div>
        <div class="step" @click="toJump('BankCard')">
          <div ref="BankCard" class="step-block">
            <img src="@/assets/image/card.png" />
          </div>
          <span>{{ $t("Sign.header_bankcard") }}</span>
        </div>
        <div class="point">
          <img src="@/assets/image/point.png" />
        </div>
        <div
          class="step"
          @click="toJump(taxRefundType === 'Cash' ? 'ReceiptCash' : 'Receipt')"
        >
          <div ref="Receipt" class="step-block">
            <img class="img-receipt" src="@/assets/image/receipt.png" />
          </div>
          <span>{{ $t("Sign.header_receipt") }}</span>
        </div>
        <div class="point">
          <img src="@/assets/image/point.png" />
        </div>
        <div class="step" @click="toJump('Sign')">
          <div ref="Sign" class="step-block">
            <img class="img-sign" src="@/assets/image/sign.png" />
          </div>
          <span>{{ $t("Sign.header_sign") }}</span>
        </div>
      </div>
      <!-- header - end -->

      <div class="content" style="padding: 0.2rem; box-sizing: border-box">
        <div class="board">
          <signatureToPoint
            style="width: 100%; height: 100%"
            ref="signatureToPoint1"
          ></signatureToPoint>
        </div>
      </div>
      <div class="btn-group">
        <div class="btn btn-m" @click="reset('signatureToPoint1')">
          <span>{{ $t("Sign.btn_resign") }}</span>
        </div>
        <div class="btn btn-m" @click="submit('signatureToPoint1')">
          <span>{{ $t("Sign.btn_complete") }}</span>
        </div>
      </div>
      <div class="btn-group2">
        <span style="color: #383838">*{{ $t("Sign.Signature_for") }}</span>
        <span style="color: #594ab1" @click="receiptShow = true"
          >《{{ $t("Sign.RefundReceipt") }}》</span
        >
        <span style="color: #594ab1" @click="aPowerOfAttorney = true"
          >《{{ $t("Sign.LetterofAuthorization") }}》</span
        >
      </div>
      <!-- 联系方式弹层 - start -->
      <van-popup
        class="login-pop"
        v-model="verification_tel"
        closeable
        round
        :style="{ height: 'auto', width: '80%' }"
        :close-on-click-overlay="false"
        :show-confirm-button="false"
        @click-close-icon="
          verification_tel = false;
          dialog_tel = true;
        "
      >
        <div class="content-login">
          <div class="content-top" style="margin-top: auto">
            <div class="title" style="margin-bottom: 16px; font-size: 0.36rem">
              {{ $t("Sign.verification_title") }}
            </div>
            <div
              class="input"
              v-if="
                userInfo.type == 1 || userInfo.type == 2 || userInfo.type == 3
              "
            >
              <div class="radio" v-show="userInfo.type == 3">
                <van-radio-group
                  v-model="userInfo.login_radio"
                  direction="horizontal"
                >
                  <van-radio name="Tel" checked-color="#594ab1"
                    >{{ $t("elf.tel") }}
                  </van-radio>
                  <van-radio name="Mail" checked-color="#594ab1"
                    >{{ $t("elf.mail") }}
                  </van-radio>
                </van-radio-group>
              </div>
              <div
                class="tel"
                v-if="
                  (userInfo.login_radio == 'Tel' && userInfo.type == 3) ||
                  userInfo.type == 1
                "
              >
                <van-cell-group class="tel-group">
                  <van-field
                    class="tel-country"
                    readonly
                    disabled
                    clickable
                    :value="value"
                    :left-icon="
                      icon ? icon : require(`@/assets/image/flags/cn.png`)
                    "
                  />
                  <van-field
                    class="tel-input"
                    v-model.trim="userInfo.phone"
                    maxlength="16"
                    :placeholder="$t('elf.input_tel')"
                    :disabled="true"
                  />
                </van-cell-group>
              </div>
              <div
                class="tel"
                v-if="
                  (userInfo.login_radio == 'Mail' && userInfo.type == 3) ||
                  userInfo.type == 2
                "
              >
                <van-cell-group class="tel-group">
                  <van-field
                    class="tel-input"
                    v-model.trim="userInfo.mail"
                    maxlength="50"
                    :placeholder="$t('elf.input_mail')"
                    disabled
                  />
                </van-cell-group>
              </div>
              <div class="tel">
                <van-cell-group class="code-group" style="">
                  <van-field v-model="userInfo.code" maxlength="6" />
                  <van-button
                    type="default"
                    v-show="userInfo.show"
                    @click="sendValidCode"
                    :disabled="!userInfo.show"
                    >{{ $t("elf.getcode") }}
                  </van-button>
                  <van-button v-show="!userInfo.show" type="default"
                    >{{ userInfo.count }}s
                  </van-button>
                </van-cell-group>
              </div>
            </div>
          </div>
        </div>
        <!-- 手机验证提示 -->
        <p
          v-if="userInfo.type == 1"
          style="
            color: #a4a6a5;
            font-size: 0.26rem;
            width: calc(100% - 1rem);
            margin: auto;
            text-align: left;
          "
        >
          {{ $t("Sign.dialog_phone") }}
        </p>
        <!-- 邮箱验证提示 -->
        <p
          v-if="userInfo.type == 2"
          style="
            color: #a4a6a5;
            font-size: 0.26rem;
            width: calc(100% - 1rem);
            margin: auto;
            text-align: left;
          "
        >
          {{ $t("Sign.dialog_mail_Tips") }}
        </p>
        <!-- 发回重改提示 -->
        <p
          v-if="userInfo.type == 4"
          style="
            color: #a4a6a5;
            font-size: 0.26rem;
            width: calc(100% - 1rem);
            margin: auto;
            text-align: left;
          "
        >
          {{ $t("Sign.dialog_allTheSame") }}
        </p>
        <!-- 二选一验证 -->
        <p
          v-if="userInfo.type == 3"
          style="
            color: #a4a6a5;
            font-size: 0.26rem;
            width: calc(100% - 1rem);
            margin: auto;
            text-align: left;
          "
        >
          {{ $t("Sign.dialog_tip") }}
        </p>
        <div class="btn-group-follow">
          <div>
            <van-button
              class="btn"
              block
              :disabled="!userInfo.phone && !userInfo.mail"
              @click="verificationFun"
              >{{ $t("Sign.dialog_confirm") }}</van-button
            >
          </div>
        </div>
      </van-popup>
      <van-dialog v-model="dialog_tel" :show-confirm-button="false">
        <div class="tel">
          <div class="content">
            <p class="input-label">{{ $t("Sign.dialog_tel") }}</p>
            <van-cell-group class="tel-group">
              <van-field
                class="tel-country"
                readonly
                clickable
                :value="value"
                @click="showPicker = true"
                :left-icon="
                  icon ? icon : require(`@/assets/image/flags/cn.png`)
                "
              />
              <div class="line"></div>
              <van-field
                class="tel-input"
                v-model="userInfo.phone"
                maxlength="16"
              />
            </van-cell-group>
            <p class="input-label">{{ $t("Sign.dialog_mail") }}</p>
            <van-cell-group>
              <van-field v-model="userInfo.mail" maxlength="50" />
            </van-cell-group>
            <p class="input-label">
              {{ $t("Sign.dialog_tip") }}
            </p>
          </div>
          <div class="btn-group">
            <van-button
              class="btn"
              block
              :disabled="!userInfo.phone && !userInfo.mail"
              @click="toConfirm"
              >{{ $t("Sign.dialog_confirm") }}</van-button
            >
          </div>
        </div>
      </van-dialog>
      <!-- 联系方式弹层 - end -->
    </div>
    <!-- 横屏 -->
    <div v-show="!orientation">
      <div class="sign-2" v-horizontal-screen>
        <!-- header - start -->
        <div class="header">
          <div class="step" @click="toJump('Passport')">
            <span>{{ $t("Sign.header_passport") }}</span>
            <div ref="Passport_standard" class="step-block">
              <img src="@/assets/image/passport.png" />
            </div>
          </div>
          <!-- <div class="point">
            <img src="@/assets/image/point.png" />
          </div> -->
          <div class="step" @click="toJump('BankCard')">
            <span>{{ $t("Sign.header_bankcard") }}</span>
            <div ref="BankCard_standard" class="step-block">
              <img src="@/assets/image/card.png" />
            </div>
          </div>
          <!-- <div class="point">
            <img src="@/assets/image/point.png" />
          </div> -->
          <div
            class="step"
            @click="
              toJump(taxRefundType === 'Cash' ? 'ReceiptCash' : 'Receipt')
            "
          >
            <span>{{ $t("Sign.header_receipt") }}</span>
            <div ref="Receipt_standard" class="step-block">
              <img class="img-receipt" src="@/assets/image/receipt.png" />
            </div>
          </div>
          <!-- <div class="point">
            <img src="@/assets/image/point.png" />
          </div> -->
          <div class="step" @click="toJump('Sign')">
            <span>{{ $t("Sign.header_sign") }}</span>
            <div ref="Sign_standard" class="step-block">
              <img class="img-sign" src="@/assets/image/sign.png" />
            </div>
          </div>
        </div>
        <!-- header - end -->

        <div class="content">
          <div class="board">
            <signatureToPoint
              ref="signatureToPoint2"
              v-if="!orientation"
            ></signatureToPoint>
          </div>
        </div>
        <div class="btn-group">
          <div class="btn btn-m" @click="reset('signatureToPoint2')">
            <span>{{ $t("Sign.btn_resign") }}</span>
          </div>
          <div class="btn btn-m" @click="submit('signatureToPoint2')">
            <span>{{ $t("Sign.btn_complete") }}</span>
          </div>
        </div>
        <div class="btn-group2">
          <span style="color: #383838">*{{ $t("Sign.Signature_for") }}</span>
          <span style="color: #594ab1" @click="receiptShow = true"
            >《{{ $t("Sign.RefundReceipt") }}》</span
          >
          <span style="color: #594ab1" @click="aPowerOfAttorney = true"
            >《{{ $t("Sign.LetterofAuthorization") }}》</span
          >
        </div>

        <!-- 联系方式弹层 - start -->
        <van-popup
          class="login-pop"
          v-model="verification_tel"
          closeable
          round
          :style="{ height: 'auto', width: '80%' }"
          :close-on-click-overlay="false"
          :show-confirm-button="false"
          @click-close-icon="
            verification_tel = false;
            dialog_tel = true;
          "
        >
          <div class="content">
            <div class="content-top" style="margin-top: auto">
              <div
                class="title"
                style="margin-bottom: 16px; font-size: 0.36rem"
              >
                {{ $t("Sign.verification_title") }}
              </div>
              <div
                class="input"
                v-if="
                  userInfo.type == 1 || userInfo.type == 2 || userInfo.type == 3
                "
              >
                <div class="radio" v-show="userInfo.type == 3">
                  <van-radio-group
                    v-model="userInfo.login_radio"
                    direction="horizontal"
                  >
                    <van-radio name="Tel" checked-color="#594ab1"
                      >{{ $t("elf.tel") }}
                    </van-radio>
                    <van-radio name="Mail" checked-color="#594ab1"
                      >{{ $t("elf.mail") }}
                    </van-radio>
                  </van-radio-group>
                </div>
                <div
                  class="tel"
                  v-if="
                    (userInfo.login_radio == 'Tel' && userInfo.type == 3) ||
                    userInfo.type == 1
                  "
                >
                  <van-cell-group class="tel-group">
                    <van-field
                      class="tel-country"
                      readonly
                      disabled
                      clickable
                      :value="value"
                      :left-icon="
                        icon ? icon : require(`@/assets/image/flags/cn.png`)
                      "
                    />
                    <van-field
                      class="tel-input"
                      v-model.trim="userInfo.phone"
                      maxlength="16"
                      :placeholder="$t('elf.input_tel')"
                      :disabled="true"
                    />
                  </van-cell-group>
                </div>
                <div
                  class="tel"
                  v-if="
                    (userInfo.login_radio == 'Mail' && userInfo.type == 3) ||
                    userInfo.type == 2
                  "
                >
                  <van-cell-group class="tel-group">
                    <van-field
                      class="tel-input"
                      v-model.trim="userInfo.mail"
                      maxlength="50"
                      :placeholder="$t('elf.input_mail')"
                      disabled
                    />
                  </van-cell-group>
                </div>
                <div class="tel">
                  <van-cell-group class="code-group" style="">
                    <van-field v-model="userInfo.code" maxlength="6" />
                    <van-button
                      type="default"
                      v-show="userInfo.show"
                      @click="sendValidCode"
                      :disabled="!userInfo.show"
                      >{{ $t("elf.getcode") }}
                    </van-button>
                    <van-button v-show="!userInfo.show" type="default"
                      >{{ userInfo.count }}s
                    </van-button>
                  </van-cell-group>
                </div>
              </div>
            </div>
          </div>
          <!-- 手机验证提示 -->
          <p
            v-if="userInfo.type == 1"
            style="
              color: #a4a6a5;
              font-size: 0.26rem;
              width: calc(100% - 1rem);
              margin: auto;
              text-align: left;
            "
          >
            {{ $t("Sign.dialog_phone") }}
          </p>
          <!-- 邮箱验证提示 -->
          <p
            v-if="userInfo.type == 2"
            style="
              color: #a4a6a5;
              font-size: 0.26rem;
              width: calc(100% - 1rem);
              margin: auto;
              text-align: left;
            "
          >
            {{ $t("Sign.dialog_mail_Tips") }}
          </p>
          <!-- 发回重改提示 -->
          <p
            v-if="userInfo.type == 4"
            style="
              color: #a4a6a5;
              font-size: 0.26rem;
              width: calc(100% - 1rem);
              margin: auto;
              text-align: left;
            "
          >
            {{ $t("Sign.dialog_allTheSame") }}
          </p>
          <!-- 二选一验证 -->
          <p
            v-if="userInfo.type == 3"
            style="
              color: #a4a6a5;
              font-size: 0.26rem;
              width: calc(100% - 1rem);
              margin: auto;
              text-align: left;
            "
          >
            {{ $t("Sign.dialog_tip") }}
          </p>
          <div class="btn-group-follow">
            <div>
              <van-button
                class="btn"
                block
                :disabled="!userInfo.phone && !userInfo.mail"
                @click="verificationFun"
                >{{ $t("Sign.dialog_confirm") }}</van-button
              >
            </div>
          </div>
        </van-popup>
        <van-dialog
          v-model="dialog_tel"
          :show-confirm-button="false"
          width="450px"
        >
          <div class="tel">
            <div class="content">
              <!-- <span class="input-label">{{ $t("Sign.dialog_tel") }}</span> -->
              <van-cell-group class="tel-group">
                <van-field
                  class="tel-country"
                  readonly
                  clickable
                  :value="value"
                  @click="showPicker = true"
                  :left-icon="
                    icon ? icon : require(`@/assets/image/flags/cn.png`)
                  "
                />
                <div class="line"></div>
                <van-field
                  class="tel-input"
                  v-model="userInfo.phone"
                  maxlength="16"
                  :placeholder="$t('Passport.input_tel')"
                />
              </van-cell-group>
              <!-- <p class="input-label">{{ $t("Sign.dialog_mail") }}</p> -->
              <van-cell-group>
                <van-field
                  v-model="userInfo.mail"
                  maxlength="50"
                  :placeholder="$t('Passport.input_mail')"
                />
              </van-cell-group>
              <p class="input-label">
                {{ $t("Sign.dialog_tip") }}
              </p>

              <div class="btn-group-dialog">
                <van-button
                  class="btn-m"
                  block
                  :disabled="!userInfo.phone && !userInfo.mail"
                  @click="toConfirm"
                  >{{ $t("Sign.dialog_confirm") }}</van-button
                >
              </div>
            </div>
          </div>
        </van-dialog>
        <!-- 联系方式弹层 - end -->
      </div>
    </div>
    <!-- 选择国家号码弹层 - start -->
    <van-popup
      v-model="showPicker"
      class="country-model"
      round
      position="bottom"
    >
      <van-picker
        show-toolbar
        :confirm-button-text="$t('Passport.pop_confirm')"
        :cancel-button-text="$t('Passport.pop_cancel')"
        :columns="countryList"
        @cancel="showPicker = false"
        @confirm="onConfirm"
      >
        <template #option="item">
          <div>
            <div class="img-class">
              <img class="country-logo" :src="item.countryIconView" />
              <span>{{ item.countryCode }} {{ item.areaCode }}</span>
            </div>
          </div>
        </template>
      </van-picker>
    </van-popup>
    <!-- 选择国家号码弹层 - end -->
    <!-- 查询担保银行卡查询加载动画 -->
    <van-overlay :show="show" @click="show = false">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        "
      >
        <van-loading type="spinner" vertical>加载中...</van-loading>
      </div>
    </van-overlay>
    <!-- 境外旅客购物离境退税收款回执单 -->
    <van-overlay :lock-scroll="false" :show="receiptShow">
      <div class="wrapper">
        <div class="block">
          <span
            style="
              position: absolute;
              font-size: 0.4rem;
              right: 10px;
              top: 10px;
              color: #a4a6a5;
            "
            ><van-icon name="clear" @click="receiptShow = false"
          /></span>
          <p style="margin-top: 0.2rem">境外旅客购物离境退税收款回执单</p>
          <p>RefundReceipt</p>
          <van-row style="margin-top: 0.2rem">
            <van-col span="12"
              >编号：<span style="color: transparent; text-shadow: #111 0 0 4px"
                >123123123</span
              >
            </van-col>
            <van-col span="12"
              >开单日期：<span
                style="color: transparent; text-shadow: #111 0 0 4px"
                >2022-05-07</span
              ></van-col
            >
          </van-row>
          <van-row style="margin-bottom: 0.2rem">
            <van-col span="12">No.</van-col>
            <van-col span="12">DataofApplication</van-col>
          </van-row>
          <van-row class="row_css">
            <van-col class="col_css" span="12">
              <p>
                退税代理机构：<br />
                TaxRefundAgent
              </p>
            </van-col>
            <van-col class="col_css2" span="12">
              <p>中国银行股份有限公司北京市分行</p>
            </van-col>
          </van-row>
          <van-row class="row_css">
            <van-col class="col_css" span="12">
              <p>电话：<br />Tel.</p>
            </van-col>
            <van-col class="col_css2" span="12">
              <p>13111111111</p>
            </van-col>
          </van-row>
          <van-row class="row_css">
            <van-col class="col_css" span="12">
              <p>境外旅客(姓名)：<br />Applicant’s Name</p>
            </van-col>
            <van-col class="col_css2" span="12">
              <p>PANZHENPING</p>
            </van-col>
          </van-row>
          <van-row class="row_css">
            <van-col class="col_css" span="12">
              <p>退税申请单号：<br />RefundApplication<br />Form No.</p>
            </van-col>
            <van-col class="col_css2" span="12">
              <p>2467931271458880417</p>
            </van-col>
          </van-row>
          <van-row class="row_css">
            <van-col class="col_css" span="12">
              <p>申请退税额(人民币)：<br />AmountofRefund<br />Applie(RMB)</p>
            </van-col>
            <van-col class="col_css2" span="12">
              <p>¥68.19</p>
            </van-col>
          </van-row>
          <van-row class="row_css">
            <van-col class="col_css" span="12">
              <p>海关确认后退款金额(人民币)：<br />ApprovedAmount<br />(RMB)</p>
            </van-col>
            <van-col class="col_css2" span="12">
              <p>¥68.19</p>
            </van-col>
          </van-row>
          <van-row class="row_css">
            <van-col class="col_css" span="12">
              <p>退税手续费2%(人民币)：<br />Percentage<br />(RMB)</p>
            </van-col>
            <van-col class="col_css2" span="12">
              <p>¥55.8</p>
            </van-col>
          </van-row>
          <van-row class="row_css">
            <van-col class="col_css" span="12">
              <p>退税金额(人民币)<br />ActualAmountPaid<br />(RMB)</p>
            </van-col>
            <van-col class="col_css2" span="12">
              <p>¥12.39</p>
            </van-col>
          </van-row>
          <van-row class="row_css">
            <van-col class="col_css" span="12">
              <p>退款方式：<br />RefundMode</p>
            </van-col>
            <van-col class="col_css2" span="12">
              <p>转账BankTransfer</p>
            </van-col>
          </van-row>
          <van-row class="row_css">
            <van-col
              class="col_css"
              style="border: 1px solid red; color: red"
              span="24"
            >
              <p>境外旅客签字：<br />Applicant’s Signature</p>
            </van-col>
          </van-row>
          <van-row style="text-align: center; margin-top: 1rem">
            <van-col span="24">
              <van-button
                type="primary"
                color="#7232dd"
                @click.stop="receiptShow = false"
                >{{ $t("Sign.closePage") }}</van-button
              >
            </van-col>
          </van-row>
        </div>
      </div>
    </van-overlay>
    <!-- 转账授权委托书 -->
    <van-overlay :lock-scroll="false" :show="aPowerOfAttorney">
      <div class="wrapper">
        <div class="block">
          <span
            style="
              position: absolute;
              font-size: 0.4rem;
              right: 10px;
              top: 10px;
              color: #a4a6a5;
            "
            ><van-icon name="clear" @click="aPowerOfAttorney = false"
          /></span>
          <p style="margin-top: 0.2rem">转账授权委托书</p>
          <p>Letter of Authorization</p>
          <van-row style="margin-top: 0.2rem">
            <van-col span="24"
              >本人
              <span style="color: transparent; text-shadow: #111 0 0 4px"
                >PANZHENPING</span
              >
              在贵行办理离境退税业务。由于个人原因，无法提供本人名下有效账户，现委托贵行将本次业务所发生的退税款转账至以下账户：</van-col
            >
          </van-row>
          <van-row style="margin-bottom: 0.2rem">
            <van-col span="24"
              >With reference to the tax refund business,I
              <span style="color: transparent; text-shadow: #111 0 0 4px"
                >PANZHENPING</span
              >
              Hereby authorize your bank to transfer the tax refund amount to
              the following account due to the fact that any valid account of
              mine cannot be provided for personal reasons:</van-col
            >
          </van-row>
          <van-row>
            <van-col class="col_css5" span="24">
              <p>退税申请单编号：</p>
            </van-col>
          </van-row>
          <van-row class="row_css_2">
            <van-col class="col_css5" span="8">
              <p>FileNO.:</p>
            </van-col>
            <van-col class="col_css6" span="16">
              <p>2467931271458880417</p>
            </van-col>
          </van-row>

          <van-row>
            <van-col class="col_css5" span="24">
              <p>户名：</p>
            </van-col>
          </van-row>
          <van-row class="row_css_2">
            <van-col class="col_css5" span="8">
              <p>AccountName:</p>
            </van-col>
            <van-col class="col_css6" span="16">
              <p>BAIYU</p>
            </van-col>
          </van-row>

          <van-row>
            <van-col class="col_css5" span="24">
              <p>账号：</p>
            </van-col>
          </van-row>
          <van-row class="row_css_2">
            <van-col class="col_css5" span="8">
              <p>AccountNo.:</p>
            </van-col>
            <van-col class="col_css6" span="16">
              <p>6222450015650225</p>
            </van-col>
          </van-row>

          <van-row>
            <van-col class="col_css5" span="24">
              <p>开户行：</p>
            </van-col>
          </van-row>
          <van-row class="row_css_2">
            <van-col class="col_css5" span="8">
              <p>OpeningBank:</p>
            </van-col>
            <van-col class="col_css6" span="16">
              <p>Insdustrial and Commercial bank of China</p>
            </van-col>
          </van-row>

          <van-row style="margin-top: 0.2rem">
            <van-col span="24"
              >由此产生的任何纠纷与贵行无关，均由本人全部承担。</van-col
            >
          </van-row>
          <van-row style="margin-bottom: 0.2rem">
            <van-col span="24"
              >Any disputes arising therefrom have nothing to do with your bank
              and shall be solely borne by myself.</van-col
            >
          </van-row>

          <van-row style="color: red; margin-top: 0.3rem">
            <van-col class="col_css3" span="16">
              <p>委托人签名/Signature:</p>
            </van-col>
            <van-col class="col_css4" span="8">
              <p>_______________</p>
            </van-col>
          </van-row>
          <van-row style="margin-top: 0.3rem">
            <van-col class="col_css3" span="16">
              <p>委托人证件种类(港澳通行证或护照):</p>
            </van-col>
            <van-col class="col_css6" span="8">
              <p></p>
            </van-col>
          </van-row>
          <van-row>
            <van-col class="col_css3" span="16">
              <p>Type of certificate(EEP or passport):</p>
            </van-col>
            <van-col class="col_css4" span="8">
              <p style="color: transparent; text-shadow: #111 0 0 4px">
                passport
              </p>
            </van-col>
          </van-row>
          <van-row style="margin-top: 0.3rem">
            <van-col class="col_css3" span="16">
              <p>委托人证件号码/Certificate No.:</p>
            </van-col>
            <van-col class="col_css4" span="8">
              <p style="color: transparent; text-shadow: #111 0 0 4px">
                C5HH4R8RW
              </p>
            </van-col>
          </van-row>
          <van-row style="margin-top: 0.3rem">
            <van-col class="col_css3" span="16">
              <p>日期Date:</p>
            </van-col>
            <van-col class="col_css4" span="8">
              <p style="color: transparent; text-shadow: #111 0 0 4px">
                2022-05-07
              </p>
            </van-col>
          </van-row>
          <van-row style="text-align: center; margin-top: 1rem">
            <van-col span="24">
              <van-button
                type="primary"
                color="#7232dd"
                @click.stop="aPowerOfAttorney = false"
                >{{ $t("Sign.closePage") }}</van-button
              >
            </van-col>
          </van-row>
        </div>
      </div>
    </van-overlay>
  </div>
</template>
<script>
import { Toast, Dialog } from "vant";
import { mapGetters } from "vuex";
export default {
  name: "Sign",
  directives: {
    "horizontal-screen": {
      // bind(el, binding, vnode) {
      bind(el) {
        // let self = vnode.context;
        // console.log(self);
        // function reset(init) {
        function reset() {
          // console.log(init);
          let width = document.documentElement.clientWidth,
            height = document.documentElement.clientHeight;
          //在竖屏状态我们通过添加transform:rotate(90deg)，来让这个页面横过来
          if (
            window.orientation == null ||
            window.orientation === 180 ||
            window.orientation === 0
          ) {
            //竖屏状态
            el.style.webkitTransform = el.style.transform = `rotate(90deg)`;
            el.style.width = `${height}px`;
            el.style.height = `${width}px`;
            el.style.webkitTransformOrigin = el.style.transformOrigin = `${
              width / 2
            }px center`;
            //如果已经处于横屏状态就不做其他处理了
            if (location.href.indexOf("#col") == -1) {
              location.href = location.href + "#col";
              // location.reload();
            }
          } else if (window.orientation === 90 || window.orientation === -90) {
            //横屏状态
            el.style.webkitTransform = el.style.transform = `rotate(0)`;
            el.style.width = `${width}px`;
            el.style.height = `${height}px`;
            if (location.href.indexOf("#row") == -1) {
              location.href = location.href + "#row";
              location.reload();
            }
          }
        }
        reset(true);

        let timer = null;
        el.fn = function (e) {
          clearTimeout(timer);
          timer = setTimeout(reset, 300);
        };

        window.addEventListener("resize", el.fn, false);

        if ("onorientationchange" in window) {
          window.addEventListener("orientationchange", el.fn, false);
        }
      },
      unbind(el) {
        // unbind(el, binding, vnode) {
        // console.log(binding);
        // console.log(vnode);

        window.removeEventListener("resize", el.fn, false);
        window.removeEventListener("orientationchange", el.fn, false);
      },
    },
  },
  data() {
    return {
      pathName: this.$route.name,
      touristId: this.$route.query.touristId || this.$store.state.touristId,
      cardId: this.$route.query.cardId || this.$store.state.cardId || "",
      orientation: true, // 是否竖屏
      pageWrite: "", // 签字结果
      receiptShow: false, //退税对账说明（说明签字在什么地方用的）
      aPowerOfAttorney: false, //委托授权书（说明签字在什么地方用的）
      // 手机号邮箱弹层相关
      dialog_tel: false,
      verification_tel: false, //验证码弹框
      radio: "", // 选中的类型
      type: true,
      value: "+86", // 默认值
      icon: "",
      showPicker: false,
      countryList: [], // 国籍列表
      show: false,

      userInfo: {
        phone: "", //手机号
        mail: "", //邮箱
        code: "", //验证码
        type: 3, //状态0、通过直接绑定 1、手机号验证 2、邮箱验证 3、手机号邮箱二选一 4、都不同重新填写
        login_radio: "Tel", //在userInfo.type==3的时候使用
        show: true, //显示倒计时
        count: "", //倒计时
        timer: null, //计时器
        oldTouristId: "", //就用户id
      },
    };
  },
  computed: {
    ...mapGetters(["orgId", "partnerSourceId", "taxRefundType"]),
  },
  mounted() {
    this.getCountryList();
    this.handleClass();
    this.renderResize();
    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.renderResize();
      }, 0);
    });
    this.$nextTick(() => {
      if (this.$route.query?.isSign === "1") {
        this.$refs.signatureToPoint1.validateAndLoadSignature(
          localStorage.getItem("OrderSign")
        );
        localStorage.removeItem("OrderSign");
        this.show = true;
        this.getCashFindGuaranteeOrderStatus(this.$route.query.taxOrderId);
      }
    });
  },
  methods: {
    // 控制显示状态
    renderResize() {
      if (
        window.orientation == null ||
        window.orientation === 180 ||
        window.orientation === 0
      ) {
        //竖屏状态
        this.$nextTick(() => {
          this.orientation = true;
          setTimeout(() => {
            this.handleClass();
          }, 0);
        });
      } else if (window.orientation === 90 || window.orientation === -90) {
        //横屏状态
        this.$nextTick(() => {
          this.orientation = false;
        });
      }
    },
    // 获取国家列表
    getCountryList() {
      this.$postNoLoading("/getCountryList", {}).then((response) => {
        if (response.code == "success") {
          this.countryList = response.data;
          this.getUserInfo();
          this.countryList = this.countryList.filter((item) => {
            return item.countryIconView;
          });
        }
      });
    },
    // 获取用户信息 判断是否显示联系方式弹层
    getUserInfo() {
      let data = {
        touristId: this.touristId,
      };
      this.$postNoLoading("/getUserInfo", data).then((res) => {
        if (res.code == "success") {
          // 修改为只要进入签字页就显示联系方式弹窗
          this.countryList.forEach((item) => {
            if (item.countryCode == res.data.touristNationCode) {
              this.value = item.areaCode;
              this.icon = item.countryIconView;
            }
          });
          this.userInfo.phone = res.data.phone || "";
          this.userInfo.mail = res.data.mail || "";
          // this.dialog_tel = true;
          if (res.data.mail || res.data.phone) {
            this.dialog_tel = false;
          } else {
            this.dialog_tel = true;
          }
        }
      });
    },
    //验证手机号邮箱
    verificationFun() {
      if (this.userInfo.type == 4) {
        //手机号邮箱填写页面
        this.dialog_tel = true;
        //验证码
        this.verification_tel = false;
      } else {
        if (this.userInfo.phone) {
          this.userInfo.phone = this.userInfo.phone.replace(/\s+/g, "");
          if (!/^[0-9]{8,16}$/.test(this.userInfo.phone)) {
            Dialog.alert({
              message: this.$t("Sign.input_tel_right"),
              confirmButtonText: this.$t("App.alert_confirm"),
            }).then(() => {
              // on close
            });
            return;
          }
        }

        if (this.userInfo.mail) {
          this.userInfo.mail = this.userInfo.mail.replace(/\s+/g, "");
          if (
            !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(this.userInfo.mail)
          ) {
            Dialog.alert({
              message: this.$t("Sign.input_mail_right"),
              confirmButtonText: this.$t("App.alert_confirm"),
            }).then(() => {
              // on close
            });
            return;
          }
        }
        let data = {
          touristId: this.touristId,
          phone: this.userInfo.phone,
          mail: this.userInfo.mail,
          phoneAreaCode: this.value,
          oldTouristId: this.userInfo.oldTouristId,
          touristStatus: 0,
        };
        if (
          (this.userInfo.login_radio == "Tel" && this.userInfo.type == 3) ||
          this.userInfo.type == 1
        ) {
          data.phoneCode = this.userInfo.code;
        } else {
          data.mailCode = this.userInfo.code;
        }
        this.$post("/updateUserInfoForCode", data).then((response) => {
          if (response.code == "success") {
            //手机号邮箱填写页面
            this.dialog_tel = false;
            //验证码
            this.verification_tel = false;
          } else {
            Dialog.alert({
              message: response.msg,
              confirmButtonText: this.$t("App.alert_confirm"),
            }).then(() => {
              // on close
            });
          }
        });
      }
    },
    // 更新用户手机号和邮箱
    toConfirm() {
      if (this.userInfo.phone) {
        this.userInfo.phone = this.userInfo.phone.replace(/\s+/g, "");
        if (!/^[0-9]{8,16}$/.test(this.userInfo.phone)) {
          Dialog.alert({
            message: this.$t("Sign.input_tel_right"),
            confirmButtonText: this.$t("App.alert_confirm"),
          });
          return;
        }
      }

      if (this.userInfo.mail) {
        this.userInfo.mail = this.userInfo.mail.replace(/\s+/g, "");
        if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(this.userInfo.mail)) {
          Dialog.alert({
            message: this.$t("Sign.input_mail_right"),
            confirmButtonText: this.$t("App.alert_confirm"),
          });
          return;
        }
      }

      let data = {
        phone: this.userInfo.phone,
        email: this.userInfo.mail,
      };

      this.$post("/checkSmsOrEmail", data).then((res) => {
        if (res.code == "success") {
          //验证状态  //0、通过直接绑定 1、手机号验证 2、邮箱验证 3、手机号邮箱二选一 4、都不同重新填写
          this.userInfo.type = res.data.code;
          //旧用户（即将被挤掉的账号）ID
          this.userInfo.oldTouristId = res.data.oldTouristId;
          //手机号邮箱填写页面
          // this.dialog_tel = false;
          if (res.data.code != 0) {
            //手机号邮箱填写页面
            this.dialog_tel = false;
            //验证码
            this.verification_tel = true;
          } else {
            data = {
              touristId: this.touristId,
              phone: this.userInfo.phone,
              mail: this.userInfo.mail,
              phoneAreaCode: this.value,
            };
            this.$post("/updateUserInfo", data).then((res) => {
              debugger;
              if (res.code == "success") {
                //手机号邮箱填写页面
                this.dialog_tel = false;
                //验证码
                this.verification_tel = false;
              } else {
                Dialog.alert({
                  message: res.msg,
                  confirmButtonText: this.$t("App.alert_confirm"),
                });
              }
            });
          }
        } else {
          Dialog.alert({
            message: res.msg,
            confirmButtonText: this.$t("App.alert_confirm"),
          });
        }
      });
    },
    // 提交画板
    async submit(name) {
      let code = this.$refs[name].getCode();
      let num = code.split(";").length - 1; // 根据;出现的次数 判断笔迹大小
      if (code == "") {
        Dialog.alert({
          message: this.$t("Sign.no_sign"),
          confirmButtonText: this.$t("App.alert_confirm"),
        });
        return;
      } else if (num < 30) {
        Dialog.alert({
          message: this.$t("Sign.sign_care"),
          confirmButtonText: this.$t("App.alert_confirm"),
        });
        return;
      }
      this.pageWrite = code;
      // try {
      let response = await this.$post("/getCardDefault", {
        touristId: this.touristId,
        orgId: this.orgId,
      });
      if (response.code == "success") {
        if (response.data && response.data.cardId) {
          this.cardId = response.data.cardId;
        } else {
          Dialog.alert({
            message: this.$t("Sign.add_card"),
            confirmButtonText: this.$t("App.alert_confirm"),
          });
          return;
        }
      } else {
        Dialog.alert({
          message: response.msg,
          confirmButtonText: this.$t("App.alert_confirm"),
        });
        return;
      }
      let getUserInfo_response = await this.$post("/getUserInfo", {
        touristId: this.touristId,
      });
      if (getUserInfo_response.code == "success") {
        if (
          getUserInfo_response.data &&
          !getUserInfo_response.data.mail &&
          !getUserInfo_response.data.phone
        ) {
          this.dialog_tel = true;
          return;
        }
      }
      let params = {
        touristId: this.touristId,
        cardId: this.cardId,
        sign: this.pageWrite,
        type: name == "signatureToPoint1" ? "1" : "2",
      };
      if (this.$store.state.passPortType === "29") {
        params.entrySealUrl = this.$store.state.entrySealUrl;
        if (this.$store.state.counterTypes == "1") {
          // 退税点为机场
          params.exitSealUrl = this.$store.state.exitSealUrl;
        }
      } else {
        if (this.$store.state.dateOfEntry) {
          params.dateOfEntry = this.$store.state.dateOfEntry;
        }
      }
      params.partnerSourceId = this.partnerSourceId;
      let url =
        localStorage.getItem("TaxRefundType") === "Cash"
          ? "/cashTaxCreateOrder"
          : "/createOrder";
      let res = await this.$post(url, params);
      if (res.code == "success") {
        this.show = true;
        if (localStorage.getItem("TaxRefundType") === "Cash") {
          this.getCashOrderStatus(res.data.taxOrderId);
        } else {
          this.getOrderStatus(res.data.taxOrderId);
        }
      } else {
        Dialog.alert({
          message: res.msg,
          confirmButtonText: this.$t("App.alert_confirm"),
        });
      }

      // } catch (error) {
      //   console.log(error);
      // }
      // this.$post("/getCardDefault", data).then((response) => {
      //   if (response.code == "success") {
      //     if (response.data && response.data.cardId) {
      //       this.cardId = response.data.cardId;
      //       let code = this.$refs[name].getCode();
      //       let num = code.split(";").length - 1; // 根据;出现的次数 判断笔迹大小
      //       if (code == "") {
      //         // 未填
      //         Dialog.alert({
      //           message: this.$t("Sign.no_sign"),
      //           confirmButtonText: this.$t("App.alert_confirm"),
      //         });
      //         return;
      //       } else if (num < 30) {
      //         // 太小
      //         Dialog.alert({
      //           message: this.$t("Sign.sign_care"),
      //           confirmButtonText: this.$t("App.alert_confirm"),
      //         });
      //       } else {
      //         this.$post("/getUserInfo", {
      //           touristId: this.touristId,
      //         }).then((getUserInfo_response) => {
      //           if (getUserInfo_response.code == "success") {
      //             if (
      //               getUserInfo_response.data.mail ||
      //               getUserInfo_response.data.phone
      //             ) {
      //               // 成功跳转结果页
      //               this.pageWrite = code;
      //               let createOrder_data = {
      //                 touristId: this.touristId,
      //                 cardId: this.cardId,
      //                 sign: this.pageWrite,
      //                 type: name == "signatureToPoint1" ? "1" : "2",
      //               };
      //               // 需要出入境章
      //               if (this.$store.state.passPortType === "29") {
      //                 createOrder_data.entrySealUrl =
      //                   this.$store.state.entrySealUrl;
      //                 if (this.$store.state.counterTypes == "1") {
      //                   // 退税点为机场
      //                   createOrder_data.exitSealUrl =
      //                     this.$store.state.exitSealUrl;
      //                 }
      //               } else {
      //                 if (this.$store.state.dateOfEntry) {
      //                   createOrder_data.dateOfEntry =
      //                     this.$store.state.dateOfEntry;
      //                 }
      //               }
      //               createOrder_data.partnerSourceId = this.partnerSourceId;
      //               this.$post("/createOrder", createOrder_data).then((res) => {
      //                 if (res.code == "success") {
      //                   this.show = true;
      //                   const timer = setInterval(() => {
      //                     //post接口请求三个参数  接口地址、请求参数（没有参数默认{}）、是否显示加载动画（下边定时请求防止多次显示请求加载动画）
      //                     this.$post(
      //                       "/getTaxOrderInfoStatus",
      //                       {
      //                         orderId: res.data.taxOrderId,
      //                       },
      //                       false
      //                     ).then((response) => {
      //                       if (response.code == "success") {
      //                         if (
      //                           response.data.type == 0 ||
      //                           response.data.type == 1 ||
      //                           response.data.type == 4
      //                         ) {
      //                           clearInterval(timer);
      //                           this.show = false;
      //                           this.$store.commit("setCardId", "");
      //                           this.dialog_tel = false;
      //                           if (response.data.orderForSubsidyStatus == 0) {
      //                             this.$router.replace({
      //                               path: "/Accept",
      //                               query: {
      //                                 orderId: res.data.taxOrderId,
      //                               },
      //                             });
      //                             this.$store.commit(
      //                               "setPage",
      //                               "Passport,BankCard"
      //                             );
      //                           } else {
      //                             this.$router.replace({
      //                               path: "/MandatoryPrompt",
      //                               query: {
      //                                 orderId: res.data.taxOrderId,
      //                               },
      //                             });
      //                             this.$store.commit(
      //                               "setPage",
      //                               "Passport,BankCard"
      //                             );
      //                           }
      //                         }
      //                         if (response.data.type == 2) {
      //                           clearInterval(timer);
      //                           this.show = false;
      //                           Dialog.alert({
      //                             message: this.$t("BankCard.changeCard"),
      //                             confirmButtonText:
      //                               this.$t("App.alert_confirm"),
      //                           }).then(() => {
      //                             this.$router.push({
      //                               path: `/BankCard`,
      //                               query: {
      //                                 pageType: 3,
      //                               },
      //                             });
      //                           });
      //                         }
      //                       } else {
      //                         clearInterval(timer);
      //                         this.$store.commit("setCardId", "");
      //                         this.dialog_tel = false;
      //                         this.$router.replace({
      //                           path: "/Accept",
      //                           query: {
      //                             orderId: res.data.taxOrderId,
      //                           },
      //                         });
      //                         this.$store.commit(
      //                           "setPage",
      //                           "Passport,BankCard"
      //                         );
      //                       }
      //                     });
      //                   }, 1000);
      //                 } else {
      //                   Dialog.alert({
      //                     message: res.msg,
      //                     confirmButtonText: this.$t("App.alert_confirm"),
      //                   });
      //                 }
      //               });
      //             } else {
      //               this.dialog_tel = true;
      //               return;
      //             }
      //           }
      //         });
      //       }
      //     } else {
      //       Dialog.alert({
      //         message: this.$t("Sign.add_card"),
      //         confirmButtonText: this.$t("App.alert_confirm"),
      //       });
      //     }
      //   } else {
      //   }
      // });
    },
    // 定时获取订单状态
    getOrderStatus(taxOrderId) {
      const timer = setInterval(() => {
        this.$post(
          "/getTaxOrderInfoStatus",
          { orderId: taxOrderId },
          false
        ).then((response) => {
          if (response.code == "success") {
            if (
              response.data.type == 0 ||
              response.data.type == 1 ||
              response.data.type == 4
            ) {
              clearInterval(timer);
              this.show = false;
              this.$store.commit("setCardId", "");
              this.dialog_tel = false;
              if (response.data.orderForSubsidyStatus == 0) {
                this.$router.replace({
                  path: "/Accept",
                  query: {
                    orderId: taxOrderId,
                  },
                });
                this.$store.commit("setPage", "Passport,BankCard");
              } else {
                this.$router.replace({
                  path: "/MandatoryPrompt",
                  query: {
                    orderId: taxOrderId,
                  },
                });
                this.$store.commit("setPage", "Passport,BankCard");
              }
            }
            if (response.data.type == 2) {
              clearInterval(timer);
              this.show = false;
              Dialog.alert({
                message: this.$t("BankCard.changeCard"),
                confirmButtonText: this.$t("App.alert_confirm"),
              }).then(() => {
                this.$router.push({
                  path: `/BankCard`,
                  query: {
                    pageType: 3,
                  },
                });
              });
            }
          } else {
            clearInterval(timer);
            this.$store.commit("setCardId", "");
            this.dialog_tel = false;
            this.$router.replace({
              path: "/Accept",
              query: {
                orderId: taxOrderId,
              },
            });
            this.$store.commit("setPage", "Passport,BankCard");
          }
        });
      }, 1000);
    },
    getCashOrderStatus(taxOrderId) {
      let index = 0;
      const timer = setInterval(() => {
        index ++;
        if(index > 30) {
          clearInterval(timer);
          this.getCashFindGuaranteeOrderStatus(taxOrderId);
        }
        this.$post(
          "/getCashTaxOrderStatus",
          { orderId: taxOrderId },
          false
        ).then((response) => {
          if (response.code == "success") {
            if (response.data.type == 1) {
              clearInterval(timer);
              this.$router.push({
                path: `/CashQrcode`,
                query: {
                  taxOrderId: taxOrderId,
                },
              });
            } else if (response.data.type == 3) {
            } else {
              clearInterval(timer);
              Dialog.alert({
                message: "银行卡预授权失败，请更换信用卡",
                confirmButtonText: this.$t("App.alert_confirm"),
              }).then(() => {
                this.$router.push({
                  path: `/BankCard`,
                  query: {
                    pageType: 3,
                  },
                });
              });
            }
          } else {
            clearInterval(timer);
            this.$store.commit("setCardId", "");
            this.dialog_tel = false;
            this.$router.replace({
              path: "/Accept",
              query: {
                orderId: res.data.taxOrderId,
              },
            });
            this.$store.commit("setPage", "Passport,BankCard");
          }
        });
      }, 2000);
    },
    // 现金业务主扫
    getCashFindGuaranteeOrderStatus(taxOrderId) {
      this.$post("/cashFindGuaranteeOrderInfo", { orderId: taxOrderId }, false).then(
        (response) => {
          if (response.code == "success") {
            if (response.data.type == 1) {
              clearInterval(timer);
              this.$router.push({
                path: `/CashQrcode`,
                query: {
                  taxOrderId: taxOrderId,
                },
              });
            } else if (response.data.type == 3) {
            } else {
              clearInterval(timer);
              Dialog.alert({
                message: "银行卡预授权失败，请更换信用卡",
                confirmButtonText: this.$t("App.alert_confirm"),
              }).then(() => {
                this.$router.push({
                  path: `/BankCard`,
                  query: {
                    pageType: 3,
                  },
                });
              });
            }
          } else {
            clearInterval(timer);
            this.$store.commit("setCardId", "");
            this.dialog_tel = false;
            this.$router.replace({
              path: "/Accept",
              query: {
                orderId: res.data.taxOrderId,
              },
            });
            this.$store.commit("setPage", "Passport,BankCard");
          }
        }
      );
    },
    // 清空画板
    reset(name) {
      this.$refs[name].reset();
    },
    // 发送验证码
    sendValidCode() {
      // 倒计时60s
      const TIME_COUNT = 60;
      if (!this.userInfo.timer) {
        this.userInfo.count = TIME_COUNT;
        this.userInfo.show = false;
        this.userInfo.timer = setInterval(() => {
          if (this.userInfo.count > 0 && this.userInfo.count <= TIME_COUNT) {
            this.userInfo.count--;
          } else {
            this.userInfo.show = true;
            clearInterval(this.userInfo.timer);
            this.userInfo.timer = null;
          }
        }, 1000);
        let data = {
          contentDetail:
            (this.userInfo.login_radio == "Tel" && this.userInfo.type == 3) ||
            this.userInfo.type == 1
              ? this.value + this.userInfo.phone
              : this.userInfo.mail,
          validType:
            (this.userInfo.login_radio == "Tel" && this.userInfo.type == 3) ||
            this.userInfo.type == 1
              ? 1
              : 2, // 1：手机号；2：邮箱
        };
        this.$post("/sendValidCode", data).then((response) => {
          if (response.code != "success") {
            Dialog.alert({
              message: response.msg,
              confirmButtonText: this.$t("App.alert_confirm"),
            });
          }
        });
      }
    },
    // 选国家编号
    onSelect(action) {
      Toast(action.text);
      this.type = this.type ? false : true;
    },
    // 点击菜单跳转事件
    toJump(name) {
      if (this.pathName != name && this.touristId) {
        // 当前页点自己不可以跳转
        let data = {
          touristId: this.touristId,
          orgId: this.orgId,
        };
        this.$postNoLoading("/stepsCondition", data).then((response) => {
          if (response.code == "success") {
            let bindingCardState = response.data.bindingCardState;
            if (name == "Passport") {
              // 如果从其他页点护照页 都可以点 显示信息页3 (上传页1)
              this.$router.push({
                path: `/${name}`,
                query: {
                  touristId: this.$route.query.touristId,
                  pageType: "3",
                },
              });
            } else if (name == "BankCard") {
              if (
                this.pathName == "Passport" ||
                this.pathName == "Receipt" ||
                this.pathName == "ReceiptCash" ||
                this.pathName == "Sign"
              ) {
                // 如果从护照页点银行卡页 判断是否绑卡
                // 绑了 就跳转卡列表3 (上传卡1 补全信息2)
                // 没绑 跳绑卡

                // 如果从税单页点银行卡页 跳转卡列表

                // 如果从签字页点银行卡页 跳转卡列表

                this.$router.push({
                  path: `/${name}`,
                  query: {
                    touristId: this.$route.query.touristId,
                    pageType: "3",
                  },
                });
              }
            } else if (name == "Receipt") {
              if (this.pathName == "Passport" || this.pathName == "BankCard") {
                // 如果从护照页点税单页 判断是否绑卡
                // 绑了 就跳转
                // 没绑 不动

                // 如果从银行卡页点税单页 判断是否绑卡
                // 绑了就跳转
                // 没绑 不动

                // 如果从签字页点税单页 回到上传申请单页

                if (bindingCardState == "1") {
                  this.$router.push({
                    path: `/${name}`,
                    query: {
                      touristId: this.$route.query.touristId,
                      pageType: "1",
                    },
                  });
                }
              } else if (this.pathName == "Sign") {
                this.$router.push({
                  path: `/${name}`,
                  query: {
                    touristId: this.$route.query.touristId,
                    pageType: "1",
                  },
                });
              }
            } else if (name == "ReceiptCash") {
              if (this.pathName == "Passport" || this.pathName == "BankCard") {
                // 如果从护照页点税单页 判断是否绑卡
                // 绑了 就跳转
                // 没绑 不动

                // 如果从银行卡页点税单页 判断是否绑卡
                // 绑了就跳转
                // 没绑 不动

                // 如果从签字页点税单页 回到上传申请单页

                if (bindingCardState == "1") {
                  this.$router.push({
                    path: `/${name}`,
                    query: {
                      touristId: this.$route.query.touristId,
                      pageType: "1",
                    },
                  });
                }
              } else if (this.pathName == "Sign") {
                this.$router.push({
                  path: `/${name}`,
                  query: {
                    touristId: this.$route.query.touristId,
                    pageType: "1",
                  },
                });
              }
            } else if (name == "Sign") {
              return;
            }
          }
        });
      }
    },
    // 选中国家电话编号
    onConfirm(value) {
      this.value = value.areaCode;
      this.icon = value.countryIconView;
      this.showPicker = false;
    },
    // 控制菜单图标显示状态
    handleClass() {
      // 证件页默认亮 当前页亮
      // this.$nextTick(() => {
      //   this.$refs["Passport"].className = "step-block select-before";
      //   this.$refs["Passport_standard"].className = "step-block select-before";
      //   this.$refs["Sign"].className = "step-block select";
      //   this.$refs["Sign_standard"].className = "step-block select";
      // });

      let page = this.$store.state.page || "";
      let arr = page.indexOf(",") != "-1" ? page.split(",") : "";
      if (arr.length > 1) {
        for (let i = 0; i < arr.length; i++) {
          // if(!this.orientation) {
          this.$refs[`${arr[i]}`].className = "step-block select-before";
          // }
          this.$refs[`${arr[i]}_standard`].className =
            "step-block select-before";
        }
      } else {
        this.$refs[`${page}`].className = "step-block select";
        this.$refs[`${page}_standard`].className = "step-block select";
      }
      this.$refs.Sign.className = "step-block select";
      this.$refs.Sign_standard.className = "step-block select";
      // let pageList = ["Passport", "BankCard", "Receipt", "Sign"];

      // for (let i = 0; i < pageList.length; i++) {
      //   if (this.$route.name == pageList[i]) {
      //     this.$nextTick(() => {
      //       this.$refs[!this.orientation ? this.$route.name : `${this.$route.name}_standard`].className = "step-block select";
      //     });
      //   } else {
      //     if (this.$refs[!this.orientation ? pageList[i] : `${pageList[i]}_standard`].className == "step-block select") {
      //       this.$nextTick(() => {
      //         this.$refs[!this.orientation ? this.$route.name : `${this.$route.name}_standard`].className =
      //           "step-block select-before";
      //       });
      //     }
      //   }
      // }

      // let page = "";
      // if (this.$store.state.page) {
      //   page = this.$store.state.page;
      //   pageList.forEach(item => {
      //     if(page.includes(item)) {
      //       this.$refs[!this.orientation ? item : `${item}_standard`].className = "step-block select-before";
      //     } else {
      //       this.$refs[!this.orientation ? item : `${item}_standard`].className = "step-block";
      //     }
      //   })
      // } else {
      //   return;
      // }
    },
  },
};
</script>
<style scoped>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.block {
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding: 0.5rem 0.1rem;
  font-size: 0.2rem;
  overflow-y: auto;
}
.block > p {
  text-align: center;
  font-size: 0.3rem;
}
.row_css {
  height: 1rem;
}
.col_css {
  border-top: 1px solid #000000;
  border-left: 1px solid #000000;
  border-right: 1px solid #000000;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0.1rem;
}
.col_css2 {
  border-top: 1px solid #000000;
  border-right: 1px solid #000000;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0.1rem;
}
.col_css2 > p,
.col_css6 > p {
  color: transparent;
  text-shadow: #111 0 0 4px;
}
/* 转账授权委托书 ↓↓↓↓↓↓↓↓↓↓↓ */
.col_css5 {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0.1rem;
}
.col_css6 {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0.1rem;
}
.col_css3 {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0.1rem;
  justify-content: right;
}
.col_css4 {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0.1rem;
  justify-content: right;
}
.row_css_2 {
  border-bottom: 1px solid #ccc;
  margin-bottom: 0.2rem;
  padding-bottom: 0.2rem;
}
</style>
