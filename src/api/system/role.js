import request from '@/utils/request'

class RoleApi {
  static getRoleList(params) {
    return request({
      url: '/roles/list',
      method: 'get',
      params,
    })
  }

  static getAllRoles() {
    return request({
      url: '/roles/all',
      method: 'get',
    })
  }

  static getRoleDetail(id) {
    return request({
      url: `/roles/detail/${id}`,
      method: 'get',
    })
  }

  static createRole(data) {
    return request({
      url: '/roles/add',
      method: 'post',
      data,
    })
  }

  static updateRole(data) {
    return request({
      url: '/roles/edit',
      method: 'put',
      data,
    })
  }

  static deleteRole(id) {
    return request({
      url: '/roles/delete',
      method: 'delete',
      params: { id },
    })
  }

  static getRoleMenuIds(id) {
    return request({
      url: `/roles/menus/${id}`,
      method: 'get',
    })
  }

  static saveRoleMenus(data) {
    return request({
      url: '/roles/saveMenus',
      method: 'put',
      data,
    })
  }
}

export default RoleApi
