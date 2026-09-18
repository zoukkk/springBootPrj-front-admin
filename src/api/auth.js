import request from '@/utils/request'

class AuthApi {
  static login(data) {
    return request({
      url: '/auth/login',
      method: 'post',
      data,
    })
  }

  static register(data) {
    return request({
      url: '/auth/register',
      method: 'post',
      data,
    })
  }

  static getUserInfo() {
    return request({
      url: '/auth/userinfo',
      method: 'get',
    })
  }

  static getMenus() {
    return request({
      url: '/auth/menus',
      method: 'get',
    })
  }

  static logout() {
    return request({
      url: '/auth/logout',
      method: 'post',
    })
  }
}

export default AuthApi
