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
      dialogVisible: false,
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
    weekDates() {
      return utils_date.getWeekDays(this.currentDate);
    },
    weekHeaders() {
      return this.weekDates.map((date) => ({
        name: ["日", "一", "二", "三", "四", "五", "六"][date.getDay()],
        date: `${date.getMonth() + 1}-${date.getDate()}`
      }));
    }
  },
  methods: {
    isToday: utils_date.isToday,
    formatDate: utils_date.formatDate,
    formatRange() {
      const start = this.weekDates[0];
      const end = this.weekDates[6];
      return `${start.getFullYear()}年第${Math.ceil(start.getDate() / 7)}周 (${start.getMonth() + 1}.${start.getDate()} - ${end.getMonth() + 1}.${end.getDate()})`;
    },
    prevWeek() {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    },
    nextWeek() {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    },
    getEventsByDate(date) {
      return this.events.filter((event) => {
        const eventDate = new Date(event.startTime);
        return eventDate.getFullYear() === date.getFullYear() && eventDate.getMonth() === date.getMonth() && eventDate.getDate() === date.getDate();
      });
    },
    formatTime(dateStr) {
      const date = new Date(dateStr);
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
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
        this.dialogVisible = false;
        this.$emit("refresh");
        common_vendor.index.showToast({ title: "更新成功" });
      } catch (err) {
        common_vendor.index.showToast({ title: "更新失败", icon: "none" });
      }
    },
    handleDelete() {
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
        this.dialogVisible = false;
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
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.prevWeek && $options.prevWeek(...args)),
    b: common_vendor.t($options.formatRange()),
    c: common_vendor.o((...args) => $options.nextWeek && $options.nextWeek(...args)),
    d: common_vendor.f($options.weekHeaders, (day, index, i0) => {
      return {
        a: common_vendor.t(day.name),
        b: common_vendor.t(day.date),
        c: index
      };
    }),
    e: common_vendor.f($options.weekDates, (date, index, i0) => {
      return {
        a: common_vendor.t(date.getDate()),
        b: common_vendor.f($options.getEventsByDate(date), (event, k1, i1) => {
          return {
            a: common_vendor.t($options.formatTime(event.startTime)),
            b: common_vendor.t(event.title),
            c: event._id,
            d: common_vendor.o(($event) => $options.openEvent(event), event._id)
          };
        }),
        c: index,
        d: $options.isToday(date) ? 1 : "",
        e: common_vendor.o(($event) => $options.openAddDialog(date), index)
      };
    }),
    f: $data.dialogVisible
  }, $data.dialogVisible ? common_vendor.e({
    g: common_vendor.o((...args) => $options.closeDialog && $options.closeDialog(...args)),
    h: !$data.isEditing
  }, !$data.isEditing ? common_vendor.e({
    i: common_vendor.t((_a = $data.selectedEvent) == null ? void 0 : _a.title),
    j: common_vendor.t($options.formatDate((_b = $data.selectedEvent) == null ? void 0 : _b.startTime)),
    k: common_vendor.t($options.formatDate((_c = $data.selectedEvent) == null ? void 0 : _c.endTime)),
    l: (_d = $data.selectedEvent) == null ? void 0 : _d.description
  }, ((_e = $data.selectedEvent) == null ? void 0 : _e.description) ? {
    m: common_vendor.t((_f = $data.selectedEvent) == null ? void 0 : _f.description)
  } : {}, {
    n: (_g = $data.selectedEvent) == null ? void 0 : _g.location
  }, ((_h = $data.selectedEvent) == null ? void 0 : _h.location) ? {
    o: common_vendor.t((_i = $data.selectedEvent) == null ? void 0 : _i.location)
  } : {}, {
    p: common_vendor.o((...args) => $options.handleEdit && $options.handleEdit(...args)),
    q: common_vendor.o((...args) => $options.handleDelete && $options.handleDelete(...args)),
    r: common_vendor.o((...args) => $options.closeDialog && $options.closeDialog(...args))
  }) : {
    s: $data.editingEvent.title,
    t: common_vendor.o(($event) => $data.editingEvent.title = $event.detail.value),
    v: $data.editingEvent.startTime,
    w: common_vendor.o(($event) => $data.editingEvent.startTime = $event.detail.value),
    x: $data.editingEvent.endTime,
    y: common_vendor.o(($event) => $data.editingEvent.endTime = $event.detail.value),
    z: $data.editingEvent.description,
    A: common_vendor.o(($event) => $data.editingEvent.description = $event.detail.value),
    B: $data.editingEvent.location,
    C: common_vendor.o(($event) => $data.editingEvent.location = $event.detail.value),
    D: common_vendor.o((...args) => $options.saveEvent && $options.saveEvent(...args)),
    E: common_vendor.o((...args) => $options.cancelEdit && $options.cancelEdit(...args))
  }) : {}, {
    F: $data.showAddDialog
  }, $data.showAddDialog ? {
    G: common_vendor.o((...args) => $options.closeAddDialog && $options.closeAddDialog(...args)),
    H: $data.newEvent.title,
    I: common_vendor.o(($event) => $data.newEvent.title = $event.detail.value),
    J: $data.newEvent.startTime,
    K: common_vendor.o(($event) => $data.newEvent.startTime = $event.detail.value),
    L: $data.newEvent.endTime,
    M: common_vendor.o(($event) => $data.newEvent.endTime = $event.detail.value),
    N: $data.newEvent.description,
    O: common_vendor.o(($event) => $data.newEvent.description = $event.detail.value),
    P: $data.newEvent.location,
    Q: common_vendor.o(($event) => $data.newEvent.location = $event.detail.value),
    R: common_vendor.o((...args) => $options.addEvent && $options.addEvent(...args)),
    S: common_vendor.o((...args) => $options.closeAddDialog && $options.closeAddDialog(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-93605eaa"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/WeekView.js.map
