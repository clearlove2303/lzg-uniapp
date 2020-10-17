<template>
  <view class="paper-page" :style="{height: screenHeight + 'px'}" @touchmove="handletouchmove" @touchstart="handletouchstart" @touchend="handletouchend">
    <view class="paper-box">
      <!--  #ifdef  APP-PLUS -->
      <view class="status-bar">
        <!-- 这里占位div -->
      </view>
      <!-- app头部组件 -->
      <fu-head class="paper-head" :title="paperTitle">
        <template slot="left-icon">
          <btn-icon
          icon="icon-back1"
          @click="goBack"></btn-icon>
        </template>
        <template slot="right-icon">
          <btn-icon
          icon="icon-sangedian"
          @click="togglePopup"></btn-icon>
        </template>
      </fu-head>
      <!--  #endif -->
      <!--  #ifdef  APP-PLUS -->
      <uni-popup class="popup" ref="popup" :custom="true" type="bottom">
      <!--  #endif -->
        <view class="paper-icon-wrapper">
          <view class="paper-icon-content" @click="collectClick">
            <view class="paper-icon-item">
              <text class="iconfont icon-shoucang" :style="{color: test.is_favorite ? 'red' : '#8e8e93'}"></text>
            </view>
            <text class="paper-txt">收藏</text>
          </view>
          <view class="paper-icon-content" v-if="paperMode != PAPER_MODE.SEARCH" @click="toggleAnswerView">
            <view class="paper-icon-item">
              <text
                class="iconfont"
                :class="togglePaperModal ? 'icon-eyeon' : 'icon-eyeclose'"></text>
            </view>
            <text
              class="paper-txt"
              v-text="togglePaperModal ? '显示答案' : '隐藏答案'"></text>
          </view>
          <view class="paper-icon-content" v-if="paperMode == PAPER_MODE.ANSWER || paperMode == PAPER_MODE.VIEW" @click="openResult">
            <view class="paper-icon-item">
              <text class="iconfont icon-weibiaoti--"></text>
            </view>
            <text class="paper-txt">答题结果</text>
          </view>
          <view class="paper-icon-content" @click="openCorrect">
            <view class="paper-icon-item">
              <text class="iconfont icon-jiucuo"></text>
            </view>
            <text class="paper-txt">纠错</text>
          </view>
        </view>
      <!--  #ifdef  APP-PLUS -->
      </uni-popup>
      <!--  #endif -->
      <view class="paper-content">
        <view class="test-dry">
          <view class="test-dry-txt">
            <text class="test-num">{{ testNum + '/' + testCount }}</text>
            <rich-text :nodes="convertTestText(testDry)"></rich-text>
          </view>
        </view>
        <view class="test-content">
          <single-test
            v-if="baseType === testType.SINGLE"
            :options="test.options"
            :test="test"
            :testId="test.id"
            :showAnswer="showAnswer"
            @change="doTest"></single-test>

          <multiple-test
            v-if="baseType === testType.MULTIPLE"
            :test="test"
            :testId="test.id"
            @change="doTest"
            :isMultipleType="true"
            :showAnswer="showAnswer"
            :testNum="testNum"></multiple-test>

          <comprehensive-test
            v-if="baseType === testType.COMPRE"
            :test="test"
            :testId="test.id"
            :showAnswer="showAnswer"
            @change="doTest"></comprehensive-test>

          <check-test
            v-if="baseType === testType.CHECK"
            :test="test"
            :testId="test.id"
            :showAnswer="showAnswer"
            @change="doTest"></check-test>
          <!-- finish #2414 -->
          <short-answer-test
            v-if="baseType === testType.QA"
            :test="test"
            :testId="test.id"
            :showAnswer="showAnswer"
            @change="doTest" ></short-answer-test>

          <choice-test
            class="choiceTest"
            v-if="baseType === testType.CHOICE"
            :test="test"
            :showAnswer="showAnswer"
            @change="doTest"></choice-test>
        </view>
        <view class="test-explain" ref="answer" v-if="showAnswer">
          <view class="test-answer" v-if="paperMode !== PAPER_MODE.VIEW"><!-- issue #2351 -->
            <view class="test-explain-answer">
              <text class="test-explain-txt">您的答案：</text>
              <text class="test-explain-txt my-answer">{{ myAnswer }}</text>
            </view>
            <view class="test-explain-answer">
              <text class="test-explain-txt">正确答案：</text>
              <rich-text class="test-explain-txt explain-answer" :nodes="convertTestText(correctAnswer)"></rich-text>
            </view>
          </view>
          <view class="explain">
            <text class="explain-title">答案解析：</text>
            <rich-text
              v-for="(item, index) in explain"
              :key="index"
              :nodes="convertTestText(item)"
              class="explain-content"></rich-text>
          </view>
        </view>
      </view>
      <!--  #ifdef  APP-PLUS -->
      <view class="paper-change">
        <view class="paper-btn prev" @click="prev">上一题</view>
        <view class="paper-btn answer" @click="checkAnswer" 
        :style="{ background: myAnswer ? '#e5e5e5' : '#f5f5f5' }" 
        v-if="paperMode === PAPER_MODE.SEARCH || paperMode === PAPER_MODE.FAV || paperMode === PAPER_MODE.WRONG">查看答案</view>
        <view class="paper-btn answer" @click="submit" :style="{ background: submitDisable ? '#f5f5f5' : '#e5e5e5' }" v-else>交卷</view>
        <view class="paper-btn next" @click="next">下一题</view>
      </view>
      <!-- #endif -->
      <!-- fix issue #2001 -->
      <!-- #ifdef MP-WEIXIN -->
      <cover-view class="paper-change">
        <button class="paper-btn prev" @click="prev">上一题</button>
        <button class="paper-btn answer" @click="checkAnswer" 
        :style="{ background: myAnswer ? '#e5e5e5' : '#f5f5f5' }"
        v-if="paperMode === PAPER_MODE.SEARCH || paperMode === PAPER_MODE.FAV || paperMode === PAPER_MODE.WRONG">查看答案</button>
        <button class="paper-btn answer" @click="submit" :style="{ background: submitDisable ? '#f5f5f5' : '#e5e5e5' }" v-else>交卷</button>
        <button class="paper-btn next" @click="next">下一题</button>
      </cover-view>
      <!-- #endif -->
      <!-- fix issue #2463 -->
      <modal
        :show="isShowModal"
        :confirmText="confirmText"
        cancelText='否'
        :noCancel="noCancel"
        :title="modalTitle"
        @confirm='confirm'
        @cancel='cancel'></modal>
    </view>
  </view>
