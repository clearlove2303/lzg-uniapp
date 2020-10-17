<template>
  <view>
    <view v-for="item in notifies" :key="item.id">
      <view class="notice">
        <view class="notice-title">{{ item.label }}</view>
        <view>
            <switch :checked="item.checked" color='#3b8bfd' @change="switchChange" @click="change(item.id)"/>
        </view>
      </view>
      <text v-if="item.key === 'STUDY_NOTIFY'" class="notice-text">此开关只在报名三个月内有效</text>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex';
import service from '@/common/service-loader'

let checkValue;

export default {
    data() {
      return {
        notifies: [],
      }
    },

    computed: mapState(['hasLogin']),

    onShow() {
      if (!this.hasLogin) {
        this.goLogin();
      }
    },

    onLoad() {
      if(this.hasLogin) {
        this.getNotify();
      }
    },

    methods: {
      switchChange(e) {
        checkValue = e.detail.value;
        if (checkValue == true) {
          checkValue = 1;
        } else {
          checkValue = 0;
        }
      },

      change(id) {
        this.updateNotify(id);
      },

      updateNotify(id) {
        service('notify-setting').update(id, checkValue).then(res => {
          if (res.data.error_code && res.data.error_code != 'SUCCESS') {
            return;
          }
        })
      },

      getNotify() {
        let user = this.$jwt.user();
        service('notify-setting').query(user.id).then(res => {
          if (res.data.error_code) {
            return;
          }
          this.notifies = res.data.items;
          this.notifies.forEach(item => {
            if (item.value === '1') {
              this.$set(item, 'checked', true)
            } else {
              this.$set(item, 'checked', false)
            }
          });
        })
      }
    }
}
</script>

<style scoped>
switch {
  transform: scale(0.7);
}

.notice {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 702rpx;
  height: 88rpx;
  border: 2rpx solid #e2e2e2;
  border-radius: 3rpx;
  margin: 20rpx auto 0;
  padding: 0 30rpx;
  box-sizing: border-box;
  font-size: 32rpx;
}

.notice-text {
  display: block;
  margin-top: 10rpx;
  color: #333;
  font-size: 28rpx;
  text-align: center;
}
</style>
