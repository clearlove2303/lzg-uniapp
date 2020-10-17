<template>
  <view class="uni-navbar">
    <view
      :class="{'uni-navbar--fixed': fixed,'uni-navbar--shadow':border,'uni-navbar--border':border}"
      :style="{'background-color':backgroundColor}"
      class="uni-navbar__content">
      <uni-status-bar v-if="statusBar"/>
      <view
        :style="{color:color}"
        class="uni-navbar__header uni-navbar__content_view">
        <view
          class="uni-navbar__header-btns uni-navbar__content_view">
          <view
            v-if="leftIcon.length"
            class="uni-navbar__content_view">
            <view v-for="(item, index) in leftIcon" :key="index">
              <text class="iconfont" :class="item" @click="onClickLeft" style="font-size:24px; color: #3b8bfd; margin-left: 8px"></text>
            </view>
          </view>
          <view
            v-if="leftText.length"
            :class="{'uni-navbar-btn-icon-left':!leftIcon.length}"
            class="uni-navbar-btn-text uni-navbar__content_view"
             style="color: #3b8bfd; margin-left: 14px"
            @click="onClickLeftText">{{ leftText }}</view>
          <slot name="left"/>
        </view>
        <view class="uni-navbar__header-container uni-navbar__content_view">
          <view
            v-if="title.length"
            class="uni-navbar__header-container-inner uni-navbar__content_view">{{ title | omitString(12) }}</view>
          <!-- 标题插槽 -->
          <slot/>
        </view>
        <view
          :class="title.length?'uni-navbar__header-btns-right':''"
          class="uni-navbar__header-btns uni-navbar__content_view">
          <view
            v-if="rightIcon.length"
            class="uni-navbar__content_view">
            <view v-for="(item, index) in rightIcon" :key="index">
              <text class="iconfont" :class="item" @click="onClickRight" style="font-size: 25px; color: #3b8bfd; margin-right: 8px"></text>
            </view>
          </view>
          <!-- 优先显示图标 -->
          <view
            v-if="rightText.length&&!rightIcon.length"
            class="uni-navbar-btn-text uni-navbar__content_view">{{ rightText }}</view>
          <slot name="right"/>
        </view>
      </view>
    </view>
    <view
      v-if="fixed"
      class="uni-navbar__placeholder">
      <uni-status-bar v-if="statusBar"/>
      <view class="uni-navbar__placeholder-view"/>
    </view>
  </view>
</template>

<script>
import uniStatusBar from '@/components/vendor/uni-status-bar/uni-status-bar.vue'

export default {
  name: 'UniNavBar',
  components: {
    uniStatusBar,
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    leftText: {
      type: String,
      default: ''
    },
    rightText: {
      type: String,
      default: ''
    },
    leftIcon: {
      type: Array,
      default: () => []
    },
    rightIcon: {
      type: Array,
      default: () => []
    },
    fixed: {
      type: [Boolean, String],
      default: false
    },
    color: {
      type: String,
      default: '#000000'
    },
    leftIconColor: {
      type: String,
      default: '#3b8bfd'
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF'
    },
    statusBar: {
      type: [Boolean, String],
      default: false
    },
    shadow: {
      type: [String, Boolean],
      default: true
    },
    border: {
      type: [String, Boolean],
      default: true
    }
  },
  methods: {
    onClickLeft () {
      this.$emit('click-left')
    },
    onClickLeftText () {
      this.$emit('click-left-text')
    },
    onClickRight () {
      this.$emit('click-right')
    },
  }
}
</script>

<style lang="scss">
	$nav-height:44px;

	.uni-navbar {
		&__content {
			display: block;
			position: relative;
			width: 100%;
			background-color: $uni-bg-color;
			overflow: hidden;

			.uni-navbar__content_view {
				// line-height: $nav-height;
				display: flex;
				align-items: center;
			}
		}

		&__header {
			display: flex;
			flex-direction: row;
			width: 100%;
			height: $nav-height;
			line-height: $nav-height;
			font-size: 16px;

			&-btns {
				display: inline-flex;
				flex-wrap: nowrap;
				flex-shrink: 0;
				width: 120upx;
				padding: 0 12upx;

				&:first-child {
					padding-left: 0;
				}

				&:last-child {
					width: 60upx;
				}

        &-right:last-child{
          width: 120rpx;
          text-align: right;
          flex-direction: row-reverse;
        }
			}

			&-container {
				width: 100%;
				margin: 0 10upx;

				&-inner {
					width: 100%;
					display: flex;
					justify-content: center;
					font-size: 30upx;
					// padding-right: 60upx;
				}
			}
		}

		&__placeholder {
			&-view {
				height: $nav-height;
			}
		}

		&--fixed {
			position: fixed;
			z-index: 998;
		}
	}
</style>
