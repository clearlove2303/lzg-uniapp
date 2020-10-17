<template>
  <view>
    <view class="reason">
      <view class="reason-title">注销原因</view>
      <radio-group class="reason-list" @change="radioChange">
          <label class="reason-list-cell reason-list-cell-pd" v-for="(item,index) in reasons" :key="index">
            <view class="reason-item">
              <radio :id="item.name" :value="item.name" :checked="item.checked" color="#3b8bfd"></radio>
              <label :for="item.value">
                  <text>{{item.name}}</text>
              </label>
            </view>
          </label>
      </radio-group>
      <textarea
        v-if="checkedValue === '其他'"
        placeholder="请您自行输入注销理由(可输入140个字)"
        v-model="reason"
        class="textarea"></textarea>
    </view>
    <button @click="gopage">下一步</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      reasons: [{
          value: '1',
          name: '不想自己的安全隐私泄露',
          checked: true
        },
        {
          value: '2',
          name: '我已拥有多个账号',
        },
        {
          value: '3',
          name: '其他',
        },
      ],
      checkedValue: '不想自己的安全隐私泄露',
      reason: '',
    }
  },

  methods: {
    radioChange(e) {
      this.checkedValue = e.detail.value
    },

    gopage() {
      if (this.checkedValue === '其他') {
        if (this.reason === '') {
          uni.showToast({
            title:'理由不能为空',
            icon: 'none'
          });
          return
        }
        this.$loc.open(`logoff/index?reason=${this.reason}`);
      } else {
        this.$loc.open(`logoff/index?reason=${this.checkedValue}`);
      }
    }
  }
}
</script>

<style scoped>
.reason {
  margin: 30rpx auto;
  width: 702rpx;
  padding-bottom: 201rpx;
  padding-top: 40rpx;
  box-shadow: 0 0 6px 2px #eee;
}

.reason-title {
  text-align: center;
  font-size: 40rpx;
  color: #000;
  font-weight: 500;
}

.reason-list {
  margin: 40rpx 0 0 60rpx;
  font-size: 30rpx;
  color: #333;
}

.reason-item {
  margin-top: 30rpx;
}

.reason-item label {
  margin-left: 12rpx;
}

textarea {
  margin: 20rpx auto;
  width: 582rpx;
  height: 360rpx;
  padding: 20rpx;
  box-sizing: border-box;
  border: 1px solid #ddd;
  font-size: 24rpx;
  color: #999;
}

button {
  display: block;
  margin: 40rpx auto 0;
  width: 702rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background: #3b8bfd;
  border: none;
  font-size: 34rpx;
  color: #fff;
}

button::after {
  border: none;
}
</style>
