<template>
  <view class="result">
    <scroller-view :style="{height: containerHeight + 'rpx'}">
      <view class="result-top">
        <view class="circleprogress">
          <view class="progress-txt">
            <view class="progress-info">
              {{ rightPercent }}
              <text>%</text>
            </view>
            <text>正确率</text>
          </view>
          <view class="wrapper wrapper-l">
            <view class="leftprogress" :style="{ transform: leftprogress}"></view>
          </view>
          <view class="wrapper wrapper-r">
            <view class="rightprogress" :style="{ transform: rightprogress}"></view>
          </view>
        </view>
        <view class="top-right">
          <text class="record">共{{ tests.length }}题</text>
          <view class="right-item">
            <text class="circle icon-green"></text>
            <text class="item-text">正确</text>
            <text class="icon-text text-green">{{ rightTests.length }}</text>
          </view>
          <view class="right-item">
            <text class="circle icon-red"></text>
            <text class="item-text">错误</text>
            <text class="icon-text text-red">{{ wrongTests.length }}</text>
          </view>
          <view class="right-item">
            <text class="circle icon-none"></text>
            <text class="item-text">未做</text>
            <text class="icon-text">{{ undoneTests.length }}</text>
          </view>
        </view>
      </view>
      <view class="result-content">
        <view v-for="(items, title) in result" :key="title" >
          <p class="title">{{ title }}</p>
          <view class="content-box">
            <text
              :class="item.status === 'IS_NONE' ? 'content-text' : (item.status === 'IS_RIGHT' ? 'content-text content-right' : 'content-text content-wrong')"
              @click="openTest(item)"
              v-for="(item, index) in items"
              :key="index">{{ item.number }}</text>
          </view>
        </view>
      </view>
    </scroller-view>
  </view>
</template>
<script>
import services from '@/common/service-loader';
let prevpage= null;
let answers= [];
let paperId= '';
let examId= '';
let paperTitle= '';
let paperRecordId = ''; 
export default {
  data() {
    return {
      tests: [],
      result: {},
      undoneTests: [],
      wrongTests: [],
      rightTests: [],
      rightPercent: 0,
      containerHeight: 0,
      leftprogress: 'rotate(-45deg)',
      rightprogress: 'rotate(45deg)',
      angle0: true,
      angleThan180: false,
    }
  },

  onLoad(option) {
    let pages = getCurrentPages();
    prevpage = pages[pages.length - 2];
    paperId = option.id;
    examId = option.exam_id;
    paperTitle = option.paper_title;
    paperRecordId = option.paper_record_id;
    const res = uni.getSystemInfoSync();
    this.containerHeight = res.screenHeight;
    answers = uni.getStorageSync('answers');
    this.getRecord();
  },

  methods:{
    getRecord() {
      let user = this.$jwt.user();
      this.userId = user.id;
      services('paper').getRecord(this.userId, paperId, paperRecordId).then((res) => {
        if (res.data.error_code) {
          return;
        }
        this.tests = res.data.items;

        if (answers != '') {
          answers.forEach(item => {
            for (let i = this.tests.length - 1; i >= 0; i--) {
              if (item.test_id === this.tests[i].id) {
                if(this.tests[i].status === "IS_NONE") {
                  if (item.is_right === 1) {
                    this.tests[i].status = "IS_RIGHT";
                    return;
                  }
                  this.tests[i].status = "IS_WRONG";
                  this.tests.splice(i, 1, this.tests[i]);
                }
              }
            }   
          })
        }

        this.wrongTests = this.tests.filter(function(test){
          return test.status === "IS_WRONG"
        })

        this.undoneTests = this.tests.filter(function(test){
          return test.status === "IS_NONE"
        })

        this.rightTests = this.tests.filter(function(test){
          return test.status === "IS_RIGHT"
        })

        if(this.rightTests.length === 0) {
          this.rightPercent = 0;
        } else {
          this.rightPercent = Math.round(this.rightTests.length / (this.rightTests.length + this.wrongTests.length) * 100);
        }
        this.progressBar();
        this.reconfiguration(this.tests);
      })
    },

    reconfiguration(items) {
      for (let [index, item] of items.entries()) {
        item.number = index + 1;
        this.result[item.type] = this.result[item.type] || [];
        
        this.result[item.type].push(item)
      }
    },

     // 进度条
    progressBar() {
      let val = this.rightPercent;
      let deg = val/100*360;
      if(deg <= 180) {
        this.rightprogress = 'rotate('+(45+deg)+'deg)'
        this.leftprogress = 'rotate('+(-45)+'deg)'
      } else	{
        this.rightprogress = 'rotate('+(45+180)+'deg)'
        this.leftprogress = 'rotate('+(-45+(deg-180))+'deg)'
      }
      
      if (deg === 0 || deg <180) {
        this.angle0 = true;
        this.angleThan180 = false;
      } else if (deg >= 180) {
        this.angleThan180 = true;
        this.angle0 = false;
      }
    },

    openTest(test) {
      if(prevpage.route === 'pages/tiku/paper') {
        prevpage.$vm.testNum = test.number;
        uni.navigateBack({
          delta: 1
        });
        return;
      };
      this.$loc.open(`tiku/paper?exam_id=${examId}&id=${paperId}&paper_title=${paperTitle}&test_order=${test.number}&source=result`);
    },

  }
}
</script>
<style scoped>
.result-top {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin: 0 auto;
  width: 100%;
}
/* 进度条 */
/* 进度条 */
.circleprogress{
  position: relative;
  display: flex;
  justify-content: center;
  height: 160px;
  padding-top: 30px;
  text-align: center;
}

