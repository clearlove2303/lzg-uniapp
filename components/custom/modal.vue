<template>
	<view class="modal-container" v-if="show" @click.stop='cancel(2)'>
		<view class="modal-content">
			<view class="modal-title" :class="{'modal-title-padding': !text}" v-if='title'>
				<text class="modal-title-text">{{ title }}</text>
			</view>
			<view class="modal-article" v-if="text && textShow">
				<text class="modal-article-text">{{ text }}</text>
			</view>
      <!-- issue #3194 -->
      <view class="modal-article" v-if="privacyPolicy">
        <slot name="privacyPolicy"></slot>
      </view>
			<view class="modal-row">
				<!-- 不显示取消按钮 -->
				<view class="modal-col modal-col-first" hover-class="modal-hover" v-if="noCancel" @click.stop="cancel('cancel')">
					<text :style="cancelStyle" class="modal-row-text">{{ cancelText }}</text>
				</view>
				<view class="modal-col modal-confirm" hover-class="modal-hover" @click.stop='confirm'>
					<text :style="confirmStyle" class="modal-row-text">{{ confirmText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'modal',
		props: {
			title: {
				type: String,
				default: ''
			},
			text: {
				type: String,
				default: ''
			},
			noCancel: {
				type: Boolean,
				default: false
			},
			show: {
				type: Boolean,
				default: false
			},
			cancelText: {
				type: String,
				default: '取消'
			},
			cancelStyle: {
				type: [String, Object]
			},
			confirmText: {
				type: String,
				default: '确定'
			},
			confirmStyle: {
				type: [String, Object]
			},
			prevent: {
				type: Boolean,
				default: true
			},
			value: {
				type: Boolean,
				default: false
			},
			privacyPolicy: {
				type: Boolean,
				default: false
			},
      textShow: {
        type: Boolean,
        default: false
      },
      disableScreenClick: {
        type: Boolean,
        default: false
      }
		},
		methods: {
			confirm(){
				this.$emit('confirm')
				this.$emit('event')
			},
			cancel(type){
        if (!this.disableScreenClick || type == 'cancel') {
          this.$emit('cancel')
          this.$emit('event')
        }
			},
		}
	}
</script>

<style lang="scss">
	$fontSizeLg: 17px;
	$fontSizeSm: 13px;

	.modal-container{
		position: fixed;top: 0;left: 0;right: 0;bottom: 0;z-index: 999;background: rgba(0, 0, 0, .6);transition: all .2s;display: flex;align-items: center;justify-content: center;
		.modal-content{
			width: 80%;border-radius: 26rpx;background: #fff;overflow: hidden;animation: fadeZoom .15s linear;
			.modal-title{
				padding: 30rpx 30rpx 0;text-align: center;color: #000;font-size: $fontSizeLg;font-weight: 700;
			}
			.modal-title-padding{padding-bottom: 30rpx;}
			.modal-article{
				padding: 40rpx 30rpx;font-size: $fontSizeSm;color: #000;text-align: center;
			}
			.modal-row{
				display: flex;text-align: center;font-size: $fontSizeLg;line-height: 100rpx;position: relative;color: #007AFF;border-top:0.5px solid rgba(9, 20, 31, 0.13);
				.modal-col{
					flex: 1;width: 100%;position: relative;
				}
				.modal-col:first-child::after{
					content: '';position: absolute;top: 0;bottom: 0;right: 0;border-right: 1px solid rgba(9, 20, 31, 0.13);transform: scaleX(.36);
				}
				.modal-confirm{color: rgb(0, 122, 255);}
				.modal-hover{background: #f2f2f2;}
			}
			.modal-row::after{
				content: '';position: absolute;left: 0;right: 0;top: 0;border-top:0.5px solid rgba(9, 20, 31, 0.13);transform: scaleY(.36);
			}
		}
		@keyframes fadeZoom {
			0%{transform: scale(.7);opacity: .6;}
			80%{transform: scale(1.2);opacity: .3;}
			100%{transform: scale(1);opacity: 1;}
		}
	}
</style>
