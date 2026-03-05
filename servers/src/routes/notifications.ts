/**
 * Notifications Controller
 * 负责处理通知相关的 HTTP 请求
 * 职责：解析请求、调用 Service、返回响应
 */

import Router from 'koa-router'
import * as NotificationService from '../services/notification.service.js'
import { requireAuth } from '../middleware/auth.js'

const router = new Router({ prefix: '/api/notifications' })

/**
 * GET /api/notifications
 * 获取用户的所有通知（需要登录）
 */
router.get('/', requireAuth, async (ctx) => {
  const userId = Number(ctx.state.user.id)
  const notifications = await NotificationService.getUserNotifications(userId)
  ctx.body = { notifications }
})

/**
 * PATCH /api/notifications
 * 标记所有通知为已读（需要登录）
 */
router.patch('/', requireAuth, async (ctx) => {
  const userId = Number(ctx.state.user.id)
  await NotificationService.markAllAsRead(userId)
  ctx.body = { success: true }
})

/**
 * POST /api/notifications/:id/read
 * 标记单个通知为已读（需要登录）
 */
router.post('/:id/read', requireAuth, async (ctx) => {
  const notificationId = Number(ctx.params.id)
  await NotificationService.markAsRead(notificationId)
  ctx.body = { success: true }
})

export default router
