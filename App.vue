<script>
import CourseDownloader from "@/common/course-downloader";
import DownloadUtil from "@/common/download-util";

const DOMAIN =
  process.env.NODE_ENV === "development"
    ? "lxtest.laixuejigou.com"
    : "laixue.com";

const PROTOCAL = process.env.NODE_ENV === "development" ? "http" : "https";

export default {
  globalData: {
    CDN: "https://cdn.laixue.com/uniapp/",
    H5Url: `${PROTOCAL}://h5.${DOMAIN}/`,
    LIVE_URL: `${PROTOCAL}://live.${DOMAIN}/`,
    WWW_URL: `${PROTOCAL}://www.${DOMAIN}/`,
    API_URL: `${PROTOCAL}://api.${DOMAIN}/v4/`,
    APP_URL: "http://app.laixue.com/",
    TEST_TYPE: {
      SINGLE: 1,
      MULTIPLE: 2,
      CHECK: 3,
      CHOICE: 4,
      QA: 5,
      COMPRE: 6,
    },
    IS_VIDEO_END: 0,
    PAPER_MODE: { ANSWER: 1, VIEW: 2, WRONG: 3, FAV: 4, SEARCH: 5 },
    ORDER_STATUS: {
      CANCELED: 0,
      TOPAY: 1,
      AUDIT_FAILLURE: 2,
      TOAUDIT: 3,
      FINISHED: 4,
      RETAKE: 6,
      REJECT: 7,
      REFUNDED: 8,
      EXPIRED: 9,
      TESTED: 10,
      TORERUND: 11,
    },
    DOWNLOAD_STATUS: {
      TODOWNLOAD: -1, // 待下载
      DOWNLOADING: 0, // 下载中
      DOWNLOADED: 1, // 下载完成
      TOPAUSE: 2, // 暂停中
      PAUSED: 3, // 已暂停
      TOABORT: 4, // 删除中
      ABORTED: 5, // 已删除
    },
  },

  onLaunch() {
    // #ifdef  APP-PLUS
    // 初始化好下载队列
    DownloadUtil.initQueue();
    //  #endif
  },

  onShow() {
    // #ifdef  APP-PLUS
    CourseDownloader.start();
    // #endif
  },
};
</script>

<style>
/* #ifndef APP-PLUS-NVUE */
@import "./static/iconfont.css";
checkbox .wx-checkbox-input {
  border-radius: 50% !important;
  color: #ffffff !important;
}

checkbox .wx-checkbox-input.wx-checkbox-input-checked {
  color: #fff;
  background: #0896ff;
}

.wx-checkbox-input.wx-checkbox-input-checked {
  border: none !important;
}

checkbox .uni-checkbox-input {
  border-radius: 50% !important;
  color: #ffffff !important;
  border: 1px solid #ddd !important;
}

checkbox .uni-checkbox-input.uni-checkbox-input-checked {
  color: #fff;
  background: #3b8bfd;
}

.uni-checkbox-input.uni-checkbox-input-checked {
  border: none !important;
}
/* #endif */
</style>
