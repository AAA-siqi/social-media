/**
 * Comment Repository
 * 负责评论相关的数据访问操作
 */

import { queryAll, queryOne, execute } from '../db.js'
import type { CommentRow } from '../models/index.js'

/**
 * 获取帖子的所有评论
 */
export async function findByPostId(postId: number): Promise<CommentRow[]> {
  return await queryAll(
    'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC',
    [postId]
  ) as CommentRow[]
}

/**
 * 根据 ID 获取评论
 */
export async function findById(id: number): Promise<CommentRow | undefined> {
  return await queryOne(
    'SELECT * FROM comments WHERE id = ?',
    [id]
  ) as CommentRow | undefined
}

/**
 * 创建评论
 */
export async function create(data: {
  postId: number
  authorId: number
  content: string
}): Promise<number> {
  const now = new Date().toISOString()
  const result = await execute(
    'INSERT INTO comments (post_id, author_id, content, created_at) VALUES (?, ?, ?, ?)',
    [data.postId, data.authorId, data.content, now]
  )
  return result.lastId
}

/**
 * 删除评论
 */
export async function deleteById(id: number): Promise<void> {
  await execute('DELETE FROM comments WHERE id = ?', [id])
}

/**
 * 删除帖子的所有评论
 */
export async function deleteByPostId(postId: number): Promise<void> {
  await execute('DELETE FROM comments WHERE post_id = ?', [postId])
}

/**
 * 获取用户的评论列表
 */
export async function findByAuthorId(authorId: number): Promise<CommentRow[]> {
  return await queryAll(
    'SELECT * FROM comments WHERE author_id = ? ORDER BY created_at DESC',
    [authorId]
  ) as CommentRow[]
}
