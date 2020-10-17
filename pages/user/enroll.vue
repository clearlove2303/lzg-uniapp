<template>
  <view>
    <scroll-view class="scroller-box" :style="{minHeight: scrollHeight + 'px'}">
      <text class="title">报考时间</text>
      <view class="flex-center">
        <view @click="openTestTime">
          <btn-selector
            :yearTitle="timeName"
          ></btn-selector>
        </view>
        <view v-if="showTestTime" class="test-time">
          <view v-for="(item, index) in testTime" :key="index">
            <text class="time-text" @click="selectTestTime(item)">{{ item }}</text>
          </view>
        </view>
      </view>
      <text class="title">报考类别</text>
      <view class="flex-center" @click="changeCategoryClick">
        <btn-selector
          :title="topCategoryName"
        ></btn-selector>
      </view>
      <text class="title">报考专业</text>
      <view class="flex-center">
        <view @click="changeSubCategoryClick">
          <btn-selector
            :title="categoryName"
          ></btn-selector>
        </view>
        <view @click="changeMajorSubjectClick">
          <btn-selector
            v-if="majorShow"
            :title="topMajorSubjectName"
          ></btn-selector>
        </view>
      </view>
      <text class="title" v-if="subjectShow">报考科目</text>
      <view class="flex-center">
        <view v-if="subjectShow">
          <view
            class="checkbox-item"
            v-for="(item, index) in majorSubjects"
            :key="index"
            :style="{
              background: item.checked ? '#e2eefc' : '#ffffff',
              border: item.checked ? '1px solid #3b8bfd' : '0',
            }"
            @click="checkBoxClick(item)">
            <view class="flex-row">
              <text class="iconfont icon-iconfontcheck checked-icon" v-if="item.checked"></text>
              <text class="checked-icon" v-else></text>
              <text :style="{color: item.checked ? '#3d8ddb' : '#222222'}">{{ item.title | omitString(12) }}￥{{ item.rightTitle ? item.rightTitle :  0 }}</text>
            </view>
          </view>
        </view>
        <button
          class="btn-submit"
          @click="createOrUpdateContact">提交</button>
      </view>
    </scroll-view>
    <uni-popup class="popup" ref="popup" type="bottom">
      <text
        class="option-cell"
        v-for="(item, index) in optionData"
        :key="index"
        @click="overlayBottomClick(item)">{{ item.name }}</text>
    </uni-popup>
    <modal
      :show="dialogShow"
      title="提示信息"
      confirmText="确定"
      :text="dialogContent"
      :textShow="true"
      @confirm='wxcDialogConfirmBtnClicked'></modal>
    <modal
      :show="submitShow"
      title="提示信息"
      :noCancel="true"
      confirmText="确认"
      cancelText="取消"
      @cancel="cancel"
      :text="dialogContent"
      :textShow="true"
      @confirm="confirm" />
  </view>
</template>

<script>
import service from '@/common/service-loader'
import btnSelector from '@/components/vendor/button-selector/btn-selector.vue';
import uniPopup from "@/components/vendor/uni-popup/uni-popup.vue";
import modal from '@/components/custom/modal.vue';

let userId = '',
    role = '',
    currentMajor = {},
    contractOrders = [];

