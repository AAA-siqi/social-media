/**
 * Post Repository
 * 负责帖子相关的数据访问操作
 */

import { queryAll, queryOne, execute } from '../db.js'
import type { PostRow, PostMedia } from '../models/index.js'

/**
 * 获取所有帖子
 */
export async function findAll(orderBy: 'DESC' | 'ASC' = 'DESC'): Promise<PostRow[]> {
  return await queryAll(
    `SELECT * FROM posts ORDER BY created_at ${orderBy}`
  ) as PostRow[]
}

/**
 * 根据 ID 获取帖子
 */
export async function findById(id: number): Promise<PostRow | undefined> {
  return await queryOne(
    'SELECT * FROM posts WHERE id = ?',
    [id]
  ) as PostRow | undefined
}

/**
 * 根据作者 ID 获取帖子列表
 */
export async function findByAuthorId(authorId: number): Promise<PostRow[]> {
  return await queryAll(
    'SELECT * FROM posts WHERE author_id = ? ORDER BY created_at DESC',
    [authorId]
  ) as PostRow[]
}

/**
 * 创建帖子
 */
export async function create(data: {
  authorId: number
  content: string
}): Promise<number> {
  const now = new Date().toISOString()
  const result = await execute(
    'INSERT INTO posts (author_id, content, repost_count, created_at) VALUES (?, ?, 0, ?)',
    [data.authorId, data.content, now]
  )
  return result.lastId
}

/**
 * 删除帖子
 */
export async function deleteById(id: number): Promise<void> {
  await execute('DELETE FROM posts WHERE id = ?', [id])
}

/**
 * 更新帖子内容
 */
export async function updateContent(id: number, content: string): Promise<void> {
  await execute(
    'UPDATE posts SET content = ? WHERE id = ?',
    [content, id]
  )
}

// ==================== 帖子标签 ====================

/**
 * 获取帖子标签
 */
export async function getTags(postId: number): Promise<string[]> {
  const rows = await queryAll(
    'SELECT tag FROM post_tags WHERE post_id = ?',
    [postId]
  )
  return rows.map((r: any) => r.tag as string)
}

/**
 * 添加帖子标签
 */
export async function addTag(postId: number, tag: string): Promise<void> {
  await execute(
    'INSERT INTO post_tags (post_id, tag) VALUES (?, ?)',
    [postId, tag.trim()]
  )
}

/**
 * 批量添加帖子标签
 */
export async function addTags(postId: number, tags: string[]): Promise<void> {
  for (const tag of tags) {
    if (typeof tag === 'string' && tag.trim()) {
      await addTag(postId, tag)
    }
  }
}

/**
 * 删除帖子所有标签
 */
export async function deleteTags(postId: number): Promise<void> {
  await execute('DELETE FROM post_tags WHERE post_id = ?', [postId])
}

// ==================== 帖子媒体 ====================

/**
 * 获取帖子媒体
 */
export async function getMedia(postId: number): Promise<PostMedia[]> {
  const rows = await queryAll(
    'SELECT type, url FROM post_media WHERE post_id = ?',
    [postId]
  )
  return rows.map((r: any) => ({ type: r.type, url: r.url } as PostMedia))
}

/**
 * 添加帖子媒体
 */
export async function addMedia(postId: number, media: PostMedia): Promise<void> {
  await execute(
    'INSERT INTO post_media (post_id, type, url) VALUES (?, ?, ?)',
    [postId, media.type, media.url]
  )
}

/**
 * 批量添加帖子媒体
 */
export async function addMediaList(postId: number, mediaList: PostMedia[]): Promise<void> {
  for (const media of mediaList) {
    if (media && typeof media.url === 'string' && typeof media.type === 'string') {
      await addMedia(postId, media)
    }
  }
}

/**
 * 删除帖子所有媒体
 */
export async function deleteMedia(postId: number): Promise<void> {
  await execute('DELETE FROM post_media WHERE post_id = ?', [postId])
}
