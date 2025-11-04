<template>
  <view class="day-view">
    <!-- 顶部日期导航 -->
    <!-- 顶部日期导航 -->
    <view class="day-header-bar">
      <button class="nav-btn" @click="prevDay">← 昨天</button>
      <text class="header-title">{{ formatDate(currentDate, 'YYYY年MM月DD日 dddd') }}</text>
      <button class="nav-btn" @click="nextDay">明天 →</button>
    </view>

    <!-- 事件列表 -->
    <view class="day-body" @dblclick="openAddDialog(currentDate)">
      <view
        v-for="event in getEventsByDate(currentDate)"
        :key="event._id"
        class="event-item"
        @click="openEvent(event)"
      >
        <view class="event-content">
          <text class="event-time">{{ formatEventTime(event) }}</text>
          <text class="event-title">{{ event.title }}</text>
        </view>
      </view>
    </view>

    <!-- 查看 / 编辑 / 删除事件弹窗 -->
    <view class="dialog" v-if="dialogVisible">
      <view class="dialog-mask" @click="closeDialog"></view>
      <view class="dialog-content">
        <view v-if="!isEditing">
          <view class="dialog-header">
            <text class="dialog-title">事件详情</text>
          </view>
          <view class="dialog-body">
            <view class="event-field">
              <text class="field-label">标题:</text>
              <text>{{ selectedEvent?.title }}</text>
            </view>
            <view class="event-field">
              <text class="field-label">开始时间:</text>
              <text>{{ formatDate(selectedEvent?.startTime) }}</text>
            </view>
            <view class="event-field">
              <text class="field-label">结束时间:</text>
              <text>{{ formatDate(selectedEvent?.endTime) }}</text>
            </view>
            <view v-if="selectedEvent?.description" class="event-field">
              <text class="field-label">描述:</text>
              <text>{{ selectedEvent?.description }}</text>
            </view>
            <view v-if="selectedEvent?.location" class="event-field">
              <text class="field-label">地点:</text>
              <text>{{ selectedEvent?.location }}</text>
            </view>
          </view>
          <view class="dialog-footer">
            <button @click="handleEdit">编辑</button>
            <button @click="handleDelete">删除</button>
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
                  v-model.number="editingEvent.reminder.value" 
                  class="reminder-value" 
                  min="0"
                />
                <picker 
                  mode="selector" 
                  :range="reminderUnitLabels" 
                  @change="onEditReminderUnitChange"
                  :value="getReminderUnitIndex(editingEvent.reminder.unit)"
                >
                  <view class="picker-selector">
                    {{ getReminderUnitLabel(editingEvent.reminder.unit) }}
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
                :range="reminderUnitLabels" 
                @change="onReminderUnitChange"
                :value="getReminderUnitIndex(newEvent.reminder.unit)"
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
  updateEvent, 
  deleteEvent, 
  addEvent 
} from '../api/event.js';
import { 
  isToday, 
  formatDate,
  getStartOfDay,
  getEndOfDay
} from '../utils/date.js';
import { scheduleReminders,scheduleSingleReminder } from '../utils/reminder.js';

export default {
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  emits: ['refresh'],
  watch: {
    events: {
      handler() {
        scheduleReminders(this.events);
      },
      immediate: true
    }
  },
  data() {
    return {
      currentDate: new Date(),
      dialogVisible: false,
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
      reminderUnitLabels: ['分钟', '小时', '天'],
    };
  },
  methods: {
    isToday,
    formatDate,
    prevDay() {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
      this.currentDate = new Date(this.currentDate);
    },
    nextDay() {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      this.currentDate = new Date(this.currentDate);
    },
    getEventsByDate(date) {
      const start = getStartOfDay(date);
      const end = getEndOfDay(date);
      
      return this.events
        .filter(event => {
          const eventStart = new Date(event.startTime);
          return eventStart >= start && eventStart < end;
        })
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    },
    formatEventTime(event) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    },
    openEvent(event) {
      this.selectedEvent = { ...event };
      this.dialogVisible = true;
      this.isEditing = false;
    },
    closeDialog() {
      this.dialogVisible = false;
      this.selectedEvent = null;
    },
    handleEdit() {
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
    cancelEdit() {
      this.isEditing = false;
    },
    async saveEvent() {
      try {
        // 在保存前验证并转换时间格式
        const eventToSave = { ...this.editingEvent };
        
        // 验证时间格式
        const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (eventToSave.startTime && !timeRegex.test(eventToSave.startTime)) {
          uni.showToast({ title: '开始时间格式不正确', icon: 'none' });
          return;
        }
        
        if (eventToSave.endTime && !timeRegex.test(eventToSave.endTime)) {
          uni.showToast({ title: '结束时间格式不正确', icon: 'none' });
          return;
        }
        
        await updateEvent(this.editingEvent._id, eventToSave);
        this.isEditing = false;
        this.dialogVisible = false;
        this.$emit('refresh');
        uni.showToast({ title: '更新成功' });
      } catch (err) {
        uni.showToast({ title: '更新失败', icon: 'none' });
      }
    },
    handleDelete() {
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
        this.dialogVisible = false;
        this.$emit('refresh');
        uni.showToast({ title: '删除成功' });
      } catch (err) {
        uni.showToast({ title: '删除失败', icon: 'none' });
      }
    },
    openAddDialog(date) {
      this.addDate = new Date(date);
      this.newEvent = {
        title: '',
        description: '',
        startTime: this.formatToAddTime(date),
        endTime: this.formatToAddTime(date, 60),
        location: '',
        reminder: { value: 10, unit: 'm' }
      };
      this.showAddDialog = true;
    },
    formatToAddTime(date, addMinutes = 0) {
      const d = new Date(date);
      d.setHours(9, 0, 0, 0);
      d.setMinutes(d.getMinutes() + addMinutes);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    closeAddDialog() {
      this.showAddDialog = false;
    },
    async addEvent() {
      try {
        await addEvent(this.newEvent);
        this.showAddDialog = false;
        this.$emit('refresh');
        uni.showToast({ title: '添加成功' });
        scheduleSingleReminder(this.newEvent);
      } catch (err) {
        uni.showToast({ title: '添加失败', icon: 'none' });
      }
    },
    getReminderUnitLabel(unit) {
      const units = {
        'm': '分钟',
        'h': '小时',
        'd': '天'
      };
      return units[unit] || '分钟';
    },
    
    getReminderUnitIndex(unit) {
      const units = {
        'm': 0,
        'h': 1,
        'd': 2
      };
      return units[unit] || 0;
    },
    onReminderUnitChange(e) {
      const selectedIndex = e.detail.value;
      const unitMap = ['m', 'h', 'd'];
      this.newEvent.reminder.unit = unitMap[selectedIndex];
    },
    onEditReminderUnitChange(e) {
      const selectedIndex = e.detail.value;
      const unitMap = ['m', 'h', 'd'];
      this.editingEvent.reminder.unit = unitMap[selectedIndex];
    },
  }
};
</script>

<style scoped>
.day-view {
  padding: 10px;
}

.day-header-bar {
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

.day-body {
  min-height: 300px;
  border: 1px dashed #ddd;
  padding: 10px;
  border-radius: 4px;
}

.event-item {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.event-content {
  display: flex;
}

.event-time {
  font-weight: bold;
  margin-right: 10px;
  white-space: nowrap;
}

.event-title {
  flex: 1;
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