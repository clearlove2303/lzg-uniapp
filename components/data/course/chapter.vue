<template>
  <view class="chapters">
    <scroll-view scroll-y="true" class="chapterScroll" :style="{height: windowHeight + 'px'}">
      <!-- issue2039 -->
      <uni-collapse class="uni-collapse" accordion=true>
        <chapter-item
          v-for="(chapter, index) in chapters" :key="index"
          :open="chapter.open"
          :title="chapter.title"
          :chapterTitle="`第` + (index + 1) + `章`"
          ref="chapterItem"
          class="chapter-item">
          <!-- issue #2922 -->
            <view
              class="chapter-sections"
              v-for="section in chapter.sections"
              :key="section.id"
              @click="changeVideo(section)">
              <text :class="sectionId == section.id ? 'iconfont icon-play icon-active' : 'iconfont icon-play'"></text>
              <text :class="sectionId == section.id ? 'section-active' : 'section-title'">{{ section.title }}</text>
            </view>
        </chapter-item>
      </uni-collapse>
    </scroll-view>
  </view>
</template>
<script>
import { mapState } from 'vuex';

import uniCollapse from '@/components/vendor/uni-collapse.vue';
import chapterItem from '@/components/data/course/chapter-item.vue';

export default {
  props: {
    chapters: {
      type: Object,
      default: () => {},
    },
    course: {
      type: Object,
      default: () => {},
    },
    sectionId: {
      type: Number,
      default: () => {},
    }
  },

  components: {
    uniCollapse,
    chapterItem
  },

  watch: {
    chapters() {
      const res = uni.getSystemInfoSync();
      this.windowHeight = res.windowHeight - 210;
    },
  },

  data() {
    return {
      windowHeight: '',
    }
  },

  computed: mapState(['hasLogin']),

  methods: {
    changeVideo(section) {
      if (!section) {
        return;
      }
      if (!this.hasLogin && section.id != this.sectionId) {
        this.goLogin();
        return;
      }
      this.section = section;
      this.$emit(
        'change',
        { section: this.section }
      );
    },
  }
}
</script>
<style scoped>
  .chapterScroll {
    border-top: 20rpx solid #eee;
  }

  .chapter-item {
    border-bottom: 24rpx solid #eee;
    background: #fff;
  }

  .chapter-sections {
    margin: 29rpx 0;
    padding-left: 25rpx;
    padding-right: 25rpx;
    font-size: 28rpx;
    color: #333;
  }

  .icon-play {
    margin-right: 12rpx;
    font-size: 28rpx;
    color: #333;
  }

  .icon-vip {
    float: right;
    font-size: 34rpx;
    color: #f00;
  }

  .section-title {
    font-size: 28rpx;
    color: #333;
  }

  .section-active {
    font-weight: bold;
    color: #222;
  }

  .icon-active {
    color: #3b8bfd;
  }

  .uni-collapse-cell--hover {
    background: #fff;
  }
</style>
