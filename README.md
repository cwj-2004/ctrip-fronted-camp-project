# 易宿酒店预订平台 (Easy Stay)

## 项目简介
本项目是第五期前端训练营的大作业，打造了一个前后端分离的综合性酒店预订平台。系统采用双端异构架构，包含面向普通用户的**移动端 (C端)**和面向商户/管理员的**后台管理系统 (B端)**，实现了从酒店录入、审核、发布到用户搜索、预订的完整业务闭环。

## 系统架构
- **用户端 (Mobile Client)**: 基于 React + Ant Design Mobile，提供酒店搜索、多维筛选、详情查看、地图定位及日历交互等功能。
- **管理端 (Admin Dashboard)**: 基于 React + Ant Design + Vite，提供酒店信息录入、状态流转（审核/发布/下线）、数据可视化看板及操作日志追溯。
- **服务端 (Server)**: 使用 JSON Server 搭建 Mock API，模拟真实后端数据交互。

## 核心特性
### 用户端
- **智能搜索**：支持关键字、日期（智能默认值/同日住退）、星级价格筛选。
- **LBS定位**：集成地理位置服务，自动定位当前城市。
- **流畅体验**：无限滚动列表与沉浸式详情页。

### 管理端
- **权限管理**：商户与管理员双角色权限隔离。
- **全流程管理**：支持酒店信息的增删改查及“待审核-已发布-已驳回”状态机流转。
- **数据可视化**：集成图表展示业务数据统计。

## 技术栈
| 模块 | 技术选型 |
| :--- | :--- |
| **前端框架** | React 18 (Mobile) / React 19 (Admin) |
| **UI 组件库** | Ant Design (PC) / Ant Design Mobile (Mobile) |
| **构建工具** | Vite (Admin) / Webpack (Mobile) |
| **路由管理** | React Router v6 / v7 |
| **数据请求** | Axios / Fetch API |
| **后端 Mock** | JSON Server |
| **工具库** | Day.js, @ant-design/plots |

## 快速启动

### 1. 启动后端服务
确保已安装 Node.js 环境。在项目根目录下运行：
```bash
npx json-server --watch server/db.json --port 3001 --host 0.0.0.0
```
API 服务将运行在 `http://localhost:3001`。

### 2. 启动用户端 (Mobile)
```bash
cd mobile-client
npm install
npm start
```
应用将运行在 `http://localhost:3000`。

### 3. 启动管理端 (Admin)
```bash
cd admin
npm install
npm run dev
```
应用将运行在 `http://localhost:5173`。

## 团队成员
- **陈文婧**：队长，负责移动端架构与开发。
- **吴婕儿**：负责管理端架构与开发。

## 开发计划与里程碑
- [x] **2/21 - 2/22**: 基础 UI 与路由搭建
- [x] **2/23 - 2/24**: 核心逻辑开发（搜索、审核、发布）
- [x] **2/25**: 数据联通、接口调试与 Bug 修复
- [x] **2/26**: 最终测试、文档完善与项目提交
