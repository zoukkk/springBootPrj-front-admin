<script setup>
import { Document, FolderOpened, Lightning, TrendCharts, User } from '@element-plus/icons-vue'

const stats = [
  { label: '文章总数', value: '128', note: '较昨日 +12', icon: Document, tone: 'blue' },
  { label: '已发布', value: '96', note: '较昨日 +8', icon: Lightning, tone: 'green' },
  { label: '文章分类', value: '12', note: '较昨日 +2', icon: FolderOpened, tone: 'orange' },
  { label: '活跃用户', value: '38', note: '较昨日 +5', icon: User, tone: 'purple' },
]
const activities = [
  ['发布了文章', 'Vue 3 组合式 API 入门', '10:24'],
  ['更新了分类', '前端工程化', '昨天'],
  ['保存了草稿', 'Spring Boot 部署笔记', '昨天'],
]
const bars = [42, 63, 47, 76, 58, 88, 69]
</script>

<template>
  <section class="dashboard">
    <section class="welcome-banner"><div><span>WELCOME BACK</span><h1>下午好，管理员</h1><p>今天是适合整理内容与推进发布计划的一天。</p></div><div class="soy-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></div></section>
    <section class="stat-grid" aria-label="内容统计"><article v-for="item in stats" :key="item.label" :class="['stat-card', item.tone]"><span class="stat-icon"><el-icon><component :is="item.icon" /></el-icon></span><div><span class="stat-label">{{ item.label }}</span><strong>{{ item.value }}</strong><small>{{ item.note }}</small></div></article></section>
    <div class="dashboard-grid">
      <section class="dashboard-section" aria-labelledby="trend-title"><div class="section-title-row"><h2 id="trend-title">内容趋势</h2><el-select model-value="本周" size="small" class="chart-select"><el-option label="本周" value="本周" /></el-select></div><div class="chart-area"><span v-for="height in bars" :key="height" :style="{ height: `${height}%` }"></span></div><div class="chart-axis"><i>周一</i><i>周二</i><i>周三</i><i>周四</i><i>周五</i><i>周六</i><i>周日</i></div></section>
      <section class="dashboard-section" aria-labelledby="activity-title"><div class="section-title-row"><h2 id="activity-title">最近动态</h2><el-icon><TrendCharts /></el-icon></div><ol class="activity-list"><li v-for="row in activities" :key="row[1]"><span></span><div><strong>{{ row[0] }}</strong><p>{{ row[1] }}</p></div><time>{{ row[2] }}</time></li></ol></section>
    </div>
  </section>
</template>

<style scoped>
.dashboard { min-height:100%; }.welcome-banner { display:flex; align-items:center; justify-content:space-between; min-height:142px; padding:25px 34px; overflow:hidden; color:#fff; background:linear-gradient(100deg,#4b70ee,#8069f3 62%,#a45dea); border-radius:7px; }.welcome-banner > div:first-child { position:relative; z-index:1; }.welcome-banner span { color:rgba(255,255,255,.72); font-size:10px; font-weight:700; letter-spacing:1.4px; }.welcome-banner h1 { margin:6px 0; font-family:"Space Grotesk",sans-serif; font-size:26px; line-height:32px; }.welcome-banner p { margin:0; color:rgba(255,255,255,.82); font-size:13px; }.soy-mark { display:grid; grid-template-columns:repeat(2,36px); gap:7px; margin-right:6%; transform:rotate(22deg); }.soy-mark i { width:36px; height:36px; background:rgba(255,255,255,.92); border-radius:7px; }.soy-mark i:nth-child(2),.soy-mark i:nth-child(3){background:rgba(255,255,255,.36)}.soy-mark i:nth-child(4){background:#bdf7e6}
.stat-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; margin-top:18px; }.stat-card { display:flex; gap:14px; min-height:110px; padding:18px; color:#fff; overflow:hidden; border-radius:7px; }.stat-card.blue{background:#4b79f4}.stat-card.green{background:#32b99c}.stat-card.orange{background:#e89a45}.stat-card.purple{background:#896ae9}.stat-icon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;background:rgba(255,255,255,.2);border-radius:7px}.stat-icon .el-icon{font-size:20px}.stat-label{display:block;color:rgba(255,255,255,.82);font-size:13px}.stat-card strong{display:block;margin-top:2px;font-family:"Space Grotesk",sans-serif;font-size:28px;font-weight:700;line-height:34px}.stat-card small{display:block;margin-top:3px;color:rgba(255,255,255,.74);font-size:11px}
.dashboard-grid { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(280px,.9fr); gap:16px; margin-top:16px; }.dashboard-section{padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:7px}.section-title-row{display:flex;align-items:center;justify-content:space-between}.section-title-row h2{margin:0;color:var(--text);font-family:"Space Grotesk",sans-serif;font-size:16px}.section-title-row .el-icon{color:#8b98ab;font-size:18px}.chart-select{width:80px}.chart-area{display:flex;align-items:end;justify-content:space-around;height:190px;padding:20px 10px 0;margin-top:10px;background:repeating-linear-gradient(to bottom,transparent 0,transparent 46px,#edf1f7 47px)}.chart-area span{width:28px;max-width:9%;min-height:18px;background:linear-gradient(to top,#5b76f6,#8da8ff);border-radius:4px 4px 0 0}.chart-axis{display:flex;justify-content:space-around;padding:9px 10px 0;color:var(--text-tertiary);font-size:11px}.chart-axis i{font-style:normal}.activity-list{padding:0;margin:4px 0 0;list-style:none}.activity-list li{display:flex;align-items:flex-start;gap:10px;padding:14px 0;border-bottom:1px solid var(--divider)}.activity-list li:last-child{border:0}.activity-list li>span{width:7px;height:7px;flex:0 0 auto;margin-top:7px;background:#7666f6;border-radius:50%;box-shadow:0 0 0 4px #eeeaff}.activity-list li>div{min-width:0}.activity-list strong{color:var(--text);font-size:13px;font-weight:600;line-height:20px}.activity-list p{margin:2px 0 0;color:var(--text-secondary);font-size:12px;line-height:19px}.activity-list time{flex:0 0 auto;margin-left:auto;color:var(--text-tertiary);font-size:11px;line-height:20px}
@media (max-width:1024px){.stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-grid{grid-template-columns:1fr}}@media (max-width:480px){.welcome-banner{padding:23px}.soy-mark{display:none}.stat-grid{grid-template-columns:1fr}.chart-area{height:160px}}
</style>
