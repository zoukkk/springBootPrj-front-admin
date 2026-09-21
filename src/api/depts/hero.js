import request from '@/utils/request'

class HeroApi {
  static getHeroList(params) {
    return request({
      url: '/heroes/list',
      method: 'get',
      params,
    })
  }

  static getHeroDetail(id) {
    return request({
      url: `/heroes/detail/${id}`,
      method: 'get',
    })
  }

  static createHero(data) {
    return request({
      url: '/heroes/add',
      method: 'post',
      data,
    })
  }

  static updateHero(id, data) {
    return request({
      url: `/heroes/edit/${id}`,
      method: 'put',
      data,
    })
  }

  static deleteHero(id) {
    return request({
      url: `/heroes/delete/${id}`,
      method: 'delete',
    })
  }

  static assignHero(id, data) {
    return request({
      url: `/heroes/assign/${id}`,
      method: 'put',
      data,
    })
  }

  static removeHero(id) {
    return request({
      url: `/heroes/remove/${id}`,
      method: 'put',
    })
  }

  static updateHeroStatus(id, status) {
    return request({
      url: `/heroes/status/${id}`,
      method: 'put',
      data: { status },
    })
  }
}

export default HeroApi
