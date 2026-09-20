<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const dialog = ref(false);
const saving = ref(false);
const profile = reactive({
  nickname: authStore.userInfo?.nickname || "",
  email: "",
  userPic: "",
});

async function save() {
  saving.value = true;
  try {
    dialog.value = false;
    ElMessage.success("个人资料已保存");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="page-panel">
    <div class="page-heading">
      <div>
        <h1>用户管理</h1>
        <p>维护当1前登录账号的个人资料</p>
      </div>
      <el-button type="primary" @click="dialog = true">编辑资料</el-button>
    </div>
    <section class="profile-section" aria-labelledby="profile-title">
      <h2 id="profile-title" class="section-heading">个人资料</h2>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">{{
          authStore.userInfo?.username || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ profile.nickname }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ profile.email }}</el-descriptions-item>
        <el-descriptions-item label="账号状态"
          ><el-tag class="status-tag published">正常</el-tag></el-descriptions-item
        >
      </el-descriptions>
    </section>
    <el-dialog
      v-model="dialog"
      title="编辑个人资料"
      width="460px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top"
        ><el-form-item label="昵称" required
          ><el-input v-model="profile.nickname" placeholder="请输入昵称" /></el-form-item
        ><el-form-item label="邮箱"
          ><el-input
            v-model="profile.email"
            type="email"
            placeholder="请输入邮箱地址" /></el-form-item
        ><el-form-item label="头像地址"
          ><el-input v-model="profile.userPic" placeholder="请输入头像链接" />
          <p class="field-help">
            可在后续接入上传接口后，直接使用上传后的图片链接。
          </p></el-form-item
        ></el-form
      >
      <template #footer
        ><el-button @click="dialog = false">取消</el-button
        ><el-button type="primary" :loading="saving" @click="save"
          >保存</el-button
        ></template
      >
    </el-dialog>
  </section>
</template>

<style scoped>
.profile-section {
  max-width: 760px;
}
.profile-section :deep(.el-descriptions__table) {
  border-color: var(--border);
}
.profile-section :deep(.el-descriptions__label.el-descriptions__cell) {
  width: 160px;
  color: var(--text-secondary);
  font-weight: 500;
  background: var(--surface-subtle);
}
.profile-section :deep(.el-descriptions__content.el-descriptions__cell) {
  color: var(--text);
  background: var(--surface);
}
.profile-section :deep(.el-descriptions__cell) {
  padding: 14px 16px;
  border-color: var(--border);
}
@media (max-width: 760px) {
  .profile-section :deep(.el-descriptions__label.el-descriptions__cell) {
    width: 116px;
  }
}
</style>
