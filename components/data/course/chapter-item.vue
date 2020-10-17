<template>
  <view :class="{ 'uni-collapse-cell--disabled': disabled,'uni-collapse-cell--notdisabled': !disabled, 'uni-collapse-cell--open': isOpen,'uni-collapse-cell--hide':!isOpen }" class="uni-collapse-cell">
		<view class="uni-collapse-cell__title" @click="onClick">
			<view class="uni-collapse-cell__title-inner">
        <text class="chapter">{{ chapterTitle }}</text>
        <text class="uni-collapse-cell__title-text">{{ title }}</text>
      </view>
			<view :class="{ 'uni-collapse-cell__title-arrow-active': isOpen, 'uni-collapse-cell--animation': showAnimation === true }" class="uni-collapse-cell__title-arrow">
				<uni-icons color="#bbb" size="20" type="arrowdown" />
			</view>
		</view>
		<view :class="{'uni-collapse-cell__content--hide':!isOpen}" class="uni-collapse-cell__content">
			<view :class="{ 'uni-collapse-cell--animation': showAnimation === true }" class="uni-collapse-cell__wrapper" :style="{'transform':isOpen?'translateY(0)':'translateY(-50%)','-webkit-transform':isOpen?'translateY(0)':'translateY(-50%)'}">
				<slot />
			</view>
		</view>
	</view>
</template>

<script>
import { uniIcons } from "@dcloudio/uni-ui";

export default {
  name: 'UniCollapseItem',
  components: {
    uniIcons
  },
  props: {
    chapterTitle: { // 列表标题
      type: String,
      default: ''
    },
    title: { // 列表标题
      type: String,
      default: ''
    },
    name: { // 唯一标识符
      type: [Number, String],
      default: 0
    },
    disabled: { // 是否禁用
      type: Boolean,
      default: false
    },
    showAnimation: { // 是否显示动画
      type: Boolean,
      default: false
    },
    open: { // 是否展开
      type: Boolean,
      default: false
    },
    thumb: { // 缩略图
      type: String,
      default: ''
    }
  },
  data () {
    /**
     * TODO 兼容新旧编译器
     * 新编译器（自定义组件模式）下必须使用固定数值，否则部分平台下会获取不到节点。
     * 随机数值是在旧编译器下使用的，旧编译器模式已经不推荐使用，后续直接废掉随机数值的写法。
     */
    const elId = this.__callback_hook ? 'uni_collapse_item' : `Uni_${Math.ceil(Math.random() * 10e5).toString(36)}`
    return {
      isOpen: false,
      height: 'auto',
      elId: elId
    }
  },
  watch: {
    open (val) {
      this.isOpen = val
    }
  },
  inject: ['collapse'],
  created () {
    this.isOpen = this.open
    this.nameSync = this.name ? this.name : this.collapse.childrens.length
    this.collapse.childrens.push(this)
    if (this.collapse.accordion) {
      if (this.isOpen) {
        let lastEl = this.collapse.childrens[this.collapse.childrens.length - 2]
        if (lastEl) {
          this.collapse.childrens[this.collapse.childrens.length - 2].isOpen = false
        }
      }
    }
  },
  // #ifdef H5
  mounted () {
    this.getSize()
  },
  // #endif
  // #ifndef H5
  onReady () {
    this.getSize()
  },
  // #endif
  methods: {
    getSize () {
      if (this.showAnimation) {
        uni.createSelectorQuery().in(this).select(`#${this.elId}`).boundingClientRect().exec((ret) => {
          this.height = ret[0].height + 'px'
        })
      }
    },
    onClick () {
      if (this.disabled) {
        return
      }
      if (this.collapse.accordion) {
        this.collapse.childrens.forEach(vm => {
          if (vm === this) {
            return
          }
          vm.isOpen = false
        })
      }
      this.isOpen = !this.isOpen
      this.collapse.onChange && this.collapse.onChange()
    }
  }
}
</script>

<style scoped>
	.uni-collapse-cell {
		flex-direction: column;
		border-color: #e5e5e5;
		border-bottom-width: 1px;
		border-bottom-style: solid;
	}

	.uni-collapse-cell--hover {
		background-color: #ffffff;
	}

	.uni-collapse-cell--open {
		background-color: #ffffff;
	}

	.uni-collapse-cell--disabled {
		background-color: #ffffff;
	}

	.uni-collapse-cell--animation {
		transition-property: transform;
		transition-duration: 0.3s;
		transition-timing-function: ease;
	}
  
	.uni-collapse-cell__title {
		padding: 10rpx 25rpx;
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		width: 100%;
		box-sizing: border-box;
		/* #endif */
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
    border-color: #eeeeee;
		border-bottom-width: 1px;
		border-bottom-style: solid;
	}

	.uni-collapse-cell__title:active {
		background-color: #ffffff;
	}

	.uni-collapse-cell__title-img {
		height: 52rpx;
		width: 52rpx;
		margin-right: 10px;
	}

	.uni-collapse-cell__title-arrow {
		width: 20px;
		height: 20px;
		transform: rotate(0deg);
		transform-origin: center center;

	}

	.uni-collapse-cell__title-arrow-active {
		transform: rotate(180deg);
	}

  .uni-collapse-cell__title-inner {
    /* #ifdef MP-WEIXIN */
    display: flex;
    /* #endif */
    flex-direction: column;
    width: 660rpx;
  }

	.uni-collapse-cell__title-text {
		flex: 1;
		font-size: 14px;
		/* #ifndef APP-NVUE */
		white-space: nowrap;
		color: inherit;
		/* #endif */
		/* #ifdef APP-NVUE */
		lines: 1;
		/* #endif */
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.uni-collapse-cell__content {
		overflow: hidden;
	}

	.uni-collapse-cell__wrapper {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
	}

	.uni-collapse-cell__content--hide {
		height: 0px;
		line-height: 0px;
	}

  .chapter {
    margin-bottom: 15rpx;
    flex: 1;
    font-weight: bold;
    font-size: 15px;
    color: #222;
  }
</style>