</template>
<script>
// #ifdef  APP-PLUS
import fuHead from "@/components/nav/fu-head.vue";
import uniPopup from "@/components/vendor/uni-popup/uni-popup.vue";
import btnIcon from "@/components/nav/btn-icon.vue";
// #endif
import services from '@/common/service-loader';
import singleTest from '@/components/data/test/single-test'
import multipleTest from '@/components/data/test/multiple-test'
import comprehensiveTest from '@/components/data/test/comprehensive-test'
import checkTest from '@/components/data/test/check-test'
import choiceTest from '@/components/data/test/choice-test'
import shortAnswerTest from '@/components/data/test/short-answer-test'
import modal from '@/components/custom/modal.vue'

const TEST_TYPE = getApp().globalData.TEST_TYPE;
const PER_PAGE = 20;
const apis = {}

let examId = null; // 当前题库id
let paperId = null; // 当前试卷id
let preRecord = false;
let autoSkip = false;
let isMove = false,
    lastX = 0,
    lastY = 0;
let answers = [],
    paperRecordId = '',
    source = null;
export default {
  components: {
    singleTest,
    multipleTest,
    comprehensiveTest,
    checkTest,
    shortAnswerTest,
    choiceTest,
    // #ifdef  APP-PLUS
    fuHead,
    uniPopup,
    btnIcon,
    // #endif
    modal,
  },

  data() {
    return {
      baseType: '',
      testType: TEST_TYPE,
      test: {},
      testId: '',
      paperTitle: '',
      testNum: 1,
      testCount: 1,
      testDry: '',
      paperMode: 1,
      showAnswer: false,
      myAnswer: '',
      correctAnswer: '',
      explain: [],
      searchTitle: '',
      paperTemp: [],
      tempCollectTest: {},
      favoriteId: null,
      autoRemove: 0,
      PAPER_MODE: getApp().globalData.PAPER_MODE,
      isShowModal: false,
      togglePaperModal: true,
      screenHeight: '',
      noCancel: false,
      modalTitle: '',
      confirmText:　'',
      submitDisable: true,
      finishCount: 0,
      paperRecord: {},
      testNew: true,
      isSubmit: false
    }
  },

  watch: {
    testNum() {
      this.getPaperMore();
    },
    togglePaperModal(newValue) {
      this.submitDisable = !newValue;
    }
  },

  onLoad(option) {
    uni.getSystemInfo({
      success: (res) => {
        this.screenHeight = res.windowHeight;
      }
    });
    const user = this.$jwt.user();
    if (user === null) {
      return;
    }
    this.searchTitle = option.search_title;
    examId = option.exam_id;
    paperId = option.id;
    source = option.source;
    if (option.mode) {
      const mode = option.mode;
      this.paperMode = this.PAPER_MODE[mode];
    }

    if (option.test_order) {
      this.testNum = parseInt(option.test_order);
    }

    if (this.paperMode == this.PAPER_MODE.WRONG) {
      this.paperTitle = '错题集';
    }

    if (this.paperMode == this.PAPER_MODE.FAV) {
      this.paperTitle = '我的收藏';
    }

    if (this.paperMode == this.PAPER_MODE.SEARCH) {
      this.paperTitle = '搜索结果';
    }

    if (this.paperMode == this.PAPER_MODE.ANSWER ||
      this.paperMode ==  this.PAPER_MODE.VIEW) {
      this.paperTitle = option.paper_title;
    }

    this.setTitle(this.paperTitle);

    // 答题和看题模式接口请求数据
    apis[this.PAPER_MODE.VIEW] = apis[this.PAPER_MODE.ANSWER] = {
      name: 'queryByPaper',
      params: {
        id: paperId,
      },
    };

    apis[this.PAPER_MODE.SEARCH] = {
      name: 'querySearchList',
      params: {
        id: examId,
      },
      data: {
        title: this.searchTitle,
      }
    };

    apis[this.PAPER_MODE.FAV] = {
      name: 'queryFavoriteTests',
      params: {
        user_id: user.id,
        exam_id: examId,
      },
    };

    apis[this.PAPER_MODE.WRONG] = {
      name: 'queryWrongTests',
      params: {
        user_id: user.id,
        exam_id: examId,
      },
    };
    this.init();
    autoSkip = uni.getStorageSync('autoSkip');
  },

  onUnload() {
    if (this.paperMode == this.PAPER_MODE.FAV || this.paperMode == this.PAPER_MODE.WRONG || this.paperMode == this.PAPER_MODE.SEARCH) {
      return;
    }
    this.updateAnswer();
  },

  methods: {
    handletouchmove(event) {
			if (isMove) {
				return;
      }
      
      const { clientX, clientY } = event.changedTouches[0];
      let tx = clientX - lastX;
      if (tx === 0) {
        return;
      }
      let ty = clientY - lastY;
     
      // 左右方向滑动
      if (Math.abs(tx) > 100 && Math.abs(tx) > Math.abs(ty) / 0.6) {
        if (tx < 0) {
          this.next();
        } else {
          this.prev();
        }
        isMove = true;
      }
    },

		handletouchstart(event) {
      lastX = event.touches[0].clientX;
      lastY = event.touches[0].clientY;
    },

		handletouchend(event) {
			isMove = false;
		},

    init() {
      // #ifdef APP-PLUS
      try {
        this.autoRemove = uni.getStorageSync('autoRemove') ? 1 : 0;
      } catch (e) {
        console.log(e);
      }
      // #endif
      paperRecordId = '';
      if (this.paperMode == this.PAPER_MODE.FAV || this.paperMode == this.PAPER_MODE.WRONG || this.paperMode == this.PAPER_MODE.SEARCH || source === 'result') {
        this.getPaperMore();
        return;
      }
      this.getPaperRecords();
    },

    getPaperRecords() {
      let condition = {
        paper_id: paperId
      };
      if (source !== 'history') {
        condition.is_submited = 0;
      }
      services('paper-record').get(condition).then(res => {
        if (res.data.total_count > 0) {
          this.paperRecord = res.data.items[0];
          paperRecordId = this.paperRecord.id;
          this.finishCount = this.paperRecord.finish_count;
          if (this.paperRecord.is_submited === 0 && this.finishCount > 0) {
            this.submitDisable = false;
          }
          if (this.paperRecord.is_submited === 1) {
            this.isSubmit = true;
          }
          this.testNum = this.paperRecord.test_order;
          this.getPaperMore();
          return;
        }
        this.getPaperMore();
      });
    },

    async getPaperMore() {
      let page = Math.ceil(this.testNum / PER_PAGE);

      if (!this.paperTemp[page]) {
        try {
          const res = await this.getTests(page);
          if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
            return;
          }
          if (res.data.total_count === 0) {
            return;
          }
          this.testCount = res.data.total_count;
          this.paperTemp[page] = res.data.items;
        } catch (error) {
          // nothing to do
        }
      }
      const testObj = this.paperTemp[page][(this.testNum - 1) % PER_PAGE];
      this.testId = this.paperMode == this.PAPER_MODE.FAV || this.paperMode == this.PAPER_MODE.WRONG ?
        testObj.test_id :
        testObj.id;
      this.getTest(this.testId);
    },

    getTests(page) {
      const modeData = apis[this.paperMode];
      let data;

      if (modeData.name === 'queryByPaper') {
        return services('test').queryByPaper(modeData.params, page, PER_PAGE);
      } else if (modeData.name === 'querySearchList') {
        return services('exam').querySearchList(modeData.params, this.searchTitle);
      } else {
        return services('exam')[modeData.name](modeData.params, page, PER_PAGE);
      }
    },

    getTest(testId) {
      if (testId == '' || typeof(testId) != 'number') {
        return;
      }
      this.testNew = true;
      this.myAnswer = '';

      services('test').get(testId).then((res) => {
         if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }
        if (res.data.is_deleted == 1) {
          this.isShowModal = true;
          this.noCancel = false;
          this.modalTitle = '该试题已被删除';
          this.confirmText = '确定';
          return;
        }
        this.test = res.data;
        if (!this.test.title) {
          this.testDry = `（${this.test.type.title}）请根据以下选项回答问题`;
        } else {
          this.testDry = `（${this.test.type.title}）${this.test.title}`;
        }
        this.baseType = this.test.type.base_type;

        if(this.test.answer) {
          this.correctAnswer = this.test.answer;
        }

        if (this.baseType === TEST_TYPE.CHOICE || this.baseType === TEST_TYPE.COMPRE) {
          let tempAnswer = '';
          this.test.subtests.forEach((item, index) => {
            if (item.type.base_type === TEST_TYPE.CHECK) {
              if (item.answer == 'A') {
                item.answer = '正确';
              }
              if (item.answer == 'B') {
                item.answer = '错误';
              }
            }
            tempAnswer += `${index + 1}、${item.answer} `;
          });
          this.correctAnswer = tempAnswer;
        }

        if (this.baseType === TEST_TYPE.CHECK) {
          if (this.test.answer == 'A') {
            this.correctAnswer = '正确';
          } else {
            this.correctAnswer = '错误';
          }
        }

        if (this.paperRecord.is_submited === 1) {
          this.togglePaperModal = false;
          this.showAnswer = true;
        }

        this.showExplain(this.test);
      });    

      if (paperRecordId) {
        const condition = {
          test_id: testId,
          paper_record_id: paperRecordId
        };
        services('test-record').get(condition).then((res) => {
          if (res.data.total_count > 0) {
            const record = res.data.items[0];
            this.testNew = false;
            this.myAnswer = record.answer;
            if (this.paperRecord.is_submited === 0) {
              let tempData = {
                isRight: record.is_right,
                result: record.answer
              }
              this.saveAnswer(tempData);
            }
          }
        });
      }
    },

    // 切换答题和看题模式
    toggleAnswerView() {
      // finish #2187
      if (this.isSubmit) {
        return;
      };
      this.togglePaperModal = !this.togglePaperModal;
      this.showAnswer = !this.togglePaperModal;
      if (this.showAnswer) {
        this.showExplain(this.test);
      }
    },

    prev() {
      if (this.testNum <= 1) {
        this.showToast('已经是第一题');
        return;
      }

      if (this.togglePaperModal) {
        this.showAnswer = false;
        this.testNew = true;
        this.myAnswer = '';
      }

      this.testNum--;
      preRecord = true;
    },

    next() {
      if (this.testNum === this.testCount) {
        this.showToast('已经是最后一题');
        return;
      }

      if (this.togglePaperModal) {
        this.showAnswer = false;
        this.testNew = true;
        this.myAnswer = '';
      }

      this.testNum++;
      preRecord = false;
    },

    doTest(e) {
      if (this.paperMode === this.PAPER_MODE.VIEW) {
        return;
      }
      if (this.paperRecord.is_submited !== 1) {
        this.submitDisable = false;
      }
      this.myAnswer = e.result;
      this.saveAnswer(e);
      if (e.isRight == false) {
        this.showToast('回答错误！可以点击查看答案，查看答案和答案解析');
        return;
      }

      if (this.baseType === TEST_TYPE.QA ||
        (this.baseType === TEST_TYPE.COMPRE && e.isShortAnswer)) {
        this.showAnswer = true;
        return;
      }

      this.showToast('答对了！')
      // #ifdef APP-PLUS
      if (this.testNum < this.testCount && autoSkip) {
        this.next();
      }
      // #endif
      // issue #3666 小程序自动开启跳到下一题
      // #ifdef  MP-WEIXIN
      if (this.testNum < this.testCount) {
        this.next();
      }
      // #endif
    },

    // 我是更新答题记录
    saveAnswer(e) {
      // 批量答题接口
      const answerData = {
        test_id: this.testId,
        is_right: Number(e.isRight),
        answer: e.result,
        test_order: this.testNum,
        is_new: this.testNew
      }
      let key = answers.findIndex(item => item.test_id === answerData.test_id);
      if (-1 == key) {
        answers.push(answerData);
      } else {
        answers.splice(key, 1, answerData);
      }
  
      uni.setStorageSync('answers', answers);
    },

    updateAnswer() {
      // 更新答题记录
      if (answers.length === 0 ) {
        return;
      }
      const tempsubmitDisable = this.isSubmit ? 1 : 0;
      const condition = {
        answer: answers,
        auto_remove: this.autoRemove,
        exam_id: Number(examId),
        is_submited: tempsubmitDisable
      }
      services('test').batchAnswer(condition).then((res) => {
        uni.removeStorageSync('answers');
        const testRecord = {
          newRecordTotal: res.data.new_record_total,
          rightTotal: res.data.right_total
        }
        uni.$emit('doTest', {testRecord: testRecord, 
        lastPaper: {paper_title: this.paperTitle, test_order: answers[answers.length - 1].test_order, 
        paper_id: paperId, test_id: answers[answers.length - 1].testId}
        });
        answers = [];
      })
    },

    submit() {
      if (this.submitDisable) {
        return;
      }
      this.isShowModal = true;
      this.noCancel = true;
      this.confirmText = '是';
      const tempAnswers = answers.filter(item => item.is_new);
      let tempFinishCount = this.finishCount;
      if (tempAnswers) {
        tempFinishCount = this.finishCount + tempAnswers.length;
      }
      
      if (tempFinishCount < this.testCount) {
        this.modalTitle = `还有${this.testCount - tempFinishCount}题未答，是否确定交卷？`;
      } else {
        this.modalTitle = "是否确定交卷？";
      }
    },

    checkAnswer() {
      if (!this.togglePaperModal) {
        return;
      }
      if (!this.myAnswer) {
        this.showToast('答题过后才可以查看答案');
        return;
      }
      this.showAnswer = true;
      this.showExplain(this.test);
    },

    showExplain(test) {
      let explains = [];

      if (this.baseType === TEST_TYPE.CHOICE ||
        this.baseType === TEST_TYPE.COMPRE) {
        test.subtests.forEach((item, index) => {
          if (item.explain) {
            explains.push(`${index + 1}、${item.explain}`);
          } else {
            explains.push(`${index + 1}、暂无答案解析！`);
          }
        });

        const arr = explains.filter(function(item) {
          return item.indexOf('暂无答案解析') < 0;
        });

        if (arr.length <= 0) {
          explains = [test.explain ? test.explain : '暂无答案解析！'];
        }
      } else {
        explains = [test.explain ? test.explain : '暂无答案解析！'];
      }

      this.explain = explains;
    },

    // 收藏功能
    collectClick() {
      this.test.is_favorite = !this.test.is_favorite;
      if (this.test.is_favorite) {
        this.collectTest();
        return;
      }

      // 取消收藏时，若之前没被收藏过，则取消临时存储的题目
      if(!this.test.favorite_id) {
        this.favoriteId = this.tempCollectTest.id;
      } else {
        this.favoriteId = this.test.favorite_id;
      }

      this.cancelCollectTest();
    },

    collectTest() {
      services('test-fav').update(this.testId, examId).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }

        this.showToast('收藏成功')
        this.tempCollectTest = res.data;
      })
    },

    cancelCollectTest() {
      services('test-fav').delete([this.favoriteId]).then((res) => {
        if (res.data.error_code && res.data.error_code !== 'SUCCESS') {
          return;
        }

        this.showToast('取消成功');
      })
    },

    // 打开题目纠错页面
    openCorrect() {
      this.$loc.open(`tiku/correct?testId=${this.testId}`);
    },

    // 打开答题结果页面
    openResult() {
      this.$loc.open(`tiku/result?id=${paperId}&exam_id=${examId}&paper_title=${this.paperTitle}&paper_record_id=${paperRecordId}`);
    },

    // #ifdef  APP-PLUS
    goBack() {
      this.$loc.back();
    },

    togglePopup() {
      this.$refs.popup.open();
    },
    // #endif

    // fix issue #2463
    confirm() {
      this.isShowModal = false;
      if (this.confirmText === '确定') {
        if (preRecord) {
          this.prev();
          preRecord = false;
          return;
        }
        if (!preRecord) {
          if (this.testNum >= this.testCount) {
            this.prev();
          } else {
            this.next();
          }
        }
        return;
      }
      
      this.isSubmit = true;
      this.updateAnswer();     
      this.submitDisable = true;
      this.showAnswer = true;
      this.togglePaperModal = false;
      this.$loc.open(`tiku/result?id=${paperId}&exam_id=${examId}&paper_title=${this.paperTitle}&paper_record_id=${paperRecordId}`);
    },

    cancel() {
      this.isShowModal = false;
    },

    showToast(title) {
      uni.showToast({
        title: title,
        icon: 'none'
      });
    },
  },
}
</script>
<style scoped>
.paper-content {
  /*  #ifdef  APP-PLUS  */
  /* issue #2899 */
   margin-top: calc(var(--status-bar-height) + 92rpx);
  /*  #endif  */
  padding-bottom: 130rpx;
}

