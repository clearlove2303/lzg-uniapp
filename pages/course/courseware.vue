<template>
  <view>
    <view v-if="hasDocument">
      <view v-for="(item, index) in documentList" :key="index">
        <view class="document-download">
          <view
            class="document-download-container"
            @click="calculateCounts(item, index)">
            <view class="iconfont icon-wendangxiazai"></view>
            <view class="title-content" >
              <view class="title-box">
                <view class="title">{{ item.title }}</view>
              </view>
              <view class="download-box">
                <view class="file-size">{{ item.file | formatFileSize }}</view>
                <view class="download">
                  <text class="iconfont icon-xiazaishu"></text>
                  {{ item.downloads }}
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <text class="indicator-text" v-if="noMore">没有更多了</text>
    </view>
    <view class="no-order-records" v-if="noDocument">
      <!-- #ifdef  MP-WEIXIN -->
      <image :src="noCourseImage | handleImgUrl('507', '345')" mode="scaleToFill" style="width: 507rpx; height: 345rpx"></image>
      <!-- #endif -->
      <!-- #ifdef  APP-PLUS -->
      <cache-image :imgUrl="noCourseImage | handleImgUrl('507', '345')" imgMode="scaleToFill" style="width: 507rpx; height: 345rpx"></cache-image>
      <!-- #endif -->
      <text class="no-order-text">暂无课件~</text>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex';
import services from '@/common/service-loader';
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
const STATICURL = getApp().globalData.CDN;

let totalPage = null,
    page = 1,
    courseId = null;

export default {
  // #ifdef  APP-PLUS
  components: { cacheImage },
  // #endif
  data() {
    return {
      hasDocument: false,
      noDocument: false,
      documentList: [],
      noMore: false,
      noCourseImage: `${STATICURL}img-no-exam.png`,
    }
  },

  onLoad(options) {
    courseId = options.courseId;
    this.getDocuments();
  },

  // 下拉刷新
  onPullDownRefresh() {
    page = 1;
    this.getDocuments();
  },

  onReachBottom() {
    if (page < totalPage) {
      page++;
      this.getDocuments();
    } else {
      this.noMore = true;
    }
  },
  computed: mapState(['hasLogin']),

  methods: {
    getDocuments() {
      services('document').query({"course_id": courseId, 'type': 'COURSEWARE'}, page, 50).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }
        if (res.data.total_count <= 0) {
          this.noDocument = true;
          return;
        }
        this.getDocumentList(res.data);
      })
    },

    getDocumentList(data) {
      // 如果所有文件都没值则显示图片
      let isFileNull = false;
      for (var i = 0; i < data.items.length; i++) {
        if (data.items[i].file !== null) {
          isFileNull = true;
        }
      }
      if (isFileNull == false) {
        this.noDocument = true;
        return;
      }
      totalPage = data.page_count;
      uni.stopPullDownRefresh();
      this.hasDocument = true;

      if (page > 1) {
        this.documentList = this.documentList.concat(data.items);
      } else {
        this.documentList = data.items;
      }
    },

    calculateCounts(item, index) {
      if (!this.hasLogin) {
        this.$loc.open('login/login?url=courseware');
        return;
      }

      var downloadTask = uni.downloadFile({
        url: item.file.url,
        success: (res) => {
          if (res.statusCode === 200) {
            console.log(res.tempFilePath);
          }

          uni.openDocument({
            filePath: res.tempFilePath,
            fail: function(res) {
              if(res.errMsg) {
                uni.showToast({
                  title: '打开文档失败',
                  icon: 'none'
                });
              };
            }
          });
        }
      });

      downloadTask.onProgressUpdate((res) => {
        console.log('下载进度' + res.progress);
        console.log('已经下载的数据长度' + res.totalBytesWritten);
        console.log('预期需要下载的数据总长度' + res.totalBytesExpectedToWrite);
      })

      services('document').update(item.id).then((res) => {
        if (res.data.error_code) {
          return;
        }
        this.documentList[index].downloads = res.data.downloads;
      }).catch((error) => {
        console.log(JSON.stringify(error.data));
      })
    },

  }
}
</script>

<style scoped>
  .document-download-container {
    display: flex;
    padding: 30rpx 24rpx;
    width: 100%;
    border-bottom:1rpx solid #f5f5f5;
  }

  .title-box {
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  .title {
    margin-right: 16rpx;
    max-width: 628rpx;
    font-size: 30rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #333;
    lines: 1;
  }

  .download-box {
    display: flex;
    margin-top: 17rpx;
    flex-direction: row;
    align-items: flex-start;
  }

  .download {
    display: inline-block;
    padding: 12rpx 20rpx 0 0;
    font-size: 22rpx;
    color: #999;
  }

  /* 底部状态样式 */
  .indicator-text {
    display: inline-block;
    margin-top: 20rpx;
    padding-bottom: 20rpx;
    width: 100%;
    color: #888;
    font-size: 30rpx;
    text-align: center;
  }

  .no-order-records {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 267rpx;
  }

  .no-order-text {
    display: block;
    padding-top: 45rpx;
    font-size: 28rpx;
    color: #999;
  }

  .icon-wendangxiazai {
    padding-right: 29rpx;
    margin-top: 20rpx;
    font-size: 50rpx;
    color: rgb(59, 139, 253);
  }

  .title-content {
    width: 100%;
  }

  .icon-xiazaishu {
    padding-right: 8rpx;
    font-size: 20rpx;
    color: #999;
  }

  .file-size {
    padding: 12rpx 20rpx 0 0;
    font-size: 22rpx;
    color: #999;
  }
</style>
