<template>
  <view>
    <view v-if="hasDocument">
      <view v-for="(item, index) in documentList" :key="index">
        <view class="document-download" v-if="item.has_content === 0">
          <view v-if="item.file" class="document-download-container">
            <view class="title-box">
              <view class="title">{{ item.title }}</view>
              <view style="width:31px; height:42rpx">
                <!-- #ifdef  MP-WEIXIN -->
                <image :src="getSuffixIcon(item)" style="width: 100%; height: 100%"></image>
                <!-- #endif -->
                <!-- #ifdef  APP-PLUS -->
                <cache-image :imgUrl="getSuffixIcon(item)" style="width: 100%; height: 100%"></cache-image>
                <!-- #endif -->
              </view>
            </view>
            <view class="download-box" @click="calculateCounts(item, index)">
              <view class="download">{{ item.downloads }}人已下载</view>
              <view class="document-link">
                <view class="link-text">下载到本地</view>
              </view>
            </view>
          </view>
        </view>
        <view class="document-text" @click="watchDocument(item.id)" v-else>
          <view class="document-text-container">
            <view class="title-no-icon">{{ item.title }}</view>
            <view class="download-box">
              <view class="read">{{ item.downloads }}人已读</view>
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
      <text class="no-order-text">考前重点在考前七天左右发布，请耐心等待~</text>
    </view>
  </view>
</template>

<script>
// #ifdef  APP-PLUS
import cacheImage from "@/components/media/cache-image.vue";
// #endif
import services from '@/common/service-loader';

const STATICURL = getApp().globalData.CDN;
let totalPage = null,
    page = 1;

export default {
  // #ifdef  APP-PLUS
  components: {
    cacheImage
  },
  // #endif

  data() {
    return {
      hasDocument: false,
      noDocument: false, /* fix issue #1978*/
      documentList: [],
      noMore: false,
      noCourseImage: `${STATICURL}img-no-exam.png`,
    }
  },

  onLoad() {
    setTimeout(() => {
      this.showLoading();
      this.getDocuments();
    }, 300)
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

  methods: {
    getDocuments() {
      let currentMajor = uni.getStorageSync('study-major');
      if (currentMajor == '' || currentMajor.subjects.length <= 0) {
        this.hideLoading();
        this.noDocument = true; /* fix issue #1978*/
        return;
      }

      let subjects = currentMajor.subjects;

      const subjectIdArray = [];
      subjects.forEach(subject => {
        subjectIdArray.push(subject.id);
      })
      let subjectIds = subjectIdArray.join(','); /* fix issue #2045 */

      services('document').query({"subject_ids": subjectIds, 'type': 'HOT_SPOT'}, page, 50).then((res) => {
        this.hideLoading();
        this.getDocumentList(res);
      }).catch(() => {
        this.hideLoading();
        this.noDocument = true;
      })
    },

    getDocumentList(res) {
      if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
        return;
      }
      if (res.data.total_count <= 0) {
        this.noDocument = true; /* fix issue #1978*/
        return;
      }
      uni.stopPullDownRefresh();
      totalPage = res.data.page_count;

      this.hasDocument = true;

      if (page > 1) {
        this.documentList = this.documentList.concat(res.data.items);
      } else {
        this.documentList = res.data.items;
      }
    },

    calculateCounts(item, index) {
      uni.downloadFile({
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

      services('document').update(item.id).then((res) => {
        if (res.data.error_code) {
          return;
        }
        this.documentList[index].downloads = res.data.downloads;
      }).catch((error) => {
        console.log(JSON.stringify(error.data));
      })
    },

    watchDocument(id) {
      this.$loc.open(`document/view?id=${id}`);
    },

    // 获取文件后缀图片路径
    // @param  {String} suffix 后缀
    // @return {String}
    getSuffixIcon(suffix) {
      if (!suffix.file) {
        return;
      }

      if (suffix.file.file_ext == 'pdf') {
        return require(`../../static/img/pdf.png`);
      }

      if (suffix.file.file_ext == 'rar' || suffix.file.file_ext == 'zip') {
        return require(`../../static/img/rar.png`);
      }

      if (suffix.file.file_ext == 'doc' || suffix.file.file_ext == 'docx') {
        return require(`../../static/img/word.png`);
      }

      return require(`../../static/img/other.png`);
    }
  }
}
</script>

<style scoped>
  .document-download-container,
  .document-text-container {
    padding: 30rpx 24rpx;
    width: 100%;
    border-bottom: 2rpx solid rgb(230, 230, 230);
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

  .title-no-icon {
    width: 90%;
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

  .download,
  .read {
    display: inline-block;
    padding: 12rpx 20rpx 0 0;
    font-size: 22rpx;
    color: #999;
  }

  .document-link {
    display: inline-block;
    padding: 12rpx 20rpx;
    border: 1rpx solid #3b8bfd;
    border-radius: 35rpx;
  }

  .link-text {
    font-size: 20rpx;
    color: #3b8bfd;
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
</style>
