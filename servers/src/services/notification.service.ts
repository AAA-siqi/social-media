/**
 * Notification Service
 * 负责通知相关的业务逻辑
 */

import * as NotificationRepo from '../repositories/notification.repository.js'
import * as UserService from './user.service.js'
import type { Notification } from '../models/index.js'

/**
 * 格式化通知数据
 */
export function formatNotification(row: any): Notification {
  return {
    id: String(row.id),
    type: row.type,
    fromUserId: String(row.from_user_id),
    toUserId: String(row.to_user_id),
    postId: row.post_id ? String(row.post_id) : undefined,
    read: !!row.is_read,
    createdAt: row.created_at,
  }
}

/**
 * 获取用户的所有通知
 */
export async function getUserNotifications(userId: number): Promise<Notification[]> {
  const rows = await NotificationRepo.findByToUserId(userId)
  return rows.map(row => formatNotification(row))
}

/**
 * 获取用户未读通知数量
 */
export async function getUnreadCount(userId: number): Promise<number> {
  return await NotificationRepo.countUnread(userId)
}

/**
 * 标记通知为已读
 */
export async function markAsRead(notificationId: number): Promise<void> {
  await NotificationRepo.markAsRead(notificationId)
}

/**
 * 标记所有通知为已读
 */
export async function markAllAsRead(userId: number): Promise<void> {
  await NotificationRepo.markAllAsRead(userId)
}

/**
 * 创建点赞通知
 */
export async function createLikeNotification(toUserId: number, fromUserId: number, postId: number): Promise<void> {
  // 不给自己发通知
  if (toUserId === fromUserId) return
  await NotificationRepo.create({
    type: 'like',
    toUserId,
    fromUserId,
    postId,
  })
}

/**
 * 创建评论通知
 */
export async function createCommentNotification(toUserId: number, fromUserId: number, postId: number): Promise<void> {
  // 不给自己发通知
  if (toUserId === fromUserId) return
  await NotificationRepo.create({
    type: 'comment',
    toUserId,
    fromUserId,
    postId,
  })
}

/**
 * 创建关注通知
 */
export async function createFollowNotification(toUserId: number, fromUserId: number): Promise<void> {
  // 不给自己发通知
  if (toUserId === fromUserId) return
  await NotificationRepo.create({
    type: 'follow',
    toUserId,
    fromUserId,
  })
}

/**
 * 创建转发通知
 */
export async function createRepostNotification(toUserId: number, fromUserId: number, postId: number): Promise<void> {
  // 不给自己发通知
  if (toUserId === fromUserId) return
  await NotificationRepo.create({
    type: 'repost',
    toUserId,
    fromUserId,
    postId,
  })
}

/**
 * 创建提及通知
 */
export async function createMentionNotification(toUserId: number, fromUserId: number, postId: number): Promise<void> {
  // 不给自己发通知
  if (toUserId === fromUserId) return
  await NotificationRepo.create({
    type: 'mention',
    toUserId,
    fromUserId,
    postId,
  })
}
