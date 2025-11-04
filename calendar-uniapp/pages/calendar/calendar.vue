<template>
  <view class="calendar-container">
    <!-- 视图切换 -->
    <view class="view-selector">
      <picker mode="selector" :range="viewOptions" @change="onViewChange">
        <view class="picker-label">{{ currentViewLabel }} ▼</view>
      </picker>
    </view>

    <!-- 月视图 -->
    <view v-if="viewMode === 'month'">
      <MonthView :events="events" @refresh="loadEvents" />
    </view>

    <!-- 周视图 -->
    <view v-else-if="viewMode === 'week'">
      <WeekView :events="events" @refresh="loadEvents" />
    </view>

    <!-- 日视图 -->
    <view v-else>
      <DayView :events="events" @refresh="loadEvents" />
    </view>
  </view>
</template>

<script>
import { getEvents } from '../../api/event.js';
import MonthView from '../../components/MonthView.vue';
import WeekView from '../../components/WeekView.vue';
import DayView from '../../components/DayView.vue';

export default {
  components: {
    MonthView,
    WeekView,
    DayView
  },
  data() {
    return {
      viewMode: 'month',
      events: [],
      viewOptions: ['月视图', '周视图', '日视图']
    };
  },
  computed: {
    currentViewLabel() {
      const labels = { month: '月视图', week: '周视图', day: '日视图' };
      return labels[this.viewMode];
    }
  },
  onLoad() {
    this.loadEvents();
  },
  methods: {
    onViewChange(e) {
      const views = ['month', 'week', 'day'];
      this.viewMode = views[e.detail.value];
    },
    async loadEvents() {
      try {
        const response = await getEvents();
        // 提取data字段作为events数组
        this.events = response.data || [];
      } catch (err) {
        console.error("加载日程失败：", err);
        uni.showToast({
          title: '加载日程失败',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.calendar-container {
  padding: 10px;
}

.view-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.picker-label {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border-radius: 20px;
}
</style>