<template>
	<view class="load-more">
		<view class="loading-img" v-show="loadingType === 1 && showImage">
			<view class="load1">
				<view class="load1-view load1-1" :style="{background:color}"></view>
				<view class="load1-view load1-2" :style="{background:color}"></view>
				<view class="load1-view load1-3" :style="{background:color}"></view>
				<view class="load1-view load1-4" :style="{background:color}"></view>
			</view>
			<view class="load2">
				<view class="load2-view load2-1" :style="{background:color}"></view>
				<view class="load2-view load2-2" :style="{background:color}"></view>
				<view class="load2-view load2-3" :style="{background:color}"></view>
				<view class="load2-view load2-4" :style="{background:color}"></view>
			</view>
			<view class="load3">
				<view class="load3-view load3-1" :style="{background:color}"></view>
				<view class="load3-view load3-2" :style="{background:color}"></view>
				<view class="load3-view load3-3" :style="{background:color}"></view>
				<view class="load3-view load3-4" :style="{background:color}"></view>
			</view>
		</view>
		<text class="loading-text" :style="{color:color}">
		{{loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)}}</text>
	</view>
</template>
 
<script>
	export default {
		name: "load-more",
		props: {
			loadingType: {
				//上拉的状态：0-loading前；1-loading中；2-没有更多了
				type: Number,
				default: 0
			},
			showImage: {
				type: Boolean,
				default: true
			},
			color: {
				type: String,
				default: "#777777"
			},
			contentText: {
				type: Object,
				default () {
					return {
						contentdown: "上拉显示更多",
						contentrefresh: "正在加载...",
						contentnomore: "没有更多数据了"
					};
				}
			}
		},
		data() {
			return {}
		}
	}
</script>
 
<style>
	.load-more {
		display: flex;
		flex-direction: row;
		height: 80rpx;
		align-items: center;
		justify-content: center;
	}
 
	.loading-img {
		height: 24px;
		width: 24px;
		margin-right: 10px;
	}
 
	.loading-text {
		font-size: 28rpx;
		color: #777777;
	}
 
	.load1,
	.load2,
	.load3 {
		position: absolute;
		height: 24px;
		width: 24px;
	}
 
	.load2 {
		transform: rotate(30deg);
	}
 
	.load3 {
		transform: rotate(60deg);
	}
 
	.load1-view,
	.load2-view,
	.load3-view {
		width: 6px;
		height: 2px;
		border-top-left-radius: 1px;
		border-bottom-left-radius: 1px;
		background: #777;
		position: absolute;
		opacity: 0.2;
		transform-origin: 50%;
		-webkit-animation: load 1.56s ease infinite;
	}
 
	.load1-1,
	.load2-1,
	.load3-1 {
		transform: rotate(90deg);
		top: 2px;
		left: 9px;
	}
 
	.load1-2,
	.load2-2,
	.load3-2 {
		-webkit-transform: rotate(180deg);
		top: 11px;
		right: 0px;
	}
 
	.load1-3,
	.load2-3,
	.load3-3 {
		transform: rotate(270deg);
		bottom: 2px;
		left: 9px;
	}
 
	.load1-4,
	.load2-4,
	.load3-4 {
		top: 11px;
		left: 0px;
	}
 
	.load1-1 {
		animation-delay: 0s;
	}
 
	.load2-1 {
		animation-delay: 0.13s;
	}
 
	.load3-1 {
		animation-delay: 0.26s;
	}
 
	.load1-2 {
		animation-delay: 0.39s;
	}
 
	.load2-2 {
		animation-delay: 0.52s;
	}
 
	.load3-2 {
		animation-delay: 0.65s;
	}
 
	.load1-3 {
		animation-delay: 0.78s;
	}
 
	.load2-3 {
		animation-delay: 0.91s;
	}
 
	.load3-3 {
		animation-delay: 1.04s;
	}
 
	.load1-4 {
		animation-delay: 1.17s;
	}
 
	.load2-4 {
		animation-delay: 1.30s;
	}
 
	.load3-4 {
		animation-delay: 1.43s;
	}
 
	@-webkit-keyframes load {
		0% {
			opacity: 1;
		}
 
		100% {
			opacity: 0.2;
		}
	}
</style>