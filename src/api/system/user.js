import request from '@/utils/request'

class UserApi {
  static getUserList(params) {
    return request({
      url: '/users/list',
      method: 'get',
      params,
    })
  }

  static getUserDetail(id) {
    return request({
      url: `/users/detail/${id}`,
      method: 'get',
    })
  }

  static createUser(data) {
    return request({
      url: '/users/add',
      method: 'post',
      data,
    })
  }

  static updateUser(id, data) {
    return request({
      url: `/users/edit/${id}`,
      method: 'put',
      data,
    })
  }

  static deleteUser(id) {
    return request({
      url: `/users/delete/${id}`,
      method: 'delete',
    })
  }

  static resetUserPassword(id, data) {
    return request({
      url: `/users/password/${id}`,
      method: 'put',
      data,
    })
  }
}

export default UserApi
