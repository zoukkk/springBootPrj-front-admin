const POSITION_LABELS = {
  Fighter: '战士',
  Tank: '坦克',
  Mage: '法师',
  Assassin: '刺客',
  Marksman: '射手',
  Support: '辅助',
}

export function getChampionPosition(tags = []) {
  return tags.map((tag) => POSITION_LABELS[tag] || tag).join(' / ') || '-'
}
