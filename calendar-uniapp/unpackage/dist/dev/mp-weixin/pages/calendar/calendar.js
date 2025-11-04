"use strict";
const common_vendor = require("../../common/vendor.js");
const api_event = require("../../api/event.js");
const MonthView = () => "../../components/MonthView.js";
const WeekView = () => "../../components/WeekView.js";
const DayView = () => "../../components/DayView.js";
const _sfc_main = {
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
        const data = await api_event.getEvents();
        this.events = data;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/calendar/calendar.vue:65", "加载日程失败：", err);
        common_vendor.index.showToast({
          title: "加载日程失败",
          icon: "none"
        });
      }
    }
  }
};
if (!Array) {
  const _component_MonthView = common_vendor.resolveComponent("MonthView");
  const _component_WeekView = common_vendor.resolveComponent("WeekView");
  const _component_DayView = common_vendor.resolveComponent("DayView");
  (_component_MonthView + _component_WeekView + _component_DayView)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.currentViewLabel),
    b: $data.viewOptions,
    c: common_vendor.o((...args) => $options.onViewChange && $options.onViewChange(...args)),
    d: $data.viewMode === "month"
  }, $data.viewMode === "month" ? {
    e: common_vendor.o($options.loadEvents),
    f: common_vendor.p({
      events: $data.events
    })
  } : $data.viewMode === "week" ? {
    h: common_vendor.o($options.loadEvents),
    i: common_vendor.p({
      events: $data.events
    })
  } : {
    j: common_vendor.o($options.loadEvents),
    k: common_vendor.p({
      events: $data.events
    })
  }, {
    g: $data.viewMode === "week"
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6e8913ab"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/calendar/calendar.js.map
