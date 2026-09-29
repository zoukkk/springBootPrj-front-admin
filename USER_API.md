# 用户管理 API

更新日期：2026-09-24

用户管理页面位于 `/user`，组件映射为 `src/views/system/user/index.vue`。所有请求复用 `src/utils/request.js`，携带 `Authorization: Bearer <token>`，响应统一为 `Result<T> { code, message, data }`，成功时 `code=0`。

## 接口

| 方法 | 路径 | 前端用途 |
| --- | --- | --- |
| GET | `/api/users/list` | 分页列表，参数 `username`、`nickname`、`status`、`pageNum`、`pageSize`；每条记录包含 `roles` 和 `roleIds` |
| GET | `/api/users/detail/{id}` | 编辑回显，包含角色关联 |
| POST | `/api/users/add` | 新增用户并分配角色，密码由服务端 BCrypt 加密 |
| PUT | `/api/users/edit/{id}` | 编辑昵称、邮箱、手机号、状态和角色；不会提交或更新密码 |
| DELETE | `/api/users/delete/{id}` | 软删除用户及 `sys_user_role` 关联 |
| PUT | `/api/users/password/{id}` | 管理员重置密码，前端仅提交确认后的新密码 |
| GET | `/api/roles/all` | 加载启用角色供多选下拉使用；角色包含 `isSuperAdmin` |

## 请求约束

新增请求：

```json
{
  "username": "tom",
  "password": "123456",
  "nickname": "汤姆",
  "email": "tom@example.com",
  "phone": "13800000000",
  "status": 1,
  "roleIds": [2]
}
```

编辑请求不含 `password`：

```json
{
  "username": "tom",
  "nickname": "汤姆·里德尔",
  "email": "tom@example.com",
  "phone": "13800000000",
  "status": 1,
  "roleIds": [2, 3]
}
```

密码长度为 6-32 位。用户名由前端通过列表接口预校验，并由服务端以忽略大小写的唯一约束最终保证。用户响应禁止包含明文密码或 BCrypt 哈希。

## 数据库设计

认证模块继续使用 `sys_user`，增加/确认以下字段：

```sql
CREATE TABLE IF NOT EXISTS sys_user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  nickname TEXT,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  create_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  del_flag INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sys_user_username_ci
  ON sys_user(lower(username));

CREATE TABLE IF NOT EXISTS sys_user_role (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  create_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  del_flag INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_sys_user_role_user
  ON sys_user_role(user_id);
```

删除用户时将用户与关联记录的 `del_flag` 置为 `1`；角色权限仍由角色管理维护，用户模块只保存 `sys_user_role` 的引用。当前登录用户不能被停用或删除，拥有 `isSuperAdmin=true` 角色的账号不能删除。超级管理员身份由角色属性决定，与用户名和角色编码无关。

## 自测清单

- 列表、分页、用户名/昵称/状态筛选和角色 Tag 展示。
- 新增、编辑（用户名只读且不提交密码）、角色分配和状态切换。
- 新增用户名重复校验及服务端 409 冲突提示。
- 重置密码两次输入一致性校验。
- 删除二次确认、admin 保护、当前用户删除/停用保护。
