import request from '@/utils/request'

class PositionApi {
  static getPositionList(params) {
    return request({
      url: '/positions/list',
      method: 'get',
      params,
    })
  }

  // Shared by future employee forms and other position selectors.
  static getAllPositions() {
    return request({
      url: '/positions/all',
      method: 'get',
    })
  }

  static getPositionDetail(id) {
    return request({
      url: `/positions/detail/${id}`,
      method: 'get',
    })
  }

  static createPosition(data) {
    return request({
      url: '/positions/add',
      method: 'post',
      data,
    })
  }

  static updatePosition(data) {
    return request({
      url: '/positions/edit',
      method: 'put',
      data,
    })
  }

  static deletePosition(id) {
    return request({
      url: `/positions/delete/${id}`,
      method: 'delete',
    })
  }
}

export default PositionApi
