/**
 * Conversation Repository
 * 负责私信会话相关的数据访问操作
 */

import { queryAll, queryOne, execute } from '../db.js'
import type { ConversationRow, MessageRow } from '../models/index.js'

// ==================== 会话相关 ====================

/**
 * 创建会话
 */
export async function createConversation(): Promise<number> {
  const now = new Date().toISOString()
  const result = await execute(
    'INSERT INTO conversations (created_at) VALUES (?)',
    [now]
  )
  return result.lastId
}

/**
 * 根据 ID 获取会话
 */
export async function findById(id: number): Promise<ConversationRow | undefined> {
  return await queryOne(
    'SELECT * FROM conversations WHERE id = ?',
    [id]
  ) as ConversationRow | undefined
}

/**
 * 获取会话的所有参与者
 */
export async function getParticipants(conversationId: number): Promise<number[]> {
  const rows = await queryAll(
    'SELECT user_id FROM conversation_participants WHERE conversation_id = ?',
    [conversationId]
  )
  return rows.map((r: any) => r.user_id as number)
}

/**
 * 添加会话参与者
 */
export async function addParticipant(conversationId: number, userId: number): Promise<void> {
  await execute(
    'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)',
    [conversationId, userId]
  )
}

/**
 * 删除会话参与者
 */
export async function removeParticipant(conversationId: number, userId: number): Promise<void> {
  await execute(
    'DELETE FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, userId]
  )
}

/**
 * 查找两个用户之间的会话（1对1对话）
 */
export async function findConversationByUsers(user1Id: number, user2Id: number): Promise<number | undefined> {
  // 查找同时包含这两个用户的会话
  const rows = await queryAll(`
    SELECT c1.conversation_id
    FROM conversation_participants c1
    JOIN conversation_participants c2 ON c1.conversation_id = c2.conversation_id
    WHERE c1.user_id = ? AND c2.user_id = ?
  `, [user1Id, user2Id])

  if (rows.length > 0) {
    return rows[0].conversation_id as number
  }
  return undefined
}

/**
 * 获取用户参与的所有会话
 */
export async function findByUserId(userId: number): Promise<number[]> {
  const rows = await queryAll(
    'SELECT DISTINCT conversation_id FROM conversation_participants WHERE user_id = ?',
    [userId]
  )
  return rows.map((r: any) => r.conversation_id as number)
}

// ==================== 消息相关 ====================

/**
 * 获取会话的所有消息
 */
export async function getMessages(conversationId: number): Promise<MessageRow[]> {
  return await queryAll(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    [conversationId]
  ) as MessageRow[]
}

/**
 * 根据 ID 获取消息
 */
export async function findMessageById(id: number): Promise<MessageRow | undefined> {
  return await queryOne(
    'SELECT * FROM messages WHERE id = ?',
    [id]
  ) as MessageRow | undefined
}

/**
 * 创建消息
 */
export async function createMessage(data: {
  conversationId: number
  senderId: number
  content: string
}): Promise<number> {
  const now = new Date().toISOString()
  const result = await execute(
    'INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, 0, ?)',
    [data.conversationId, data.senderId, data.content, now]
  )
  return result.lastId
}

/**
 * 标记消息为已读
 */
export async function markMessageAsRead(id: number): Promise<void> {
  await execute(
    'UPDATE messages SET is_read = 1 WHERE id = ?',
    [id]
  )
}

/**
 * 标记会话中某用户的所有消息为已读
 */
export async function markConversationMessagesRead(conversationId: number, userId: number): Promise<void> {
  await execute(
    'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?',
    [conversationId, userId]
  )
}

/**
 * 获取用户在会话中的未读消息数
 */
export async function countUnreadMessages(conversationId: number, userId: number): Promise<number> {
  const result = await queryOne(
    'SELECT COUNT(*) as count FROM messages WHERE conversation_id = ? AND sender_id != ? AND is_read = 0',
    [conversationId, userId]
  )
  return result?.count as number || 0
}

/**
 * 删除会话的所有消息
 */
export async function deleteMessages(conversationId: number): Promise<void> {
  await execute('DELETE FROM messages WHERE conversation_id = ?', [conversationId])
}

/**
 * 删除会话
 */
export async function deleteConversation(id: number): Promise<void> {
  await execute('DELETE FROM conversations WHERE id = ?', [id])
}
