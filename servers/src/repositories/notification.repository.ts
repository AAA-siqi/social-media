/**
 * Notification Repository
 * 负责通知相关的数据访问操作
 */

import { queryAll, queryOne, execute } from '../db.js'
import type { NotificationRow } from '../models/index.js'

/**
 * 获取用户的所有通知
 */
export async function findByToUserId(toUserId: number): Promise<NotificationRow[]> {
  return await queryAll(
    'SELECT * FROM notifications WHERE to_user_id = ? ORDER BY created_at DESC',
    [toUserId]
  ) as NotificationRow[]
}

/**
 * 获取用户未读通知数量
 */
export async function countUnread(toUserId: number): Promise<number> {
  const result = await queryOne(
    'SELECT COUNT(*) as count FROM notifications WHERE to_user_id = ? AND is_read = 0',
    [toUserId]
  )
  return result?.count as number || 0
}

/**
 * 创建通知
 */
export async function create(data: {
  type: string
  toUserId: number
  fromUserId: number
  postId?: number
}): Promise<number> {
  const now = new Date().toISOString()
  const result = await execute(
    'INSERT INTO notifications (type, to_user_id, from_user_id, post_id, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)',
    [data.type, data.toUserId, data.fromUserId, data.postId || null, now]
  )
  return result.lastId
}

/**
 * 标记通知为已读
 */
export async function markAsRead(id: number): Promise<void> {
  await execute(
    'UPDATE notifications SET is_read = 1 WHERE id = ?',
    [id]
  )
}

/**
 * 标记用户所有通知为已读
 */
export async function markAllAsRead(toUserId: number): Promise<void> {
  await execute(
    'UPDATE notifications SET is_read = 1 WHERE to_user_id = ? AND is_read = 0',
    [toUserId]
  )
}

/**
 * 删除通知
 */
export async function deleteById(id: number): Promise<void> {
  await execute('DELETE FROM notifications WHERE id = ?', [id])
}

/**
 * 删除用户的所有通知
 */
export async function deleteByToUserId(toUserId: number): Promise<void> {
  await execute('DELETE FROM notifications WHERE to_user_id = ?', [toUserId])
}
