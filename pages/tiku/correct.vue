<template>
  <view>
    <view>
      <view class="advice-textarea">
        <textarea
        class="textarea"
        :hidden="show"
        v-model="textarea"
        placeholder="请详细描述问题"
        rows="5"
        maxlength="1000"
        ></textarea>
      </view>
      <view class="num">
          剩余字数：<span>{{ computedCharLen }}</span>/1000
      </view>
      <view class="advice-btn">
        <button class="primary" :disabled="disabled" @click="submit">提交</button>
      </view>
    </view>
  </view>
</template>

<script>
import services from '@/common/service-loader';

let testId = null;

export default {
  data() {
    return {
      show: false,
      textarea: '',
      disabled: false,
    }
  },
  computed: {
    computedCharLen() {
      return this.textarea.length;
    }
  },
  onLoad(option) {
    testId = option.testId;
  },
  methods: {
    showToast(title) {
      uni.showToast({
        title: title,
        icon: 'none'
      });
    },

    submit() {
      if (this.disabled) {
        return;
      }

      if (this.textarea.replace(/\s*/g,"") == '') {
        this.textarea = '';
        this.showToast('请填写完整信息');
        return;
      }

      const data = {
        content: this.textarea,
      };

      const user = this.$jwt.user();
      if (user !== null) {
        data.user_id = user.id;
      }

      services('test').correct(testId, data).then((res) => {
        if (res.data.is_repeated) {
          this.showToast('该题目已有学员提出纠错，感谢您的参与');
          return;
        }
        this.showToast('提交成功');
      })
      this.disabled = true;
      setTimeout(()=> {
        this.$loc.back();
      }, 1000);
    },
  }
}
</script>

<style scoped>
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

button::after {
  border: none!important;
}
</style>

