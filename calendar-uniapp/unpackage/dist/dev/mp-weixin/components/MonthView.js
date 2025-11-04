"use strict";
const common_vendor = require("../common/vendor.js");
const api_event = require("../api/event.js");
const utils_date = require("../utils/date.js");
const utils_reminder = require("../utils/reminder.js");
const _sfc_main = {
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  emits: ["refresh"],
  data() {
    return {
      currentDate: /* @__PURE__ */ new Date(),
      weekDays: ["日", "一", "二", "三", "四", "五", "六"],
      showDialog: false,
      showAddDialog: false,
      selectedEvent: null,
      isEditing: false,
      editingEvent: {},
      newEvent: {
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
        reminder: { value: 10, unit: "m" }
      },
      addDate: /* @__PURE__ */ new Date()
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
      const days = utils_date.getMonthDays(this.currentDate);
      const firstDay = utils_date.getFirstDayOfMonth(this.currentDate);
      const lastDay = utils_date.getLastDayOfMonth(this.currentDate);
      return days.map((date) => {
        const inCurrentMonth = date >= firstDay && date <= lastDay;
        const dayEvents = this.getEventsForDay(date);
        return {
          date,
          inCurrentMonth,
          events: dayEvents.slice(0, 3),
          // 只显示前3个事件
          hasMoreEvents: dayEvents.length > 3
        };
      });
    }
  },
  watch: {
    events: {
      handler() {
        utils_reminder.scheduleReminders(this.events);
      },
      immediate: true
    }
  },
  methods: {
    isToday: utils_date.isToday,
    formatDate: utils_date.formatDate,
    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    getEventsForDay(date) {
      return this.events.filter((event) => {
        const eventDate = new Date(event.startTime);
        return utils_date.isToday(eventDate);
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
      this.editingEvent = { ...this.selectedEvent };
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    async saveEvent() {
      try {
        await api_event.updateEvent(this.editingEvent._id, this.editingEvent);
        this.isEditing = false;
        this.showDialog = false;
        this.$emit("refresh");
        common_vendor.index.showToast({ title: "更新成功" });
      } catch (err) {
        common_vendor.index.showToast({ title: "更新失败", icon: "none" });
      }
    },
    deleteEventConfirm() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除此事件吗？",
        success: (res) => {
          if (res.confirm) {
            this.deleteEvent();
          }
        }
      });
    },
    async deleteEvent() {
      try {
        await api_event.deleteEvent(this.selectedEvent._id);
        this.showDialog = false;
        this.$emit("refresh");
        common_vendor.index.showToast({ title: "删除成功" });
      } catch (err) {
        common_vendor.index.showToast({ title: "删除失败", icon: "none" });
      }
    },
    openAddDialog(date) {
      this.addDate = new Date(date);
      this.newEvent = {
        title: "",
        description: "",
        startTime: this.formatToAddTime(date),
        endTime: this.formatToAddTime(date, 60),
        location: "",
        reminder: { value: 10, unit: "m" }
      };
      this.showAddDialog = true;
    },
    formatToAddTime(date, addMinutes = 0) {
      const d = new Date(date);
      d.setHours(9, 0, 0, 0);
      d.setMinutes(d.getMinutes() + addMinutes);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    },
    closeAddDialog() {
      this.showAddDialog = false;
    },
    async addEvent() {
      try {
        await api_event.addEvent(this.newEvent);
        this.showAddDialog = false;
        this.$emit("refresh");
        common_vendor.index.showToast({ title: "添加成功" });
        utils_reminder.scheduleSingleReminder(this.newEvent);
      } catch (err) {
        common_vendor.index.showToast({ title: "添加失败", icon: "none" });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.prevMonth && $options.prevMonth(...args)),
    b: common_vendor.t($options.currentYear),
    c: common_vendor.t($options.currentMonth + 1),
    d: common_vendor.o((...args) => $options.nextMonth && $options.nextMonth(...args)),
    e: common_vendor.f($data.weekDays, (day, index, i0) => {
      return {
        a: common_vendor.t(day),
        b: index
      };
    }),
    f: common_vendor.f($options.monthDays, (day, index, i0) => {
      return {
        a: common_vendor.t(day.date.getDate()),
        b: common_vendor.f($options.getEventsForDay(day.date), (event, i, i1) => {
          return {
            a: common_vendor.t(event.title),
            b: i,
            c: common_vendor.o(($event) => $options.openEvent(event), i)
          };
        }),
        c: index,
        d: $options.isToday(day.date) ? 1 : "",
        e: !day.inCurrentMonth ? 1 : "",
        f: common_vendor.o(($event) => $options.openAddDialog(day.date), index)
      };
    }),
    g: $data.showDialog
  }, $data.showDialog ? common_vendor.e({
    h: common_vendor.o((...args) => $options.closeDialog && $options.closeDialog(...args)),
    i: !$data.isEditing
  }, !$data.isEditing ? common_vendor.e({
    j: common_vendor.t($data.selectedEvent.title),
    k: common_vendor.t($options.formatDate($data.selectedEvent.startTime)),
    l: common_vendor.t($options.formatDate($data.selectedEvent.endTime)),
    m: $data.selectedEvent.description
  }, $data.selectedEvent.description ? {
    n: common_vendor.t($data.selectedEvent.description)
  } : {}, {
    o: $data.selectedEvent.location
  }, $data.selectedEvent.location ? {
    p: common_vendor.t($data.selectedEvent.location)
  } : {}, {
    q: common_vendor.o((...args) => $options.editEvent && $options.editEvent(...args)),
    r: common_vendor.o((...args) => $options.deleteEventConfirm && $options.deleteEventConfirm(...args)),
    s: common_vendor.o((...args) => $options.closeDialog && $options.closeDialog(...args))
  }) : {
    t: $data.editingEvent.title,
    v: common_vendor.o(($event) => $data.editingEvent.title = $event.detail.value),
    w: $data.editingEvent.startTime,
    x: common_vendor.o(($event) => $data.editingEvent.startTime = $event.detail.value),
    y: $data.editingEvent.endTime,
    z: common_vendor.o(($event) => $data.editingEvent.endTime = $event.detail.value),
    A: $data.editingEvent.description,
    B: common_vendor.o(($event) => $data.editingEvent.description = $event.detail.value),
    C: $data.editingEvent.location,
    D: common_vendor.o(($event) => $data.editingEvent.location = $event.detail.value),
    E: common_vendor.o((...args) => $options.saveEvent && $options.saveEvent(...args)),
    F: common_vendor.o((...args) => $options.cancelEdit && $options.cancelEdit(...args))
  }) : {}, {
    G: $data.showAddDialog
  }, $data.showAddDialog ? {
    H: common_vendor.o((...args) => $options.closeAddDialog && $options.closeAddDialog(...args)),
    I: $data.newEvent.title,
    J: common_vendor.o(($event) => $data.newEvent.title = $event.detail.value),
    K: $data.newEvent.startTime,
    L: common_vendor.o(($event) => $data.newEvent.startTime = $event.detail.value),
    M: $data.newEvent.endTime,
    N: common_vendor.o(($event) => $data.newEvent.endTime = $event.detail.value),
    O: $data.newEvent.description,
    P: common_vendor.o(($event) => $data.newEvent.description = $event.detail.value),
    Q: $data.newEvent.location,
    R: common_vendor.o(($event) => $data.newEvent.location = $event.detail.value),
    S: common_vendor.o((...args) => $options.addEvent && $options.addEvent(...args)),
    T: common_vendor.o((...args) => $options.closeAddDialog && $options.closeAddDialog(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dadfdaf7"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/MonthView.js.map