.circleprogress .wrapper {
  width: 80px;
  height: 160px;
  overflow: hidden;
}

.circleprogress .leftprogress,.rightprogress {
  width: 120px;
  height: 120px;
  border: 20px solid #eee;
  border-bottom: 20px solid #3b8bfd;
  border-radius: 50%;
}

.circleprogress .leftprogress {
  border-right-color: #3b8bfd;
}

.circleprogress .rightprogress{
  margin-left: -80px;
  border-left-color: #3b8bfd;
}

.progress-txt {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  margin: -25px 0 0 -50px;
  font-size: 15px;
  color: #000;
}
.progress-info {
  font-size: 45px;
  font-family: PingFang SC;
  font-weight: 800;
  color:#000;
}
.progress-info text {
  font-size: 15px;
  font-weight: 400;
}

.icon-datijilu {
  font-size: 34rpx;
  margin-top: 6rpx;
}

.right-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30rpx;
  line-height: 44rpx;
  color: #333;
}

.top-right {
  margin-top: 48rpx;
}

.right-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30rpx;
  line-height: 44rpx;
}

.circle {
  margin-right: 10rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
}

.icon-text {
  margin-left: 20rpx;
  line-height: 44rpx;
  font-size: 23rpx;
  text-align: center;
  color: #666666;
}

.icon-green {
  background: #00d5a1;
}

.text-green {
  color: #00d5a1;
}

.icon-red {
  background: #f95055;
}

.text-red {
  color: #f95055;
}

.icon-none {
  background: #fff;
  border: 1px solid #e9e9e9;
}

.record {
  font-size: 32rpx;
}

.item-text {
  color: #333;
  font-size: 28rpx;
}

.result-content {
  margin-top: 20rpx;
  padding: 0 30rpx 40rpx 30rpx;
  overflow: hidden;
}

.title {
  margin: 30rpx 0 10rpx 0;
  font-size: 30rpx;
  line-height: 30rpx;
  font-weight: 400;
  color: #333;
}

.content-box {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  flex-direction: row;
}

.content-text {
  width: 88rpx;
  height: 88rpx;
  line-height: 88rpx;
  margin-right: 12rpx;
  margin-top: 20rpx;
  border-radius: 50%;
  background: #fff;
  font-size: 29rpx;
  color: #666;
  text-align: center;
  border: 1px solid #e9e9e9;
  box-sizing: border-box;
}

.content-text:nth-child(7n) {
  margin-right: 0;
}

.content-right {
  color: #fff;
  background: #00d5a1;
  border: none;
}
.content-wrong {
  color: #fff;
  background: #f95055;
  border: none;
}
</style>
