/**
 * Session Repository
 * 负责会话/认证相关的数据访问操作
 */

import { queryAll, queryOne, execute } from '../db.js'
import type { SessionRow } from '../models/index.js'

/**
 * 根据 Token 获取会话
 */
export async function findByToken(token: string): Promise<SessionRow | undefined> {
  return await queryOne(
    'SELECT * FROM sessions WHERE token = ?',
    [token]
  ) as SessionRow | undefined
}

/**
 * 根据 Token 获取有效会话（未过期）
 */
export async function findValidByToken(token: string): Promise<SessionRow | undefined> {
  const now = new Date().toISOString()
  return await queryOne(
    'SELECT * FROM sessions WHERE token = ? AND expires_at > ?',
    [token, now]
  ) as SessionRow | undefined
}

/**
 * 创建会话
 */
export async function create(data: {
  token: string
  userId: number
  expiresAt: string
}): Promise<number> {
  const result = await execute(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
    [data.token, data.userId, data.expiresAt]
  )
  return result.lastId
}

/**
 * 删除会话
 */
export async function deleteByToken(token: string): Promise<void> {
  await execute('DELETE FROM sessions WHERE token = ?', [token])
}

/**
 * 删除用户的所有会话
 */
export async function deleteByUserId(userId: number): Promise<void> {
  await execute('DELETE FROM sessions WHERE user_id = ?', [userId])
}

/**
 * 清理过期会话
 */
export async function deleteExpired(): Promise<void> {
  const now = new Date().toISOString()
  await execute('DELETE FROM sessions WHERE expires_at < ?', [now])
}

/**
 * 获取用户的所有有效会话
 */
export async function findByUserId(userId: number): Promise<SessionRow[]> {
  const now = new Date().toISOString()
  return await queryAll(
    'SELECT * FROM sessions WHERE user_id = ? AND expires_at > ?',
    [userId, now]
  ) as SessionRow[]
}