.test-dry {
  margin: 30rpx auto 20rpx;
  padding: 32rpx 27rpx;
  border: 1px solid #eee;
  width: 690rpx;
  height: auto;
  box-sizing: border-box;
}

.test-dry-txt {
  clear: both; /* fix issue #2123 */
  font-size: 34rpx;
  word-wrap: break-word;
}

.test-first {
  font-size: 34rpx;
}

.test-num {
  float: left; /* fix issue #2123 */
  margin-right: 10rpx;
  font-size: 32rpx;
  color: #ffb026;
}

.test-explain,
.test-content {
  margin-left: auto;
  margin-right: auto;
  width: 690rpx;
}

.test-answer {
  margin-top: 20rpx;
  padding: 0 30rpx 29rpx;
  box-sizing: border-box;
  border: 1rpx solid #eee;
}

.test-explain-answer {
  flex-direction: row;
  margin-top: 30rpx;
  word-wrap: break-word;
}

.test-explain-txt {
  color: #333333;
  font-size: 30rpx;
  line-height: 40rpx;
}

.my-answer {
  color: #f00;
  word-break: break-all;
}

.explain-answer {
  color: #007aff;
}

.explain {
  margin-top: 20rpx;
  margin-bottom: 37rpx;
  width: 690rpx;
  word-wrap: break-word;
}

