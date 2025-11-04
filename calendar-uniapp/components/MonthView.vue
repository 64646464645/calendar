<template>
  <view class="month-view">
    <!-- 顶部导航栏 -->
    <view class="calendar-header">
      <button class="nav-btn" @click="prevMonth">← 上月</button>
      <text class="header-title">{{ currentYear }}年 {{ currentMonth + 1 }}月</text>
      <button class="nav-btn" @click="nextMonth">下月 →</button>
    </view>

    <!-- 星期头 -->
    <view class="week-header">
      <view v-for="(day, index) in weekDays" :key="index" class="week-day">{{ day }}</view>
    </view>

    <!-- 日期网格 -->
    <view class="calendar-grid">
      <view
        v-for="(day, index) in monthDays"
        :key="index"
        class="calendar-cell"
        :class="{ 
          today: isToday(day.date),
          'not-current': !day.inCurrentMonth 
        }"
        @dblclick="openAddDialog(day.date)"
      >
        <text class="date-label">{{ day.date.getDate() }}</text>
        <view class="events">
          <view
            v-for="(event, i) in day.events"
            :key="i"
            class="event-item"
            @click="openEvent(event)"
          >
            <text class="event-time">{{ formatEventTime(event) }}</text>
            <text class="event-title">{{ event.title }}</text>
          </view>
          <view 
            v-if="day.hasMoreEvents" 
            class="more-events" 
            @click="showAllEvents(day.date)"
          >
            <text>+{{ day.totalEvents - 5 }} 更多</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 事件对话框 -->
    <view class="dialog" v-if="showDialog">
      <view class="dialog-mask" @click="closeDialog"></view>
      <view class="dialog-content">
        <view v-if="!isEditing">
          <view class="dialog-header">
            <text class="dialog-title">事件详情</text>
          </view>
          <view class="dialog-body">
            <view class="event-field">
              <text class="field-label">标题:</text>
              <text>{{ selectedEvent.title }}</text>
            </view>
            <view class="event-field">
              <text class="field-label">开始时间:</text>
              <text>{{ formatDate(selectedEvent.startTime) }}</text>
            </view>
            <view class="event-field">
              <text class="field-label">结束时间:</text>
              <text>{{ formatDate(selectedEvent.endTime) }}</text>
            </view>
            <view v-if="selectedEvent.description" class="event-field">
              <text class="field-label">描述:</text>
              <text>{{ selectedEvent.description }}</text>
            </view>
            <view v-if="selectedEvent.location" class="event-field">
              <text class="field-label">地点:</text>
              <text>{{ selectedEvent.location }}</text>
            </view>
          </view>
          <view class="dialog-footer">
            <button @click="editEvent">编辑</button>
            <button @click="deleteEventConfirm">删除</button>
            <button @click="closeDialog">关闭</button>
          </view>
        </view>
        
        <view v-else>
          <view class="dialog-header">
            <text class="dialog-title">编辑事件</text>
          </view>
          <view class="dialog-body">
            <view class="form-group">
              <label>标题:</label>
              <input v-model="editingEvent.title" placeholder="输入标题" />
            </view>
            <view class="form-group">
              <label>开始时间:</label>
              <input v-model="editingEvent.startTime" placeholder="YYYY-MM-DD HH:mm" />
            </view>
            <view class="form-group">
              <label>结束时间:</label>
              <input v-model="editingEvent.endTime" placeholder="YYYY-MM-DD HH:mm" />
            </view>
            <view class="form-group">
            <label>提醒:</label>
            <view class="reminder-selector">
              <input 
                type="number" 
                v-model.number="newEvent.reminder.value" 
                class="reminder-value" 
                min="0"
              />
              <picker 
                mode="selector" 
                :range="reminderUnits" 
                @change="onReminderUnitChange"
                :value="selectedReminderUnitIndex"
              >
                <view class="picker-selector">
                  {{ getReminderUnitLabel(newEvent.reminder.unit) }}
                </view>
              </picker>
            </view>
          </view>
            <view class="form-group">
              <label>描述:</label>
              <textarea v-model="editingEvent.description" placeholder="输入描述"></textarea>
            </view>
            <view class="form-group">
              <label>地点:</label>
              <input v-model="editingEvent.location" placeholder="输入地点" />
            </view>
          </view>
          <view class="dialog-footer">
            <button @click="saveEvent">保存</button>
            <button @click="cancelEdit">取消</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加事件对话框 -->
    <view class="dialog" v-if="showAddDialog">
      <view class="dialog-mask" @click="closeAddDialog"></view>
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">添加事件</text>
        </view>
        <view class="dialog-body">
          <view class="form-group">
            <label>标题:</label>
            <input v-model="newEvent.title" placeholder="输入标题" />
          </view>
          <view class="form-group">
            <label>开始时间:</label>
            <input v-model="newEvent.startTime" placeholder="YYYY-MM-DD HH:mm" />
          </view>
          <view class="form-group">
            <label>结束时间:</label>
            <input v-model="newEvent.endTime" placeholder="YYYY-MM-DD HH:mm" />
          </view>
          <view class="form-group">
            <label>提醒:</label>
            <view class="reminder-selector">
              <input 
                type="number" 
                v-model.number="newEvent.reminder.value" 
                class="reminder-value" 
                min="0"
              />
              <picker 
                mode="selector" 
                :range="reminderUnits" 
                @change="onReminderUnitChange"
                :value="selectedReminderUnitIndex"
              >
                <view class="picker-selector">
                  {{ getReminderUnitLabel(newEvent.reminder.unit) }}
                </view>
              </picker>
            </view>
          </view>
          <view class="form-group">
            <label>描述:</label>
            <textarea v-model="newEvent.description" placeholder="输入描述"></textarea>
          </view>
          <view class="form-group">
            <label>地点:</label>
            <input v-model="newEvent.location" placeholder="输入地点" />
          </view>
        </view>
        <view class="dialog-footer">
          <button @click="addEvent">添加</button>
          <button @click="closeAddDialog">取消</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getEvents, 
  addEvent, 
  updateEvent, 
  deleteEvent 
} from '../api/event.js';
import { 
  getMonthDays, 
  isToday, 
  formatDate,
  getFirstDayOfMonth,
  getLastDayOfMonth
} from '../utils/date.js';
import { scheduleReminders, scheduleSingleReminder } from '../utils/reminder.js';

