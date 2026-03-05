/**
 * User Repository
 * 负责用户相关的数据访问操作
 */

import { queryAll, queryOne, execute } from '../db.js'
import type { UserRow, Follow } from '../models/index.js'

/**
 * 根据用户名查找用户（用于登录）
 */
export async function findByUsername(username: string): Promise<UserRow | undefined> {
  return await queryOne(
    'SELECT * FROM users WHERE username = ?',
    [username]
  ) as UserRow | undefined
}

/**
 * 根据 ID 查找用户
 */
export async function findById(id: number): Promise<UserRow | undefined> {
  return await queryOne(
    'SELECT * FROM users WHERE id = ?',
    [id]
  ) as UserRow | undefined
}

/**
 * 根据 ID 数组查找多个用户
 */
export async function findByIds(ids: number[]): Promise<UserRow[]> {
  if (ids.length === 0) return []
  const placeholders = ids.map(() => '?').join(',')
  return await queryAll(
    `SELECT * FROM users WHERE id IN (${placeholders})`,
    ids
  ) as UserRow[]
}

/**
 * 获取所有用户
 */
export async function findAll(): Promise<UserRow[]> {
  return await queryAll('SELECT * FROM users ORDER BY id ASC') as UserRow[]
}

/**
 * 创建新用户
 */
export async function create(data: {
  username: string
  passwordHash: string
  displayName: string
  avatar: string
}): Promise<number> {
  const now = new Date().toISOString()
  const result = await execute(
    `INSERT INTO users (username, password_hash, display_name, avatar, bio, location, verified, created_at)
     VALUES (?, ?, ?, ?, '', '', 0, ?)`,
    [data.username, data.passwordHash, data.displayName, data.avatar, now]
  )
  return result.lastId
}

/**
 * 检查用户名是否存在
 */
export async function usernameExists(username: string): Promise<boolean> {
  const user = await queryOne(
    'SELECT id FROM users WHERE username = ?',
    [username]
  )
  return !!user
}

/**
 * 更新用户信息
 */
export async function update(id: number, data: Partial<{
  displayName: string
  avatar: string
  bio: string
  location: string
  coverImage: string
}>): Promise<void> {
  const updates: string[] = []
  const params: any[] = []

  if (data.displayName !== undefined) {
    updates.push('display_name = ?')
    params.push(data.displayName)
  }
  if (data.avatar !== undefined) {
    updates.push('avatar = ?')
    params.push(data.avatar)
  }
  if (data.bio !== undefined) {
    updates.push('bio = ?')
    params.push(data.bio)
  }
  if (data.location !== undefined) {
    updates.push('location = ?')
    params.push(data.location)
  }
  if (data.coverImage !== undefined) {
    updates.push('cover_image = ?')
    params.push(data.coverImage)
  }

  if (updates.length > 0) {
    params.push(id)
    await execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    )
  }
}

// ==================== 关注相关 ====================

/**
 * 创建关注关系
 */
export async function createFollow(followerId: number, followingId: number): Promise<void> {
  const now = new Date().toISOString()
  await execute(
    'INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)',
    [followerId, followingId, now]
  )
}

/**
 * 删除关注关系
 */
export async function deleteFollow(followerId: number, followingId: number): Promise<void> {
  await execute(
    'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId]
  )
}

/**
 * 检查是否已关注
 */
export async function isFollowing(followerId: number, followingId: number): Promise<boolean> {
  const follow = await queryOne(
    'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId]
  )
  return !!follow
}

/**
 * 获取用户的关注者列表
 */
export async function getFollowers(userId: number): Promise<number[]> {
  const rows = await queryAll(
    'SELECT follower_id FROM follows WHERE following_id = ?',
    [userId]
  )
  return rows.map((r: any) => r.follower_id as number)
}

/**
 * 获取用户正在关注的人
 */
export async function getFollowing(userId: number): Promise<number[]> {
  const rows = await queryAll(
    'SELECT following_id FROM follows WHERE follower_id = ?',
    [userId]
  )
  return rows.map((r: any) => r.following_id as number)
}

/**
 * 获取关注关系详情（用于互关检查）
 */
export async function getFollow(userId: number, otherUserId: number): Promise<Follow | undefined> {
  return await queryOne(
    'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
    [userId, otherUserId]
  ) as Follow | undefined
}