export default {
  components: {
    btnSelector,
    uniPopup,
    modal,
  },
  data() {
    return {
      categoryData: [],
      optionData: [],
      majorSubjects: [],
      topCategoryName: '请选择...',
      categoryName: '请选择...',
      topMajorSubjectName: '请选择...',
      timeName: 0,
      currentContractId: 0,
      topCategoryID: 0,
      categoryID: 0,
      topMajorSubjectID: 0,
      subjectIds: [],
      majorShow: false,
      subjectShow: false,
      dialogShow: false,
      dialogContent: '',
      showTestTime: false,
      scrollHeight: '',
      testTime: [],
      submitShow: false,
    }
  },

  onLoad(option) {
    currentMajor = option;
    let user = this.$jwt.user();
    userId = user.id;
    this.init();
  },

  methods: {
    openTestTime() {
      this.showTestTime = !this.showTestTime;
    },

    selectTestTime(item) {
      this.timeName = item;
      this.showTestTime = false;
    },

    init() {
      this.timeName = new Date().getFullYear();
      this.testTime = [this.timeName, this.timeName + 1];
      this.timeName = this.timeName;
      const res = uni.getSystemInfoSync();
      this.scrollHeight = res.windowHeight;
      this.getCategoryData();
      this.getContract();
      this.getUserInfo();
    },

    getOngoingContract() {
      service('contract').getOngoing(userId).then((res) => {
        if (res.data.error_code && currentMajor.categoryID) {
          // issue #3554
          this.categoryData.forEach((category) => {
            category.children.filter((item) => {
              if (item.id == currentMajor.categoryID) {
                this.categoryID = currentMajor.categoryID;
                this.categoryName = item.name;
                this.topCategoryName = category.name;
                this.topCategoryID = category.id;
                this.overlayBottomClick(item)
              }
            })
          })
          return;
        }
        this.currentContractId = res.data.id;
        this.categoryID = res.data.category_id;
        this.getContractDetail(res.data.id);
      })
    },

    getContractDetail(contractId) {
      service('contract').get(contractId).then((res) => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }
        const subjects = res.data.subjects;
        this.topMajorSubjectID = subjects[0].refid;
        this.timeName = res.data.year;
        subjects.forEach(item => this.subjectIds.push(item.id));
        this.fillCategoriesById();
        this.getTopMajorSubjects();
      })
    },

    fillCategoriesById() {
      for (let index = 0; index < this.categoryData.length; index++) {
        let item = this.categoryData[index];
        const majorArray = item.children.filter(data => data.id === this.categoryID);
        if (majorArray.length) {
          this.topCategoryID = item.id;
          this.topCategoryName = item.name;
          this.categoryName = majorArray[0].name;
          break;
        }
      }
    },

    getContract() {
      service('contract').queryByUser(userId).then((res) => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }
        contractOrders = res.data.items;
      })
    },

    getUserInfo() {
      service('user').get(userId).then((res) => {
        role = res.data.role;
      })
    },

    // 获取两层考试分类
    getCategoryData() {
      service('category').query({"expand": "children", "refid": 0 }).then((res) => {
        if (res.data.total_count === 0) {
          this.dialogShow = true;
          this.dialogContent = '获取数据失败！';
          return false;
        }
        this.categoryData = res.data.items;
        // issue #3389 解决异步加载问题
        this.getOngoingContract();
      });
    },

    // 获取报考专业的顶层科目
    getTopMajorSubjects() {
      service('category-subjects').query({"category_id": this.categoryID}).then((res) => {
        this.getTopMajorSubjectHandle(res.data);
      })
    },

    getTopMajorSubjectHandle(res) {
      if (res.total_count < 1) {
        return false;
      }

      this.optionData = res.items;

      if (res.total_count > 1) {
        this.majorShow = true;
      } else {
        this.topMajorSubjectID = res.items[0].id;
      }

      if (this.topMajorSubjectID > 0) {
        let majors = res.items.filter(item => item.id === this.topMajorSubjectID);
        this.topMajorSubjectName = majors[0].name;
        this.getMajorSubjects(this.topMajorSubjectID);
      }
    },

    getMajorSubjects(refid) {
      service('category-subjects').query({"refid": refid}).then((res) => {
        this.getMajorSubjectHandle(res.data);
      })
    },

    getMajorSubjectHandle(data) {
      this.subjectShow = true;
      data.items.forEach(val => {
        this.majorSubjects.push({
          title: val.name,
          rightTitle: val.price,
          value: val.id,
          checked: this.subjectIds.includes(val.id) ? true : false,
        })
      });
    },

    checkBoxClick(e) {
      if (this.subjectIds.length) {
        let index = this.subjectIds.indexOf(e.value);
        if (index === -1) {
          this.subjectIds.push(e.value);
          e.checked = true;
        } else {
          this.subjectIds.splice(index, 1);
          e.checked = false;
        }
      } else {
        this.subjectIds.push(e.value);
        e.checked = true;
      }
      this.subjectIds.sort();
    },

    createOrUpdateContact() {
      if (this.subjectIds.length <= 0 || !this.categoryID) {
        this.dialogShow = true;
        this.dialogContent = '报考专业和报考科目必选';
        return false;
      }
      this.submitShow = true;
      this.dialogContent = '科目一旦确定将无法更改,是否确认当前选择';
    },

    confirm() {
      this.submitShow = false;
      if (!this.currentContractId) {
        this.createCotract();
        return;
      }
      // #3537 已生效协议不进行更新
      service('contract').get(this.currentContractId).then((res) => {
        if (res.data.error_code || res.data.status > 3) {
          return;
        }
        this.updateCotract();
      })
    },

    cancel() {
      this.submitShow = false;
    },

    createCotract() {
      let data = {
        category_id: this.categoryID,
        subject_ids: this.subjectIds.join(','),
        major_id: this.topMajorSubjectID,
        year: this.timeName,
        source: contractOrders == null && role == 'R_VIP' ? 'APP' : ''
      }
      service('contract').enroll(userId, data).then((res) => {
        if (res.data.error_code && res.data.error_code != 'SUCCESS') {
          return;
        }
        if (contractOrders == null && role == 'R_VIP') {
          uni.setStorageSync('hasContract', true);
          this.$loc.back();
          return;
        }
        // issue# 3393
        this.currentContractId = res.data.id;
        this.$loc.open(`contract/pay?order_id=${res.data.id}`);
      })
    },
    
    updateCotract() {
      let data = {
        category_id: this.categoryID,
        major_id: this.topMajorSubjectID,
        subject_ids: this.subjectIds.join(','),
        year: this.timeName
      }
      service('contract').update(this.currentContractId, data).then((res) => {
        this.$loc.open(`contract/pay?order_id=${res.data.id}`);
      })
    },

    changeCategoryClick() {
      if (this.catchContractTip()) {
        this.$refs.popup.open();
        this.optionData = this.categoryData;
      }
    },

    changeSubCategoryClick() {
      if (this.topCategoryID === 0) {
        this.dialogShow = true;
        this.dialogContent = '请选择报考类别';
        return;
      }
      if (this.catchContractTip()) {
        this.$refs.popup.open();
        const currentCategory = this.categoryData.filter(data => data.id === this.topCategoryID);
        this.optionData = currentCategory[0].children;
      }
    },

    changeMajorSubjectClick() {
      this.$refs.popup.open();
    },

    wxcDialogConfirmBtnClicked() {
      this.dialogShow = false;
    },

    overlayBottomClick(item) {
      this.$refs.popup.close();
      // 切换顶层科目
      if (item.category_id) {
        if (item.id === this.topMajorSubjectID) {
          return;
        }
        this.topMajorSubjectID = item.id;
        this.topMajorSubjectName = item.name;
        this.initMajorSubject();
        this.getMajorSubjects(item.id);
        return;
      }
      // 切换分类
      if (item.refid === 0) {
        this.topCategoryName = item.name;
        this.topCategoryID = item.id;
        this.initSubCategory();
        this.initTopMajorSubject();
        this.initMajorSubject();
        return;
      }
      // 切换专业
      this.categoryName = item.name;
      this.categoryID = item.id;
      this.initTopMajorSubject();
      this.initMajorSubject();
      this.getTopMajorSubjects();
    },

    initSubCategory() {
      this.majorShow = false;
      this.subjectShow = false;
      this.categoryID = 0;
      this.categoryName = '请选择...';
    },

    initTopMajorSubject() {
      this.subjectShow = false;
      this.topMajorSubjectID = 0;
      this.topMajorSubjectName = '请选择...';
    },

    initMajorSubject() {
      this.majorSubjects = [];
      this.subjectIds = [];
    },

    catchContractTip() {
      if (this.currentContractId) {
        this.dialogShow = true;
        this.dialogContent = '协议已存在，请选择协议上的报考类别和报考专业，只支持修改专业子类和科目';
        return false;
      }
      return true;
    },
  },
}
</script>

