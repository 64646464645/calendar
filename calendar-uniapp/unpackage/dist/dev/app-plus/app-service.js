if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const getConfig = () => {
    return {
      baseURL: "http://10.21.65.206:3000/api"
    };
  };
  const config = getConfig();
  function request(options) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: config.baseURL + options.url,
        method: options.method || "GET",
        data: options.data || options.params,
        success: (res) => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(res.data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.errMsg || "Request failed"}`));
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || err.message || "Network error"));
        }
      });
    });
  }
  request.get = (url, params) => request({ url, method: "GET", params });
  request.post = (url, data) => request({ url, method: "POST", data });
  request.put = (url, data) => request({ url, method: "PUT", data });
  request.delete = (url) => request({ url, method: "DELETE" });
  function getEvents(params) {
    return request({
      url: "/events",
      method: "get",
      params
    });
  }
  function addEvent(data) {
    return request({
      url: "/events",
      method: "post",
      data
    });
  }
  function updateEvent(id, data) {
    return request({
      url: `/events/${id}`,
      method: "put",
      data
    });
  }
  function deleteEvent(id) {
    return request({
      url: `/events/${id}`,
      method: "delete"
    });
  }
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }
  function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }
  function getStartOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  function getEndOfDay(date) {
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    end.setDate(end.getDate() + 1);
    return end;
  }
  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
  }
  function isToday(date) {
    return isSameDay(date, /* @__PURE__ */ new Date());
  }
  function getMonthDays(date) {
    const firstDay = getFirstDayOfMonth(date);
    getLastDayOfMonth(date);
    const startDay = new Date(firstDay);
    startDay.setDate(firstDay.getDate() - firstDay.getDay());
    const endDate = new Date(startDay);
    endDate.setDate(startDay.getDate() + 42);
    const days = [];
    const current = new Date(startDay);
    while (current < endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }
  function getWeekDays(date) {
    const week = [];
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - date.getDay());
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      week.push(currentDate);
    }
    return week;
  }
  let reminderTimers$1 = [];
  function unitToMs(unit) {
    const units = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
    return units[unit] || 6e4;
  }
  function scheduleReminders(events) {
    reminderTimers$1.forEach((timer) => clearTimeout(timer));
    reminderTimers$1 = [];
    formatAppLog("log", "at utils/reminder.js:17", "设置提醒，事件数量:", events.length);
    const now = Date.now();
    events.forEach((event) => {
      if (!event.reminder || !event._id) {
        formatAppLog("log", "at utils/reminder.js:22", "跳过事件（缺少提醒信息）:", event.title);
        return;
      }
      const start = new Date(event.startTime).getTime();
      const delay = start - event.reminder.value * unitToMs(event.reminder.unit) - now;
      formatAppLog("log", "at utils/reminder.js:29", `事件 "${event.title}" 的提醒设置:`, {
        startTime: event.startTime,
        start,
        reminderValue: event.reminder.value,
        reminderUnit: event.reminder.unit,
        now: new Date(now).toISOString(),
        delay,
        willTrigger: delay > 0
      });
      if (delay > 0) {
        formatAppLog("log", "at utils/reminder.js:40", `将在 ${delay} 毫秒后触发提醒`);
        const timer = setTimeout(() => {
          formatAppLog("log", "at utils/reminder.js:42", "触发提醒:", event.title);
          uni.showToast({
            title: `【提醒】${event.title} 即将开始`,
            icon: "none",
            duration: 5e3
          });
        }, delay);
        reminderTimers$1.push(timer);
      } else {
        formatAppLog("log", "at utils/reminder.js:51", "跳过事件（提醒时间已过）:", event.title, "延迟:", delay);
      }
    });
  }
  function scheduleSingleReminder(event) {
    formatAppLog("log", "at utils/reminder.js:58", "设置单个事件提醒:", event);
    if (event && event._id) {
      scheduleReminders([event]);
    } else {
      formatAppLog("log", "at utils/reminder.js:62", "无法设置提醒：事件数据不完整");
    }
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$5 = {
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
        addDate: /* @__PURE__ */ new Date(),
        reminderUnits: [
          { label: "分钟", value: "m" },
          { label: "小时", value: "h" },
          { label: "天", value: "d" }
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
        return days.map((date) => {
          const inCurrentMonth = date >= firstDay && date <= lastDay;
          const dayEvents = this.getEventsForDay(date);
          return {
            date,
            inCurrentMonth,
            events: dayEvents.slice(0, 5),
            // 显示前5个事件
            hasMoreEvents: dayEvents.length > 5,
            totalEvents: dayEvents.length
            // 添加事件总数
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
        return date.toString() !== "Invalid Date" && !isNaN(date);
      },
      prevMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      },
      nextMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      },
      getEventsForDay(date) {
        return this.events.filter((event) => {
          const eventDate = new Date(event.startTime);
          return eventDate.getFullYear() === date.getFullYear() && eventDate.getMonth() === date.getMonth() && eventDate.getDate() === date.getDate();
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
          await deleteEvent(this.selectedEvent._id);
          this.showDialog = false;
          this.$emit("refresh");
          uni.showToast({ title: "删除成功" });
        } catch (err) {
          uni.showToast({ title: "删除失败", icon: "none" });
        }
      },
      openAddDialog(date) {
        formatAppLog("log", "at components/MonthView.vue:355", "打开添加对话框，日期:", date);
        this.addDate = new Date(date);
        this.newEvent = {
          title: "",
          description: "",
          startTime: this.formatToAddTime(date),
          endTime: this.formatToAddTime(date, 60),
          location: "",
          reminder: { value: 10, unit: "m" }
        };
        formatAppLog("log", "at components/MonthView.vue:365", "初始化的新事件:", this.newEvent);
        this.showAddDialog = true;
      },
      formatToAddTime(date, addMinutes = 0) {
        const d = new Date(date);
        d.setHours(9, 0, 0, 0);
        d.setMinutes(d.getMinutes() + addMinutes);
        let hours = d.getHours();
        let minutes = d.getMinutes();
        if (minutes >= 60) {
          hours += Math.floor(minutes / 60);
          minutes = minutes % 60;
        }
        if (hours >= 24) {
          hours = hours % 24;
        }
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const formattedHours = String(hours).padStart(2, "0");
        const formattedMinutes = String(minutes).padStart(2, "0");
        return `${d.getFullYear()}-${month}-${day} ${formattedHours}:${formattedMinutes}`;
      },
      closeAddDialog() {
        this.showAddDialog = false;
      },
      async saveEvent() {
        try {
          const eventToSave = { ...this.editingEvent };
          if (eventToSave.startTime && !this.isValidDateTime(eventToSave.startTime)) {
            uni.showToast({ title: "开始时间格式不正确", icon: "none" });
            return;
          }
          if (eventToSave.endTime && !this.isValidDateTime(eventToSave.endTime)) {
            uni.showToast({ title: "结束时间格式不正确", icon: "none" });
            return;
          }
          await updateEvent(this.editingEvent._id, eventToSave);
          this.isEditing = false;
          this.showDialog = false;
          this.$emit("refresh");
          uni.showToast({ title: "更新成功" });
        } catch (err) {
          uni.showToast({ title: "更新失败", icon: "none" });
        }
      },
      // 添加在 methods 中的其他方法之后
      showAllEvents(date) {
        this.$emit("show-day-events", date);
      },
      dayEventsCount(date) {
        return this.getEventsForDay(date).length;
      },
      formatEventTime(event) {
        const start = new Date(event.startTime);
        return `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`;
      },
      formatDateTimeForInput(dateTime) {
        if (!dateTime)
          return "";
        const date = new Date(dateTime);
        if (isNaN(date.getTime()))
          return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      },
      async addEvent() {
        try {
          if (!this.newEvent.title) {
            uni.showToast({ title: "请输入标题", icon: "none" });
            return;
          }
          if (!this.newEvent.startTime || !this.newEvent.endTime) {
            uni.showToast({ title: "请选择时间", icon: "none" });
            return;
          }
          if (!this.isValidDateTime(this.newEvent.startTime) || !this.isValidDateTime(this.newEvent.endTime)) {
            uni.showToast({ title: "时间格式不正确", icon: "none" });
            return;
          }
          const start = new Date(this.newEvent.startTime);
          const end = new Date(this.newEvent.endTime);
          if (end <= start) {
            uni.showToast({ title: "结束时间必须晚于开始时间", icon: "none" });
            return;
          }
          formatAppLog("log", "at components/MonthView.vue:477", "发送添加事件请求:", this.newEvent);
          const result = await addEvent(this.newEvent);
          formatAppLog("log", "at components/MonthView.vue:479", "添加事件响应:", result);
          if (result) {
            if (typeof result === "object" && (result.code === 200 || result.code === 201)) {
              this.showAddDialog = false;
              this.$emit("refresh");
              uni.showToast({ title: "添加成功" });
              scheduleSingleReminder(this.newEvent);
              return;
            }
            if (typeof result === "object" && !result.code) {
              this.showAddDialog = false;
              this.$emit("refresh");
              uni.showToast({ title: "添加成功" });
              scheduleSingleReminder(this.newEvent);
              return;
            }
            throw new Error(result.message || "添加失败");
          } else {
            throw new Error("服务器未返回有效数据");
          }
        } catch (err) {
          formatAppLog("error", "at components/MonthView.vue:507", "添加事件失败:", err);
          const errMsg = err.errMsg || err.message || err.toString() || "未知错误";
          const displayErrMsg = errMsg.includes("request:ok") ? "添加失败，请检查网络或服务器状态" : errMsg;
          uni.showToast({
            title: "添加失败: " + displayErrMsg,
            icon: "none",
            duration: 3e3
          });
        }
      },
      // 测试提醒功能（用于调试）
      testReminder() {
        const testEvent = {
          _id: "test",
          title: "测试提醒",
          startTime: new Date(Date.now() + 1e4).toISOString(),
          // 10秒后开始
          reminder: { value: 5, unit: "m" }
          // 这里会转换为5分钟，但我们会调整逻辑
        };
        new Date(testEvent.startTime).getTime();
        const delay = 1e3;
        formatAppLog("log", "at components/MonthView.vue:531", "设置测试提醒:", testEvent);
        const timer = setTimeout(() => {
          uni.showToast({
            title: `【测试提醒】${testEvent.title} 即将开始`,
            icon: "none",
            duration: 5e3
          });
        }, delay);
        reminderTimers.push(timer);
      },
      getReminderUnitLabel(unit) {
        const units = {
          "m": "分钟",
          "h": "小时",
          "d": "天"
        };
        return units[unit] || "分钟";
      },
      onReminderUnitChange(e) {
        const selectedIndex = e.detail.value;
        this.newEvent.reminder.unit = this.reminderUnits[selectedIndex].value;
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "month-view" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "calendar-header" }, [
        vue.createElementVNode("button", {
          class: "nav-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.prevMonth && $options.prevMonth(...args))
        }, "← 上月"),
        vue.createElementVNode(
          "text",
          { class: "header-title" },
          vue.toDisplayString($options.currentYear) + "年 " + vue.toDisplayString($options.currentMonth + 1) + "月",
          1
          /* TEXT */
        ),
        vue.createElementVNode("button", {
          class: "nav-btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.nextMonth && $options.nextMonth(...args))
        }, "下月 →")
      ]),
      vue.createCommentVNode(" 星期头 "),
      vue.createElementVNode("view", { class: "week-header" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.weekDays, (day, index) => {
            return vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: index,
                class: "week-day"
              },
              vue.toDisplayString(day),
              1
              /* TEXT */
            );
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 日期网格 "),
      vue.createElementVNode("view", { class: "calendar-grid" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.monthDays, (day, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["calendar-cell", {
                today: $options.isToday(day.date),
                "not-current": !day.inCurrentMonth
              }]),
              onDblclick: ($event) => $options.openAddDialog(day.date)
            }, [
              vue.createElementVNode(
                "text",
                { class: "date-label" },
                vue.toDisplayString(day.date.getDate()),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "events" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(day.events, (event, i) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: i,
                      class: "event-item",
                      onClick: ($event) => $options.openEvent(event)
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "event-time" },
                        vue.toDisplayString($options.formatEventTime(event)),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "event-title" },
                        vue.toDisplayString(event.title),
                        1
                        /* TEXT */
                      )
                    ], 8, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                )),
                day.hasMoreEvents ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "more-events",
                  onClick: ($event) => $options.showAllEvents(day.date)
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    "+" + vue.toDisplayString(day.totalEvents - 5) + " 更多",
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
              ])
            ], 42, ["onDblclick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 事件对话框 "),
      $data.showDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "dialog"
      }, [
        vue.createElementVNode("view", {
          class: "dialog-mask",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.closeDialog && $options.closeDialog(...args))
        }),
        vue.createElementVNode("view", { class: "dialog-content" }, [
          !$data.isEditing ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
            vue.createElementVNode("view", { class: "dialog-header" }, [
              vue.createElementVNode("text", { class: "dialog-title" }, "事件详情")
            ]),
            vue.createElementVNode("view", { class: "dialog-body" }, [
              vue.createElementVNode("view", { class: "event-field" }, [
                vue.createElementVNode("text", { class: "field-label" }, "标题:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($data.selectedEvent.title),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "event-field" }, [
                vue.createElementVNode("text", { class: "field-label" }, "开始时间:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($options.formatDate($data.selectedEvent.startTime)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "event-field" }, [
                vue.createElementVNode("text", { class: "field-label" }, "结束时间:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($options.formatDate($data.selectedEvent.endTime)),
                  1
                  /* TEXT */
                )
              ]),
              $data.selectedEvent.description ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "event-field"
              }, [
                vue.createElementVNode("text", { class: "field-label" }, "描述:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($data.selectedEvent.description),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              $data.selectedEvent.location ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "event-field"
              }, [
                vue.createElementVNode("text", { class: "field-label" }, "地点:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($data.selectedEvent.location),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("view", { class: "dialog-footer" }, [
              vue.createElementVNode("button", {
                onClick: _cache[3] || (_cache[3] = (...args) => $options.editEvent && $options.editEvent(...args))
              }, "编辑"),
              vue.createElementVNode("button", {
                onClick: _cache[4] || (_cache[4] = (...args) => $options.deleteEventConfirm && $options.deleteEventConfirm(...args))
              }, "删除"),
              vue.createElementVNode("button", {
                onClick: _cache[5] || (_cache[5] = (...args) => $options.closeDialog && $options.closeDialog(...args))
              }, "关闭")
            ])
          ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
            vue.createElementVNode("view", { class: "dialog-header" }, [
              vue.createElementVNode("text", { class: "dialog-title" }, "编辑事件")
            ]),
            vue.createElementVNode("view", { class: "dialog-body" }, [
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "标题:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.editingEvent.title = $event),
                    placeholder: "输入标题"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.title]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "开始时间:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.editingEvent.startTime = $event),
                    placeholder: "YYYY-MM-DD HH:mm"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.startTime]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "结束时间:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.editingEvent.endTime = $event),
                    placeholder: "YYYY-MM-DD HH:mm"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.endTime]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "提醒:"),
                vue.createElementVNode("view", { class: "reminder-selector" }, [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "number",
                      "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $data.newEvent.reminder.value = $event),
                      class: "reminder-value",
                      min: "0"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      vue.vModelText,
                      $data.newEvent.reminder.value,
                      void 0,
                      { number: true }
                    ]
                  ]),
                  vue.createElementVNode("picker", {
                    mode: "selector",
                    range: $data.reminderUnits,
                    onChange: _cache[10] || (_cache[10] = (...args) => $options.onReminderUnitChange && $options.onReminderUnitChange(...args)),
                    value: $data.selectedReminderUnitIndex
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "picker-selector" },
                      vue.toDisplayString($options.getReminderUnitLabel($data.newEvent.reminder.unit)),
                      1
                      /* TEXT */
                    )
                  ], 40, ["range", "value"])
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "描述:"),
                vue.withDirectives(vue.createElementVNode(
                  "textarea",
                  {
                    "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $data.editingEvent.description = $event),
                    placeholder: "输入描述"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.description]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "地点:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => $data.editingEvent.location = $event),
                    placeholder: "输入地点"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.location]
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "dialog-footer" }, [
              vue.createElementVNode("button", {
                onClick: _cache[13] || (_cache[13] = (...args) => $options.saveEvent && $options.saveEvent(...args))
              }, "保存"),
              vue.createElementVNode("button", {
                onClick: _cache[14] || (_cache[14] = (...args) => $options.cancelEdit && $options.cancelEdit(...args))
              }, "取消")
            ])
          ]))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 添加事件对话框 "),
      $data.showAddDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "dialog"
      }, [
        vue.createElementVNode("view", {
          class: "dialog-mask",
          onClick: _cache[15] || (_cache[15] = (...args) => $options.closeAddDialog && $options.closeAddDialog(...args))
        }),
        vue.createElementVNode("view", { class: "dialog-content" }, [
          vue.createElementVNode("view", { class: "dialog-header" }, [
            vue.createElementVNode("text", { class: "dialog-title" }, "添加事件")
          ]),
          vue.createElementVNode("view", { class: "dialog-body" }, [
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "标题:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => $data.newEvent.title = $event),
                  placeholder: "输入标题"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.title]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "开始时间:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => $data.newEvent.startTime = $event),
                  placeholder: "YYYY-MM-DD HH:mm"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.startTime]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "结束时间:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => $data.newEvent.endTime = $event),
                  placeholder: "YYYY-MM-DD HH:mm"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.endTime]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "提醒:"),
              vue.createElementVNode("view", { class: "reminder-selector" }, [
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    type: "number",
                    "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => $data.newEvent.reminder.value = $event),
                    class: "reminder-value",
                    min: "0"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    vue.vModelText,
                    $data.newEvent.reminder.value,
                    void 0,
                    { number: true }
                  ]
                ]),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: $data.reminderUnits,
                  onChange: _cache[20] || (_cache[20] = (...args) => $options.onReminderUnitChange && $options.onReminderUnitChange(...args)),
                  value: $data.selectedReminderUnitIndex
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-selector" },
                    vue.toDisplayString($options.getReminderUnitLabel($data.newEvent.reminder.unit)),
                    1
                    /* TEXT */
                  )
                ], 40, ["range", "value"])
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "描述:"),
              vue.withDirectives(vue.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => $data.newEvent.description = $event),
                  placeholder: "输入描述"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.description]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "地点:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => $data.newEvent.location = $event),
                  placeholder: "输入地点"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.location]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-footer" }, [
            vue.createElementVNode("button", {
              onClick: _cache[23] || (_cache[23] = (...args) => $options.addEvent && $options.addEvent(...args))
            }, "添加"),
            vue.createElementVNode("button", {
              onClick: _cache[24] || (_cache[24] = (...args) => $options.closeAddDialog && $options.closeAddDialog(...args))
            }, "取消")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const MonthView = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-dadfdaf7"], ["__file", "C:/Users/16691/Desktop/calendar/calendar-uniapp/components/MonthView.vue"]]);
  const _sfc_main$4 = {
    props: {
      events: {
        type: Array,
        default: () => []
      }
    },
    emits: ["refresh"],
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
        addDate: /* @__PURE__ */ new Date(),
        reminderUnits: [
          { label: "分钟", value: "m" },
          { label: "小时", value: "h" },
          { label: "天", value: "d" }
        ],
        selectedReminderUnitIndex: 0
      };
    },
    computed: {
      weekDates() {
        return getWeekDays(this.currentDate);
      },
      weekHeaders() {
        return this.weekDates.map((date) => ({
          name: ["日", "一", "二", "三", "四", "五", "六"][date.getDay()],
          date: `${date.getMonth() + 1}-${date.getDate()}`
        }));
      }
    },
    methods: {
      isToday,
      formatDate,
      formatRange() {
        const start = this.weekDates[0];
        const end = this.weekDates[6];
        return `${start.getFullYear()}年第${Math.ceil(start.getDate() / 7)}周 (${start.getMonth() + 1}.${start.getDate()} - ${end.getMonth() + 1}.${end.getDate()})`;
      },
      prevWeek() {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        this.currentDate = new Date(this.currentDate);
      },
      nextWeek() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.currentDate = new Date(this.currentDate);
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
        if (!dateTime)
          return "";
        const date = new Date(dateTime);
        if (isNaN(date.getTime()))
          return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      },
      cancelEdit() {
        this.isEditing = false;
      },
      async saveEvent() {
        try {
          const eventToSave = { ...this.editingEvent };
          const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
          if (eventToSave.startTime && !timeRegex.test(eventToSave.startTime)) {
            uni.showToast({ title: "开始时间格式不正确", icon: "none" });
            return;
          }
          if (eventToSave.endTime && !timeRegex.test(eventToSave.endTime)) {
            uni.showToast({ title: "结束时间格式不正确", icon: "none" });
            return;
          }
          await updateEvent(this.editingEvent._id, eventToSave);
          this.isEditing = false;
          this.dialogVisible = false;
          this.$emit("refresh");
          uni.showToast({ title: "更新成功" });
        } catch (err) {
          uni.showToast({ title: "更新失败", icon: "none" });
        }
      },
      handleDelete() {
        uni.showModal({
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
          await deleteEvent(this.selectedEvent._id);
          this.dialogVisible = false;
          this.$emit("refresh");
          uni.showToast({ title: "删除成功" });
        } catch (err) {
          uni.showToast({ title: "删除失败", icon: "none" });
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
          await addEvent(this.newEvent);
          this.showAddDialog = false;
          this.$emit("refresh");
          uni.showToast({ title: "添加成功" });
          scheduleSingleReminder(this.newEvent);
        } catch (err) {
          uni.showToast({ title: "添加失败", icon: "none" });
        }
      },
      getReminderUnitLabel(unit) {
        const units = {
          "m": "分钟",
          "h": "小时",
          "d": "天"
        };
        return units[unit] || "分钟";
      },
      onReminderUnitChange(e) {
        const selectedIndex = e.detail.value;
        this.newEvent.reminder.unit = this.reminderUnits[selectedIndex].value;
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b, _c, _d, _e, _f, _g;
    return vue.openBlock(), vue.createElementBlock("view", { class: "week-view" }, [
      vue.createCommentVNode(" 顶部导航 "),
      vue.createElementVNode("view", { class: "week-header-bar" }, [
        vue.createElementVNode("button", {
          class: "nav-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.prevWeek && $options.prevWeek(...args))
        }, "上周 ←"),
        vue.createElementVNode(
          "text",
          { class: "header-title" },
          vue.toDisplayString($options.formatRange()),
          1
          /* TEXT */
        ),
        vue.createElementVNode("button", {
          class: "nav-btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.nextWeek && $options.nextWeek(...args))
        }, "下周 →")
      ]),
      vue.createCommentVNode(" 星期标题 "),
      vue.createElementVNode("view", { class: "week-header" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.weekHeaders, (day, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "day-header"
            }, [
              vue.createElementVNode(
                "text",
                { class: "day-name" },
                vue.toDisplayString(day.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "day-date" },
                vue.toDisplayString(day.date),
                1
                /* TEXT */
              )
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 周日期格子 "),
      vue.createElementVNode("view", { class: "week-body" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.weekDates, (date, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["day-cell", { today: $options.isToday(date) }]),
              onDblclick: ($event) => $options.openAddDialog(date)
            }, [
              vue.createElementVNode(
                "view",
                { class: "date-label" },
                vue.toDisplayString(date.getDate()),
                1
                /* TEXT */
              ),
              vue.createCommentVNode(" 当天的事件 "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($options.getEventsByDate(date), (event) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: event._id,
                    class: "event-item",
                    onClick: ($event) => $options.openEvent(event)
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "event-time" },
                      vue.toDisplayString($options.formatTime(event.startTime)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "event-title" },
                      vue.toDisplayString(event.title),
                      1
                      /* TEXT */
                    )
                  ], 8, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 42, ["onDblclick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 查看 / 编辑 / 删除事件弹窗 "),
      $data.dialogVisible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "dialog"
      }, [
        vue.createElementVNode("view", {
          class: "dialog-mask",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.closeDialog && $options.closeDialog(...args))
        }),
        vue.createElementVNode("view", { class: "dialog-content" }, [
          !$data.isEditing ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
            vue.createElementVNode("view", { class: "dialog-header" }, [
              vue.createElementVNode("text", { class: "dialog-title" }, "事件详情")
            ]),
            vue.createElementVNode("view", { class: "dialog-body" }, [
              vue.createElementVNode("view", { class: "event-field" }, [
                vue.createElementVNode("text", { class: "field-label" }, "标题:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString((_a = $data.selectedEvent) == null ? void 0 : _a.title),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "event-field" }, [
                vue.createElementVNode("text", { class: "field-label" }, "开始时间:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($options.formatDate((_b = $data.selectedEvent) == null ? void 0 : _b.startTime)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "event-field" }, [
                vue.createElementVNode("text", { class: "field-label" }, "结束时间:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($options.formatDate((_c = $data.selectedEvent) == null ? void 0 : _c.endTime)),
                  1
                  /* TEXT */
                )
              ]),
              ((_d = $data.selectedEvent) == null ? void 0 : _d.description) ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "event-field"
              }, [
                vue.createElementVNode("text", { class: "field-label" }, "描述:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString((_e = $data.selectedEvent) == null ? void 0 : _e.description),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              ((_f = $data.selectedEvent) == null ? void 0 : _f.location) ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "event-field"
              }, [
                vue.createElementVNode("text", { class: "field-label" }, "地点:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString((_g = $data.selectedEvent) == null ? void 0 : _g.location),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("view", { class: "dialog-footer" }, [
              vue.createElementVNode("button", {
                onClick: _cache[3] || (_cache[3] = (...args) => $options.handleEdit && $options.handleEdit(...args))
              }, "编辑"),
              vue.createElementVNode("button", {
                onClick: _cache[4] || (_cache[4] = (...args) => $options.handleDelete && $options.handleDelete(...args))
              }, "删除"),
              vue.createElementVNode("button", {
                onClick: _cache[5] || (_cache[5] = (...args) => $options.closeDialog && $options.closeDialog(...args))
              }, "关闭")
            ])
          ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
            vue.createElementVNode("view", { class: "dialog-header" }, [
              vue.createElementVNode("text", { class: "dialog-title" }, "编辑事件")
            ]),
            vue.createElementVNode("view", { class: "dialog-body" }, [
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "标题:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.editingEvent.title = $event),
                    placeholder: "输入标题"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.title]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "开始时间:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.editingEvent.startTime = $event),
                    placeholder: "YYYY-MM-DD HH:mm"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.startTime]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "结束时间:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.editingEvent.endTime = $event),
                    placeholder: "YYYY-MM-DD HH:mm"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.endTime]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "提醒:"),
                vue.createElementVNode("view", { class: "reminder-selector" }, [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "number",
                      "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $data.newEvent.reminder.value = $event),
                      class: "reminder-value",
                      min: "0"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      vue.vModelText,
                      $data.newEvent.reminder.value,
                      void 0,
                      { number: true }
                    ]
                  ]),
                  vue.createElementVNode("picker", {
                    mode: "selector",
                    range: $data.reminderUnits,
                    onChange: _cache[10] || (_cache[10] = (...args) => $options.onReminderUnitChange && $options.onReminderUnitChange(...args)),
                    value: $data.selectedReminderUnitIndex
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "picker-selector" },
                      vue.toDisplayString($options.getReminderUnitLabel($data.newEvent.reminder.unit)),
                      1
                      /* TEXT */
                    )
                  ], 40, ["range", "value"])
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "描述:"),
                vue.withDirectives(vue.createElementVNode(
                  "textarea",
                  {
                    "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $data.editingEvent.description = $event),
                    placeholder: "输入描述"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.description]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "地点:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => $data.editingEvent.location = $event),
                    placeholder: "输入地点"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.location]
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "dialog-footer" }, [
              vue.createElementVNode("button", {
                onClick: _cache[13] || (_cache[13] = (...args) => $options.saveEvent && $options.saveEvent(...args))
              }, "保存"),
              vue.createElementVNode("button", {
                onClick: _cache[14] || (_cache[14] = (...args) => $options.cancelEdit && $options.cancelEdit(...args))
              }, "取消")
            ])
          ]))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 添加事件对话框 "),
      $data.showAddDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "dialog"
      }, [
        vue.createElementVNode("view", {
          class: "dialog-mask",
          onClick: _cache[15] || (_cache[15] = (...args) => $options.closeAddDialog && $options.closeAddDialog(...args))
        }),
        vue.createElementVNode("view", { class: "dialog-content" }, [
          vue.createElementVNode("view", { class: "dialog-header" }, [
            vue.createElementVNode("text", { class: "dialog-title" }, "添加事件")
          ]),
          vue.createElementVNode("view", { class: "dialog-body" }, [
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "标题:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => $data.newEvent.title = $event),
                  placeholder: "输入标题"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.title]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "开始时间:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => $data.newEvent.startTime = $event),
                  placeholder: "YYYY-MM-DD HH:mm"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.startTime]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "结束时间:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => $data.newEvent.endTime = $event),
                  placeholder: "YYYY-MM-DD HH:mm"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.endTime]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "提醒:"),
              vue.createElementVNode("view", { class: "reminder-selector" }, [
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    type: "number",
                    "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => $data.newEvent.reminder.value = $event),
                    class: "reminder-value",
                    min: "0"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    vue.vModelText,
                    $data.newEvent.reminder.value,
                    void 0,
                    { number: true }
                  ]
                ]),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: $data.reminderUnits,
                  onChange: _cache[20] || (_cache[20] = (...args) => $options.onReminderUnitChange && $options.onReminderUnitChange(...args)),
                  value: $data.selectedReminderUnitIndex
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-selector" },
                    vue.toDisplayString($options.getReminderUnitLabel($data.newEvent.reminder.unit)),
                    1
                    /* TEXT */
                  )
                ], 40, ["range", "value"])
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "描述:"),
              vue.withDirectives(vue.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => $data.newEvent.description = $event),
                  placeholder: "输入描述"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.description]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "地点:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => $data.newEvent.location = $event),
                  placeholder: "输入地点"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.location]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-footer" }, [
            vue.createElementVNode("button", {
              onClick: _cache[23] || (_cache[23] = (...args) => $options.addEvent && $options.addEvent(...args))
            }, "添加"),
            vue.createElementVNode("button", {
              onClick: _cache[24] || (_cache[24] = (...args) => $options.closeAddDialog && $options.closeAddDialog(...args))
            }, "取消")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const WeekView = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-93605eaa"], ["__file", "C:/Users/16691/Desktop/calendar/calendar-uniapp/components/WeekView.vue"]]);
  const _sfc_main$3 = {
    props: {
      events: {
        type: Array,
        default: () => []
      }
    },
    emits: ["refresh"],
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
        addDate: /* @__PURE__ */ new Date(),
        reminderUnitLabels: ["分钟", "小时", "天"]
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
        return this.events.filter((event) => {
          const eventStart = new Date(event.startTime);
          return eventStart >= start && eventStart < end;
        }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      },
      formatEventTime(event) {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        return `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}-${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
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
        if (!dateTime)
          return "";
        const date = new Date(dateTime);
        if (isNaN(date.getTime()))
          return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      },
      cancelEdit() {
        this.isEditing = false;
      },
      async saveEvent() {
        try {
          const eventToSave = { ...this.editingEvent };
          const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
          if (eventToSave.startTime && !timeRegex.test(eventToSave.startTime)) {
            uni.showToast({ title: "开始时间格式不正确", icon: "none" });
            return;
          }
          if (eventToSave.endTime && !timeRegex.test(eventToSave.endTime)) {
            uni.showToast({ title: "结束时间格式不正确", icon: "none" });
            return;
          }
          await updateEvent(this.editingEvent._id, eventToSave);
          this.isEditing = false;
          this.dialogVisible = false;
          this.$emit("refresh");
          uni.showToast({ title: "更新成功" });
        } catch (err) {
          uni.showToast({ title: "更新失败", icon: "none" });
        }
      },
      handleDelete() {
        uni.showModal({
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
          await deleteEvent(this.selectedEvent._id);
          this.dialogVisible = false;
          this.$emit("refresh");
          uni.showToast({ title: "删除成功" });
        } catch (err) {
          uni.showToast({ title: "删除失败", icon: "none" });
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
          await addEvent(this.newEvent);
          this.showAddDialog = false;
          this.$emit("refresh");
          uni.showToast({ title: "添加成功" });
          scheduleSingleReminder(this.newEvent);
        } catch (err) {
          uni.showToast({ title: "添加失败", icon: "none" });
        }
      },
      getReminderUnitLabel(unit) {
        const units = {
          "m": "分钟",
          "h": "小时",
          "d": "天"
        };
        return units[unit] || "分钟";
      },
      getReminderUnitIndex(unit) {
        const units = {
          "m": 0,
          "h": 1,
          "d": 2
        };
        return units[unit] || 0;
      },
      onReminderUnitChange(e) {
        const selectedIndex = e.detail.value;
        const unitMap = ["m", "h", "d"];
        this.newEvent.reminder.unit = unitMap[selectedIndex];
      },
      onEditReminderUnitChange(e) {
        const selectedIndex = e.detail.value;
        const unitMap = ["m", "h", "d"];
        this.editingEvent.reminder.unit = unitMap[selectedIndex];
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b, _c, _d, _e, _f, _g;
    return vue.openBlock(), vue.createElementBlock("view", { class: "day-view" }, [
      vue.createCommentVNode(" 顶部日期导航 "),
      vue.createCommentVNode(" 顶部日期导航 "),
      vue.createElementVNode("view", { class: "day-header-bar" }, [
        vue.createElementVNode("button", {
          class: "nav-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.prevDay && $options.prevDay(...args))
        }, "← 昨天"),
        vue.createElementVNode(
          "text",
          { class: "header-title" },
          vue.toDisplayString($options.formatDate($data.currentDate, "YYYY年MM月DD日 dddd")),
          1
          /* TEXT */
        ),
        vue.createElementVNode("button", {
          class: "nav-btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.nextDay && $options.nextDay(...args))
        }, "明天 →")
      ]),
      vue.createCommentVNode(" 事件列表 "),
      vue.createElementVNode(
        "view",
        {
          class: "day-body",
          onDblclick: _cache[2] || (_cache[2] = ($event) => $options.openAddDialog($data.currentDate))
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.getEventsByDate($data.currentDate), (event) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: event._id,
                class: "event-item",
                onClick: ($event) => $options.openEvent(event)
              }, [
                vue.createElementVNode("view", { class: "event-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "event-time" },
                    vue.toDisplayString($options.formatEventTime(event)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "event-title" },
                    vue.toDisplayString(event.title),
                    1
                    /* TEXT */
                  )
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        32
        /* NEED_HYDRATION */
      ),
      vue.createCommentVNode(" 查看 / 编辑 / 删除事件弹窗 "),
      $data.dialogVisible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "dialog"
      }, [
        vue.createElementVNode("view", {
          class: "dialog-mask",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.closeDialog && $options.closeDialog(...args))
        }),
        vue.createElementVNode("view", { class: "dialog-content" }, [
          !$data.isEditing ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
            vue.createElementVNode("view", { class: "dialog-header" }, [
              vue.createElementVNode("text", { class: "dialog-title" }, "事件详情")
            ]),
            vue.createElementVNode("view", { class: "dialog-body" }, [
              vue.createElementVNode("view", { class: "event-field" }, [
                vue.createElementVNode("text", { class: "field-label" }, "标题:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString((_a = $data.selectedEvent) == null ? void 0 : _a.title),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "event-field" }, [
                vue.createElementVNode("text", { class: "field-label" }, "开始时间:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($options.formatDate((_b = $data.selectedEvent) == null ? void 0 : _b.startTime)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "event-field" }, [
                vue.createElementVNode("text", { class: "field-label" }, "结束时间:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($options.formatDate((_c = $data.selectedEvent) == null ? void 0 : _c.endTime)),
                  1
                  /* TEXT */
                )
              ]),
              ((_d = $data.selectedEvent) == null ? void 0 : _d.description) ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "event-field"
              }, [
                vue.createElementVNode("text", { class: "field-label" }, "描述:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString((_e = $data.selectedEvent) == null ? void 0 : _e.description),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              ((_f = $data.selectedEvent) == null ? void 0 : _f.location) ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "event-field"
              }, [
                vue.createElementVNode("text", { class: "field-label" }, "地点:"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString((_g = $data.selectedEvent) == null ? void 0 : _g.location),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("view", { class: "dialog-footer" }, [
              vue.createElementVNode("button", {
                onClick: _cache[4] || (_cache[4] = (...args) => $options.handleEdit && $options.handleEdit(...args))
              }, "编辑"),
              vue.createElementVNode("button", {
                onClick: _cache[5] || (_cache[5] = (...args) => $options.handleDelete && $options.handleDelete(...args))
              }, "删除"),
              vue.createElementVNode("button", {
                onClick: _cache[6] || (_cache[6] = (...args) => $options.closeDialog && $options.closeDialog(...args))
              }, "关闭")
            ])
          ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
            vue.createElementVNode("view", { class: "dialog-header" }, [
              vue.createElementVNode("text", { class: "dialog-title" }, "编辑事件")
            ]),
            vue.createElementVNode("view", { class: "dialog-body" }, [
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "标题:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.editingEvent.title = $event),
                    placeholder: "输入标题"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.title]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "开始时间:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.editingEvent.startTime = $event),
                    placeholder: "YYYY-MM-DD HH:mm"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.startTime]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "结束时间:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $data.editingEvent.endTime = $event),
                    placeholder: "YYYY-MM-DD HH:mm"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.endTime]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "提醒:"),
                vue.createElementVNode("view", { class: "reminder-selector" }, [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "number",
                      "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $data.editingEvent.reminder.value = $event),
                      class: "reminder-value",
                      min: "0"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      vue.vModelText,
                      $data.editingEvent.reminder.value,
                      void 0,
                      { number: true }
                    ]
                  ]),
                  vue.createElementVNode("picker", {
                    mode: "selector",
                    range: $data.reminderUnitLabels,
                    onChange: _cache[11] || (_cache[11] = (...args) => $options.onEditReminderUnitChange && $options.onEditReminderUnitChange(...args)),
                    value: $options.getReminderUnitIndex($data.editingEvent.reminder.unit)
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "picker-selector" },
                      vue.toDisplayString($options.getReminderUnitLabel($data.editingEvent.reminder.unit)),
                      1
                      /* TEXT */
                    )
                  ], 40, ["range", "value"])
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "描述:"),
                vue.withDirectives(vue.createElementVNode(
                  "textarea",
                  {
                    "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => $data.editingEvent.description = $event),
                    placeholder: "输入描述"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.description]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("label", null, "地点:"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => $data.editingEvent.location = $event),
                    placeholder: "输入地点"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editingEvent.location]
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "dialog-footer" }, [
              vue.createElementVNode("button", {
                onClick: _cache[14] || (_cache[14] = (...args) => $options.saveEvent && $options.saveEvent(...args))
              }, "保存"),
              vue.createElementVNode("button", {
                onClick: _cache[15] || (_cache[15] = (...args) => $options.cancelEdit && $options.cancelEdit(...args))
              }, "取消")
            ])
          ]))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 添加事件对话框 "),
      $data.showAddDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "dialog"
      }, [
        vue.createElementVNode("view", {
          class: "dialog-mask",
          onClick: _cache[16] || (_cache[16] = (...args) => $options.closeAddDialog && $options.closeAddDialog(...args))
        }),
        vue.createElementVNode("view", { class: "dialog-content" }, [
          vue.createElementVNode("view", { class: "dialog-header" }, [
            vue.createElementVNode("text", { class: "dialog-title" }, "添加事件")
          ]),
          vue.createElementVNode("view", { class: "dialog-body" }, [
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "标题:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => $data.newEvent.title = $event),
                  placeholder: "输入标题"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.title]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "开始时间:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => $data.newEvent.startTime = $event),
                  placeholder: "YYYY-MM-DD HH:mm"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.startTime]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "结束时间:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => $data.newEvent.endTime = $event),
                  placeholder: "YYYY-MM-DD HH:mm"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.endTime]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "提醒:"),
              vue.createElementVNode("view", { class: "reminder-selector" }, [
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    type: "number",
                    "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => $data.newEvent.reminder.value = $event),
                    class: "reminder-value",
                    min: "0"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [
                    vue.vModelText,
                    $data.newEvent.reminder.value,
                    void 0,
                    { number: true }
                  ]
                ]),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: $data.reminderUnitLabels,
                  onChange: _cache[21] || (_cache[21] = (...args) => $options.onReminderUnitChange && $options.onReminderUnitChange(...args)),
                  value: $options.getReminderUnitIndex($data.newEvent.reminder.unit)
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-selector" },
                    vue.toDisplayString($options.getReminderUnitLabel($data.newEvent.reminder.unit)),
                    1
                    /* TEXT */
                  )
                ], 40, ["range", "value"])
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "描述:"),
              vue.withDirectives(vue.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => $data.newEvent.description = $event),
                  placeholder: "输入描述"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.description]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", null, "地点:"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => $data.newEvent.location = $event),
                  placeholder: "输入地点"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newEvent.location]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "dialog-footer" }, [
            vue.createElementVNode("button", {
              onClick: _cache[24] || (_cache[24] = (...args) => $options.addEvent && $options.addEvent(...args))
            }, "添加"),
            vue.createElementVNode("button", {
              onClick: _cache[25] || (_cache[25] = (...args) => $options.closeAddDialog && $options.closeAddDialog(...args))
            }, "取消")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const DayView = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-df71777b"], ["__file", "C:/Users/16691/Desktop/calendar/calendar-uniapp/components/DayView.vue"]]);
  const _sfc_main$2 = {
    components: {
      MonthView,
      WeekView,
      DayView
    },
    data() {
      return {
        viewMode: "month",
        events: [],
        viewOptions: ["月视图", "周视图", "日视图"]
      };
    },
    computed: {
      currentViewLabel() {
        const labels = { month: "月视图", week: "周视图", day: "日视图" };
        return labels[this.viewMode];
      }
    },
    onLoad() {
      this.loadEvents();
    },
    methods: {
      onViewChange(e) {
        const views = ["month", "week", "day"];
        this.viewMode = views[e.detail.value];
      },
      async loadEvents() {
        try {
          const response = await getEvents();
          this.events = response.data || [];
        } catch (err) {
          formatAppLog("error", "at pages/calendar/calendar.vue:66", "加载日程失败：", err);
          uni.showToast({
            title: "加载日程失败",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_MonthView = vue.resolveComponent("MonthView");
    const _component_WeekView = vue.resolveComponent("WeekView");
    const _component_DayView = vue.resolveComponent("DayView");
    return vue.openBlock(), vue.createElementBlock("view", { class: "calendar-container" }, [
      vue.createCommentVNode(" 视图切换 "),
      vue.createElementVNode("view", { class: "view-selector" }, [
        vue.createElementVNode("picker", {
          mode: "selector",
          range: $data.viewOptions,
          onChange: _cache[0] || (_cache[0] = (...args) => $options.onViewChange && $options.onViewChange(...args))
        }, [
          vue.createElementVNode(
            "view",
            { class: "picker-label" },
            vue.toDisplayString($options.currentViewLabel) + " ▼",
            1
            /* TEXT */
          )
        ], 40, ["range"])
      ]),
      vue.createCommentVNode(" 月视图 "),
      $data.viewMode === "month" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
        vue.createVNode(_component_MonthView, {
          events: $data.events,
          onRefresh: $options.loadEvents
        }, null, 8, ["events", "onRefresh"])
      ])) : $data.viewMode === "week" ? (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 周视图 "),
          vue.createElementVNode("view", null, [
            vue.createVNode(_component_WeekView, {
              events: $data.events,
              onRefresh: $options.loadEvents
            }, null, 8, ["events", "onRefresh"])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 2 },
        [
          vue.createCommentVNode(" 日视图 "),
          vue.createElementVNode("view", null, [
            vue.createVNode(_component_DayView, {
              events: $data.events,
              onRefresh: $options.loadEvents
            }, null, 8, ["events", "onRefresh"])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const PagesCalendarCalendar = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-6e8913ab"], ["__file", "C:/Users/16691/Desktop/calendar/calendar-uniapp/pages/calendar/calendar.vue"]]);
  const _imports_0 = "/static/logo.png";
  const _sfc_main$1 = {
    data() {
      return {
        title: "日历应用"
      };
    },
    onLoad() {
    },
    methods: {
      goToCalendar() {
        uni.navigateTo({
          url: "/pages/calendar/calendar"
        });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("image", {
        class: "logo",
        src: _imports_0
      }),
      vue.createElementVNode("view", { class: "text-area" }, [
        vue.createElementVNode("text", { class: "title" }, "欢迎使用日历应用")
      ]),
      vue.createElementVNode("button", {
        class: "navigate-btn",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.goToCalendar && $options.goToCalendar(...args))
      }, "进入日历")
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "C:/Users/16691/Desktop/calendar/calendar-uniapp/pages/index/index.vue"]]);
  __definePage("pages/calendar/calendar", PagesCalendarCalendar);
  __definePage("pages/index/index", PagesIndexIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/16691/Desktop/calendar/calendar-uniapp/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
