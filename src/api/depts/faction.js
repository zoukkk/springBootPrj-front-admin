import request from '@/utils/request'

class FactionApi {
  static getFactionTree(params) {
    return request({
      url: '/factions/list',
      method: 'get',
      params,
    })
  }

  static getFactionDetail(id) {
    return request({
      url: `/factions/detail/${id}`,
      method: 'get',
    })
  }

  static createFaction(data) {
    return request({
      url: '/factions/add',
      method: 'post',
      data,
    })
  }

  static updateFaction(id, data) {
    return request({
      url: `/factions/edit/${id}`,
      method: 'put',
      data,
    })
  }

  static deleteFaction(id) {
    return request({
      url: `/factions/delete/${id}`,
      method: 'delete',
    })
  }

  static getDeletedFactions(params) {
    return request({
      url: '/factions/deleted-list',
      method: 'get',
      params,
    })
  }

  static restoreFaction(id) {
    return request({
      url: `/factions/restore/${id}`,
      method: 'put',
    })
  }

  static updateFactionStatus(id, data) {
    return request({
      url: `/factions/status/${id}`,
      method: 'put',
      data,
    })
  }
}

export default FactionApi
