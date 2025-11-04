"use strict";
const common_vendor = require("../common/vendor.js");
function request(options) {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: (process.env.VITE_BASE_API || "http://localhost:3000/api") + options.url,
      method: options.method || "GET",
      data: options.data || options.params,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(res.errMsg));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
request.get = (url, params) => request({ url, method: "GET", params });
request.post = (url, data) => request({ url, method: "POST", data });
request.put = (url, data) => request({ url, method: "PUT", data });
request.delete = (url) => request({ url, method: "DELETE" });
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
