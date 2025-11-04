// uniapp版本的请求模块
import config from './config.js'

function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: config.baseURL + options.url,
      method: options.method || 'GET',
      data: options.data || options.params,
      success: (res) => {
        // 模拟原来axios的响应结构
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.errMsg || 'Request failed'}`));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || err.message || 'Network error'));
      }
    });
  });
}

// 添加各种HTTP方法的便捷函数
request.get = (url, params) => request({ url, method: 'GET', params });
request.post = (url, data) => request({ url, method: 'POST', data });
request.put = (url, data) => request({ url, method: 'PUT', data });
request.delete = (url) => request({ url, method: 'DELETE' });

export default request;