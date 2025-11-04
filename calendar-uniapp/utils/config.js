// 网络请求配置文件

// 根据不同平台设置不同的基础URL
const getConfig = () => {

  // #ifdef APP-PLUS
  // App 平台需要使用本机IP地址而不是 localhost
  return {
    baseURL: 'http://10.21.65.206:3000/api'
  }

}

export default getConfig();