.explain-title {
  margin-bottom: 15rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.explain-content {
  font-size: 30rpx;
  line-height: 40rpx;
}

.paper-change {
  position: fixed;
  bottom: 0;
  display: flex;
  flex-direction: row;
  width: 750rpx;
  z-index: 999;  /* fix issue #2001 */
}

.paper-btn {
  flex: 1;
  height: 98rpx;
  line-height: 98rpx;
  background-color: #e5e5e5;
  text-align: center;
  color: #555;
  font-size: 30rpx;
  border-radius: 0;
}

button::after {
  border: 0;
}

.answer {
  background: #f5f5f5;
  border-right: 1px solid #f5f5f5;
  border-left: 1px solid #f5f5f5;
}

.paper-icon-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding-top: 12rpx;
  padding-bottom: 10rpx;
  background: #f0f0f0;
}

.paper-icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
}

.icon-eyeon,
.icon-eyeclose,
.icon-weibiaoti--,
.icon-jiucuo,
.icon-shoucang {
  font-size: 44rpx;
  color: #8e8e93;
}

.paper-txt {
  display: block;
  height: 20rpx;
  line-height: 20rpx;
  font-size: 20rpx;
  color: #888;
  text-align: center;
}

/* choiceTest子组件中，中uni-popup组件样式 */
.choiceTest>>>.uni-popup {
  bottom: 98rpx;
}

.choiceTest>>>.bottom {
  bottom: 4rpx;
}

.choiceTest>>>.uni-popup__wrapper-box {
  padding-top: 0!important;
}

.choiceTest>>>.top .uni-popup__wrapper-box {
  margin-left: auto;
  margin-right: auto;
  width: 710rpx!important;
  border-radius: 20rpx;
}

.choiceTest>>>.bottom .uni-popup__wrapper-box {
  margin-left: auto;
  margin-right: auto;
  width: 710rpx!important;
  border-radius: 20rpx;
}

.test-content>>>.compre .single-radio {
  border: 0!important;
}

comprehensive-test /deep/ .fu-radio-list {
  border: none;
}

/*  #ifdef  APP-PLUS  */
/* issue #2899 */
.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: var(--status-bar-height);
  width: 100%;
  background: #fff;
  z-index: 9;
}

.paper-head {
  position: fixed;
  top: var(--status-bar-height);
  left: 0;
  background: #fff;
}

.popup {
  width: 750rpx;
}

.popup text {
  display: block;
}

.paper-icon-wrapper {
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  flex: 1;
  width: 750rpx;
  background: rgb(229, 229, 229);
  z-index: 9999;
}

/*  #endif  */
</style>
