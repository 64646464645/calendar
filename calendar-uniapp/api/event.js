// src/api/event.js
import request from "../utils/request.js"

export function getEvents(params) {
  return request({
    url: "/events",
    method: "get",
    params,
  })
}

// 新增事件
export function addEvent(data) {
  return request({
    url: "/events",
    method: "post",
    data,
  })
}

// 更新事件
export function updateEvent(id, data) {
  return request({
    url: `/events/${id}`,
    method: "put",
    data,
  })
}

// 删除事件
export function deleteEvent(id) {
  return request({
    url: `/events/${id}`,
    method: "delete",
  })
}