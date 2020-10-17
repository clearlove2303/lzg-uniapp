<template>
  <view>
    <view>
      <view class="advice-type">
        <view class="advice-check" @click="onClick">
          <view class="advice-text" :style="textColor">{{ typeText }}</view>
          <view class="advice-arrow"></view>
        </view>
      </view>
      <view class="advice-textarea">
        <textarea
        class="textarea"
        :hidden="show"
        v-model="textarea"
        placeholder="请留下您的问题和建议"
        rows="5"
        maxlength="420"
        ></textarea>
      </view>
      <view class="num">
          剩余字数：<span>{{ computedCharLen }}</span>/420
      </view>
      <view class="advice-btn">
        <button class="primary" :disabled="disabled" @click="submit">提交</button>
      </view>
      <view class="advice-list" v-if="show" @click="maskingClick">
        <view v-for="(item, index) in adviceTypes" :key="index" @click="select(item)" class="advice-option">{{ item.text }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import service from '@/common/service-loader'

let imgSrc = null;
let user = null;
export default {
  data() {
    return {
      adviceTypes: [
        {type: 'BSALE', text: '售前'},
        {type: 'ASALE', text: '售后'},
        {type: 'TOUSU', text: '投诉'},
      ],
      typeText: "请选择反馈类型",
      adviceType: '',
      show: false,
      textColor: {},
      textarea: '',
      disabled: false,
    }
  },
  computed: {
    computedCharLen() {
      return this.textarea.length;
    }
  },
  methods: {
    postAdvice() {
      let user = null;
      user = this.$jwt.user();
      if (!user) {
        return;
      }

      return service('user').advise(this.adviceType, this.textarea);
    },
    onClick() {
      this.show = true;
    },
    select(item) {
      this.typeText = item.text;
      this.adviceType = item.type;
      this.textColor = "color: #333";
      this.show = false;
    },
    maskingClick() {
      this.show = false;
    },
    async submit() {
      if (this.disabled) {
        return;
      }

      if (this.typeText == "请选择反馈类型") {
        uni.showToast({
          title: '请选择反馈类型',
          icon: 'none'
        });
        return;
      }

      if (!this.adviceType || !this.textarea) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }

      try {
        await this.postAdvice();
      } catch (error) {
        if (error) {
          uni.showToast({
            title: '提交失败',
            icon: 'none'
          });
          return;
        }
      }

      uni.showToast({
        title: '提交成功',
        icon: 'none'
      });

      this.disabled = true;
    },
  }
}
</script>

<style scoped>
.advice-check {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 702rpx;
  height: 88rpx;
  margin: 30rpx auto 0;
  border: 1rpx solid #eee;
}

.advice-text {
  margin-left: 30rpx;
  font-size: 30rpx;
  color: #999;
}

.advice-arrow {
  margin: 14rpx 39rpx 0 0;
  width: 0rpx;
  border: 11rpx solid;
  border-color:black transparent transparent;
}

.advice-list {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-top: 127rpx;
  z-index: 1000;
}

.advice-option {
  margin: auto;
  width: 711rpx;
  height: 88rpx;
  padding-left: 31rpx;
  border: 1rpx solid #fff;
  box-sizing: border-box;
  background-color: rgb(245, 245, 245);
  line-height: 88rpx;
  font-size: 30rpx;
  color: #333;
  z-index: 10000;
}

.advice-phone {
  width: 702rpx;
  height: 88rpx;
  margin: 31rpx auto 0;
  border: 1rpx solid #eee;
}

.advice-input {
  padding-left: 30rpx;
  height: 88rpx;
  line-height: 88rpx;
  color: #333;
  font-size: 30rpx;
}

.advice-textarea {
  margin: 31rpx auto 0;
  width: 702rpx;
  height: 600rpx;
  border: 1rpx solid #eee;
}

.textarea {
  flex: 1;
  padding: 30rpx 30rpx 0;
  width: 642rpx;
  height: 570rpx;
  color: #333;
  font-size: 30rpx;
}

.num {
  display: flex;
  justify-content: flex-end;
  margin: 5rpx auto 0 auto;
  width: 702rpx;
  color: #333;
  font-size: 27rpx;
}

.advice-btn {
  padding-top: 60rpx;
  align-items: center;
}

.primary {
  width: 690rpx;
  height: 88rpx;
  border-radius: 44rpx;
  opacity: 1;
  background-color: rgb(59, 139, 253);
  color: rgb(255, 255, 255);
  font-size: 34rpx;
  -webkit-box-align: center;
  -webkit-box-pack: center;
}

.advice-btn>>> button::after {
  border: 0;
}

</style>