export default {
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  emits: ['refresh'],
  data() {
    return {
      currentDate: new Date(),
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      showDialog: false,
      showAddDialog: false,
      selectedEvent: null,
      isEditing: false,
      editingEvent: {},
      newEvent: {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        reminder: { value: 10, unit: 'm' }
      },
      addDate: new Date(),
      reminderUnits: [
        { label: '分钟', value: 'm' },
        { label: '小时', value: 'h' },
        { label: '天', value: 'd' }
      ],
      selectedReminderUnitIndex: 0
    };
  },
  computed: {
    currentYear() {
      return this.currentDate.getFullYear();
    },
    currentMonth() {
      return this.currentDate.getMonth();
    },
    monthDays() {
      const days = getMonthDays(this.currentDate);
      const firstDay = getFirstDayOfMonth(this.currentDate);
      const lastDay = getLastDayOfMonth(this.currentDate);
      
      return days.map(date => {
        const inCurrentMonth = date >= firstDay && date <= lastDay;
        const dayEvents = this.getEventsForDay(date);
        return {
          date,
          inCurrentMonth,
          events: dayEvents.slice(0, 5), // 显示前5个事件
          hasMoreEvents: dayEvents.length > 5,
          totalEvents: dayEvents.length // 添加事件总数
        };
      });
    }
  },
  watch: {
    events: {
      handler() {
        scheduleReminders(this.events);
      },
      immediate: true
    }
  },
  methods: {
    isToday,
    formatDate,
    isValidDateTime(dateTimeStr) {
      const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
      if (!regex.test(dateTimeStr)) {
        return false;
      }
      
      const date = new Date(dateTimeStr);
      return date.toString() !== 'Invalid Date' && !isNaN(date);
    },
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    getEventsForDay(date) {
      return this.events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.getFullYear() === date.getFullYear() &&
              eventDate.getMonth() === date.getMonth() &&
              eventDate.getDate() === date.getDate();
      });
    },
    openEvent(event) {
      this.selectedEvent = { ...event };
      this.isEditing = false;
      this.showDialog = true;
    },
    closeDialog() {
      this.showDialog = false;
      this.selectedEvent = null;
    },
    editEvent() {
      // 格式化时间以适应输入框
      const formattedEvent = { ...this.selectedEvent };
      if (formattedEvent.startTime) {
        formattedEvent.startTime = this.formatDateTimeForInput(formattedEvent.startTime);
      }
      if (formattedEvent.endTime) {
        formattedEvent.endTime = this.formatDateTimeForInput(formattedEvent.endTime);
      }
      this.editingEvent = formattedEvent;
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    deleteEventConfirm() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除此事件吗？',
        success: (res) => {
          if (res.confirm) {
            this.deleteEvent();
          }
        }
      });
    },
    async deleteEvent() {
      try {
        await deleteEvent(this.selectedEvent._id);
        this.showDialog = false;
        this.$emit('refresh');
        uni.showToast({ title: '删除成功' });
      } catch (err) {
        uni.showToast({ title: '删除失败', icon: 'none' });
      }
    },
    openAddDialog(date) {
      console.log('打开添加对话框，日期:', date);
      this.addDate = new Date(date);
      this.newEvent = {
        title: '',
        description: '',
        startTime: this.formatToAddTime(date),
        endTime: this.formatToAddTime(date, 60),
        location: '',
        reminder: { value: 10, unit: 'm' }
      };
      console.log('初始化的新事件:', this.newEvent);
      this.showAddDialog = true;
},
    formatToAddTime(date, addMinutes = 0) {
      const d = new Date(date);
      d.setHours(9, 0, 0, 0); // 默认时间设为上午9点
      d.setMinutes(d.getMinutes() + addMinutes);
      
      // 确保小时和分钟不会超出有效范围
      let hours = d.getHours();
      let minutes = d.getMinutes();
      
      // 处理分钟进位到小时
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
      
      // 处理小时进位到天
      if (hours >= 24) {
        hours = hours % 24;
      }
      
      // 确保月份和日期是两位数
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      
      return `${d.getFullYear()}-${month}-${day} ${formattedHours}:${formattedMinutes}`;
},
    closeAddDialog() {
      this.showAddDialog = false;
    },
    async saveEvent() {
      try {
        // 在保存前验证并转换时间格式
        const eventToSave = { ...this.editingEvent };
        
        if (eventToSave.startTime && !this.isValidDateTime(eventToSave.startTime)) {
          uni.showToast({ title: '开始时间格式不正确', icon: 'none' });
          return;
        }
        
        if (eventToSave.endTime && !this.isValidDateTime(eventToSave.endTime)) {
          uni.showToast({ title: '结束时间格式不正确', icon: 'none' });
          return;
        }
        
        await updateEvent(this.editingEvent._id, eventToSave);
        this.isEditing = false;
        this.showDialog = false;
        this.$emit('refresh');
        uni.showToast({ title: '更新成功' });
      } catch (err) {
        uni.showToast({ title: '更新失败', icon: 'none' });
      }
    },
    // 添加在 methods 中的其他方法之后
    showAllEvents(date) {
      // 可以打开一个模态框显示当天所有事件
      // 或者切换到日视图
      this.$emit('show-day-events', date);
    },
    
    dayEventsCount(date) {
      return this.getEventsForDay(date).length;
    },
    formatEventTime(event) {
      const start = new Date(event.startTime);
      return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    },
    formatDateTimeForInput(dateTime) {
      if (!dateTime) return '';
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    async addEvent() {
      try {
        // 验证必填字段
        if (!this.newEvent.title) {
          uni.showToast({ title: '请输入标题', icon: 'none' }); 
          return;
        }
        
        if (!this.newEvent.startTime || !this.newEvent.endTime) {
          uni.showToast({ title: '请选择时间', icon: 'none' });
          return;
        }
        
        // 验证时间格式
        if (!this.isValidDateTime(this.newEvent.startTime) || !this.isValidDateTime(this.newEvent.endTime)) {
          uni.showToast({ title: '时间格式不正确', icon: 'none' });
          return;
        }
        
        // 验证结束时间不能早于开始时间
        const start = new Date(this.newEvent.startTime);
        const end = new Date(this.newEvent.endTime);
        if (end <= start) {
          uni.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' });
          return;
        }
        
        console.log('发送添加事件请求:', this.newEvent);
        const result = await addEvent(this.newEvent);
        console.log('添加事件响应:', result);
        
        // 检查响应结果
        if (result) {
          // 如果返回的是对象且包含 code 字段
          if (typeof result === 'object' && (result.code === 200 || result.code === 201)) {
            this.showAddDialog = false;
            this.$emit('refresh');
            uni.showToast({ title: '添加成功' });
            scheduleSingleReminder(this.newEvent);
            return;
          }
          
          // 如果返回的是对象但没有 code 字段（可能是直接返回了数据）
          if (typeof result === 'object' && !result.code) {
            this.showAddDialog = false;
            this.$emit('refresh');
            uni.showToast({ title: '添加成功' });
            scheduleSingleReminder(this.newEvent);
            return;
          }
          
          // 其他情况认为是失败
          throw new Error(result.message || '添加失败');
        } else {
          throw new Error('服务器未返回有效数据');
        }
      } catch (err) {
        console.error('添加事件失败:', err);
        const errMsg = err.errMsg || err.message || err.toString() || '未知错误';
        // 过滤掉 uni.request 的技术性错误信息
        const displayErrMsg = errMsg.includes('request:ok') ? '添加失败，请检查网络或服务器状态' : errMsg;
        uni.showToast({ 
          title: '添加失败: ' + displayErrMsg, 
          icon: 'none',
          duration: 3000
        });
      }
    },
    // 测试提醒功能（用于调试）
    testReminder() {
      const testEvent = {
        _id: 'test',
        title: '测试提醒',
        startTime: new Date(Date.now() + 10000).toISOString(), // 10秒后开始
        reminder: { value: 5, unit: 'm' } // 这里会转换为5分钟，但我们会调整逻辑
      };
      
      // 临时修改提醒时间为1秒后
      const start = new Date(testEvent.startTime).getTime();
      const delay = 1000; // 1秒后触发
      
      console.log('设置测试提醒:', testEvent);
      
      const timer = setTimeout(() => {
        uni.showToast({
          title: `【测试提醒】${testEvent.title} 即将开始`,
          icon: 'none',
          duration: 5000
        });
      }, delay);
      
      reminderTimers.push(timer);
    },
    getReminderUnitLabel(unit) {
      const units = {
        'm': '分钟',
        'h': '小时',
        'd': '天'
      };
      return units[unit] || '分钟';
    },
    
    onReminderUnitChange(e) {
      const selectedIndex = e.detail.value;
      this.newEvent.reminder.unit = this.reminderUnits[selectedIndex].value;
    },
  }
};
</script>

<style scoped>
.month-view {
  padding: 10px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-btn {
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.week-header {
  display: flex;
  background-color: #f5f5f5;
  font-weight: bold;
}

.week-day {
  flex: 1;
  text-align: center;
  padding: 10px 0;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-cell {
  width: 14.28%;
  min-height: 100px;
  border: 1px solid #eee;
  padding: 5px;
  position: relative;
}

.today {
  background-color: #e6f7ff;
}

.not-current {
  opacity: 0.5;
}

.date-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.events {
  font-size: 12px;
}

.event-item {
  background-color: #1890ff;
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-events {
  font-size: 12px;
  color: #1890ff;
  text-align: center;
  margin-top: 2px;
}

.dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.dialog-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-height: 80%;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.dialog-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
}

.dialog-body {
  padding: 15px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  min-height: 40px;
}

.event-field {
  margin-bottom: 10px;
}

.field-label {
  font-weight: bold;
  margin-right: 10px;
}

.dialog-footer {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-around;
}

.dialog-footer button {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
}

.reminder-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reminder-value {
  width: 80px;
  padding: 12px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.picker-selector {
  padding: 12px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}
</style>