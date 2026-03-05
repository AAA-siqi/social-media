/**
 * Like Repository
 * 负责点赞相关的数据访问操作
 */

import { queryAll, queryOne, execute } from '../db.js'
import type { LikeRow } from '../models/index.js'

/**
 * 查找点赞记录
 */
export async function findByTargetAndUser(
  targetType: string,
  targetId: number,
  userId: number
): Promise<LikeRow | undefined> {
  return await queryOne(
    'SELECT * FROM likes WHERE target_type = ? AND target_id = ? AND user_id = ?',
    [targetType, targetId, userId]
  ) as LikeRow | undefined
}

/**
 * 检查是否已点赞
 */
export async function hasLiked(
  targetType: string,
  targetId: number,
  userId: number
): Promise<boolean> {
  const like = await findByTargetAndUser(targetType, targetId, userId)
  return !!like
}

/**
 * 创建点赞
 */
export async function create(data: {
  targetType: string
  targetId: number
  userId: number
}): Promise<number> {
  const now = new Date().toISOString()
  const result = await execute(
    'INSERT INTO likes (target_type, target_id, user_id, created_at) VALUES (?, ?, ?, ?)',
    [data.targetType, data.targetId, data.userId, now]
  )
  return result.lastId
}

/**
 * 删除点赞
 */
export async function deleteByTargetAndUser(
  targetType: string,
  targetId: number,
  userId: number
): Promise<void> {
  await execute(
    'DELETE FROM likes WHERE target_type = ? AND target_id = ? AND user_id = ?',
    [targetType, targetId, userId]
  )
}

/**
 * 获取目标的所有点赞用户ID
 */
export async function getLikedUserIds(
  targetType: string,
  targetId: number
): Promise<number[]> {
  const rows = await queryAll(
    'SELECT user_id FROM likes WHERE target_type = ? AND target_id = ?',
    [targetType, targetId]
  )
  return rows.map((r: any) => r.user_id as number)
}

/**
 * 获取评论的所有点赞用户ID
 */
export async function getCommentLikedUserIds(commentId: number): Promise<number[]> {
  return await getLikedUserIds('comment', commentId)
}

/**
 * 获取帖子的所有点赞用户ID
 */
export async function getPostLikedUserIds(postId: number): Promise<number[]> {
  return await getLikedUserIds('post', postId)
}

/**
 * 删除目标的所有点赞
 */
export async function deleteByTarget(
  targetType: string,
  targetId: number
): Promise<void> {
  await execute(
    'DELETE FROM likes WHERE target_type = ? AND target_id = ?',
    [targetType, targetId]
  )
}
