/**
 * Conversation Service
 * 负责私信会话相关的业务逻辑
 */

import * as ConvRepo from '../repositories/conversation.repository.js'
import * as UserService from './user.service.js'
import type { Conversation, Message } from '../models/index.js'

/**
 * 格式化会话数据
 */
export async function formatConversation(convId: number): Promise<Conversation> {
  const participants = await ConvRepo.getParticipants(convId)
  const rawMessages = await ConvRepo.getMessages(convId)

  const messages: Message[] = rawMessages.map(m => ({
    id: String(m.id),
    conversationId: String(m.conversation_id),
    senderId: String(m.sender_id),
    content: m.content,
    read: !!m.is_read,
    createdAt: m.created_at,
  }))

  const lastMsg = rawMessages[rawMessages.length - 1]

  return {
    id: String(convId),
    participants: participants.map(id => String(id)),
    messages,
    lastActivity: lastMsg?.created_at || new Date().toISOString(),
  }
}

/**
 * 获取用户的所有会话
 */
export async function getUserConversations(userId: number): Promise<Conversation[]> {
  const convIds = await ConvRepo.findByUserId(userId)
  return Promise.all(convIds.map(id => formatConversation(id)))
}

/**
 * 获取会话详情
 */
export async function getConversation(convId: number): Promise<Conversation | null> {
  const conv = await ConvRepo.findById(convId)
  if (!conv) return null
  return await formatConversation(convId)
}

/**
 * 获取或创建两个用户之间的会话
 */
export async function getOrCreateConversation(user1Id: number, user2Id: number): Promise<Conversation> {
  // 查找现有会话
  const existingConvId = await ConvRepo.findConversationByUsers(user1Id, user2Id)
  if (existingConvId) {
    return await formatConversation(existingConvId)
  }

  // 创建新会话
  const convId = await ConvRepo.createConversation()
  await ConvRepo.addParticipant(convId, user1Id)
  await ConvRepo.addParticipant(convId, user2Id)

  return await formatConversation(convId)
}

/**
 * 发送消息
 */
export async function sendMessage(data: {
  conversationId: number
  senderId: number
  content: string
}): Promise<Message> {
  // 验证内容
  if (!data.content?.trim()) {
    throw new Error('消息内容不能为空')
  }

  // 创建消息
  const messageId = await ConvRepo.createMessage({
    conversationId: data.conversationId,
    senderId: data.senderId,
    content: data.content.trim(),
  })

  // 返回消息
  const message = await ConvRepo.findMessageById(messageId)
  if (!message) {
    throw new Error('消息发送失败')
  }

  return {
    id: String(message.id),
    conversationId: String(message.conversation_id),
    senderId: String(message.sender_id),
    content: message.content,
    read: !!message.is_read,
    createdAt: message.created_at,
  }
}

/**
 * 标记会话消息为已读
 */
export async function markConversationRead(conversationId: number, userId: number): Promise<void> {
  await ConvRepo.markConversationMessagesRead(conversationId, userId)
}

/**
 * 获取会话未读消息数
 */
export async function getUnreadCount(conversationId: number, userId: number): Promise<number> {
  return await ConvRepo.countUnreadMessages(conversationId, userId)
}

/**
 * 获取用户所有会话的总未读消息数
 */
export async function getTotalUnreadCount(userId: number): Promise<number> {
  const convIds = await ConvRepo.findByUserId(userId)
  let total = 0
  for (const convId of convIds) {
    total += await ConvRepo.countUnreadMessages(convId, userId)
  }
  return total
}