<style scoped>
.scroller-box {
  padding-top: 28rpx;
  background-color: #f5f5f5;
}

.title {
  display: flex;
  margin-bottom: 27rpx;
  padding-left: 32rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #666666;
}

.flex-center {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.btn-submit {
  margin-top: 49rpx;
  margin-bottom: 50rpx;
  width: 583rpx;
  border-top: 0;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 34rpx;
  color: #fff;
  border-radius: 50rpx;
  background: #3b8Bfd;
}

.btn-submit:after {
  border: 0;
}

.scroller {
  height: 400rpx;
}

.test-time {
  margin-top: -33rpx;
  padding: 0 25rpx;
  width: 583rpx;
  background-color: #fff;
}

.time-text {
  display: flex;
  justify-content: center;
  line-height: 80rpx;
  color: #666;
  font-size: 30rpx;
}

.checkbox-item {
  display: flex;
  width: 583rpx;
  height: 80rpx;
  margin-bottom: 33rpx;
  padding-left: 25rpx;
  padding-right: 25rpx;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 34rpx;
  border-radius: 10rpx;
  background-color: #ffffff;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.checked-icon {
  width: 39px;
  color: #3d8ddb;
}

.option-cell {
  display: block;
  padding-left: 24rpx;
  height: 114rpx;
  line-height: 114rpx;
  font-size: 32rpx;
  color: #333;
  border-bottom: 1rpx solid #e5e5e5;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.popup >>> .uni-popup__wrapper {
  height: 400rpx;
  overflow-y: scroll;
  background: #fff;
}

.popup >>> .uni-popup__wrapper-box {
  padding-top: 0!important;
  border-radius: 0!important;
}
</style>
