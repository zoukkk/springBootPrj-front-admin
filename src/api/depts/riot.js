import request from '@/utils/request'

const catalogCache = new Map()
const detailCache = new Map()

function getDataDragon(url) {
  return request({
    url,
    method: 'get',
    skipAuth: true,
    rawResponse: true,
    skipErrorMessage: true,
  })
}

class RiotApi {
  static getChampionCatalog(version) {
    if (!version) return Promise.resolve({})
    if (!catalogCache.has(version)) {
      const task = getDataDragon(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/zh_CN/champion.json`,
      )
        .then((result) => result?.data || {})
        .catch(() => ({}))
      catalogCache.set(version, task)
    }
    return catalogCache.get(version)
  }

  static getChampionDetail(version, championId) {
    if (!version || !championId) return Promise.resolve(null)
    const cacheKey = `${version}:${championId}`
    if (!detailCache.has(cacheKey)) {
      const task = getDataDragon(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/zh_CN/champion/${championId}.json`,
      )
        .then((result) => result?.data?.[championId] || null)
        .catch(() => null)
      detailCache.set(cacheKey, task)
    }
    return detailCache.get(cacheKey)
  }
}

export default RiotApi
