"use strict";
const utils_request = require("../utils/request.js");
function getEvents(params) {
  return utils_request.request({
    url: "/events",
    method: "get",
    params
  });
}
function addEvent(data) {
  return utils_request.request({
    url: "/events",
    method: "post",
    data
  });
}
function updateEvent(id, data) {
  return utils_request.request({
    url: `/events/${id}`,
    method: "put",
    data
  });
}
function deleteEvent(id) {
  return utils_request.request({
    url: `/events/${id}`,
    method: "delete"
  });
}
exports.addEvent = addEvent;
exports.deleteEvent = deleteEvent;
exports.getEvents = getEvents;
exports.updateEvent = updateEvent;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/event.js.map
