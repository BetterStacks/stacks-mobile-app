import { useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { useState, useMemo } from 'react'
import uuid from 'react-native-uuid'
import { 
  QUERY_CHATS, 
  QUERY_CHAT, 
  MUTATION_CREATE_CHAT, 
  MUTATION_ADD_CHAT_MESSAGE,
  MUTATION_ADD_AI_CONTEXT,
  MUTATION_DELETE_CHAT,
  Chat, 
  ChatMessage,
  AIContext
} from '../lib/api/graphql/chats'

export interface UseChatsReturn {
  // Queries
  chats: Chat[]
  chatsLoading: boolean
  chatsError: any
  
  // Current chat
  currentChat: Chat | null
  currentChatMessages: ChatMessage[]
  currentChatLoading: boolean
  currentChatError: any
  
  // Actions
  createChat: (title: string, firstMessage: string) => Promise<string>
  addMessage: (chatUuid: string, content: string, role: 'user' | 'assistant', metadata?: any) => Promise<void>
  addContext: (chatUuid: string, contextType: string, contextableType: string, contextableId: string) => Promise<void>
  deleteChat: (chatUuid: string) => Promise<void>
  loadChat: (chatUuid: string) => void
  refetchChats: () => void
}

export const useChats = (): UseChatsReturn => {
  // Query all chats
  const { 
    data: chatsData, 
    loading: chatsLoading, 
    error: chatsError,
    refetch: refetchChats
  } = useQuery(QUERY_CHATS())

  // Lazy query for loading specific chats
  const [loadChatQuery, { 
    data: currentChatData, 
    loading: currentChatLoading, 
    error: currentChatError 
  }] = useLazyQuery(QUERY_CHAT)

  // Mutations
  const [createChatMutation] = useMutation(MUTATION_CREATE_CHAT())
  const [addChatMessageMutation] = useMutation(MUTATION_ADD_CHAT_MESSAGE())
  const [addAiContextMutation] = useMutation(MUTATION_ADD_AI_CONTEXT())
  const [deleteChatMutation] = useMutation(MUTATION_DELETE_CHAT())

  const createChat = async (title: string, firstMessage: string): Promise<string> => {
    const chatId = uuid.v4() as string
    
    try {
      const result = await createChatMutation({
        variables: {
          title,
          first_message_content: firstMessage,
          first_message_role: 'user',
          chat_id: chatId
        },
        // Optimistically update the cache and wait for refetch
        refetchQueries: [{ query: QUERY_CHATS() }],
        awaitRefetchQueries: true
      })
      
      console.log('📚 Chat created:', result.data?.create_chat?.chat_uuid)
      return result.data?.create_chat?.chat_uuid || chatId
    } catch (error) {
      console.error('❌ Error creating chat:', error)
      throw error
    }
  }

  const addMessage = async (
    chatUuid: string, 
    content: string, 
    role: 'user' | 'assistant', 
    metadata?: any
  ): Promise<void> => {
    try {
      await addChatMessageMutation({
        variables: {
          chat_uuid: chatUuid,
          content,
          role,
          metadata
        },
        // Update the current chat if it's loaded
        refetchQueries: currentChatData ? [{ 
          query: QUERY_CHAT,
          variables: { chatUuid }
        }] : []
      })
      
      // console.log('💬 Message added to chat:', chatUuid, role)
    } catch (error) {
      // console.error('❌ Error adding message:', error)
      throw error
    }
  }

  const addContext = async (
    chatUuid: string,
    contextType: string,
    contextableType: string,
    contextableId: string
  ): Promise<void> => {
    try {
      await addAiContextMutation({
        variables: {
          chat_uuid: chatUuid,
          context_type: contextType,
          contextable_type: contextableType,
          contextable_id: contextableId
        },
        // Update the current chat if it's loaded
        refetchQueries: currentChatData ? [{ 
          query: QUERY_CHAT,
          variables: { chatUuid }
        }] : []
      })
      
      // console.log('🔗 Context added to chat:', chatUuid, contextType)
    } catch (error) {
      // console.error('❌ Error adding context:', error)
      throw error
    }
  }

  const deleteChat = async (chatUuid: string): Promise<void> => {
    try {
      const result = await deleteChatMutation({
        variables: {
          chat_uuid: chatUuid
        },
        // Optimistically update the cache by refetching chats
        refetchQueries: [{ query: QUERY_CHATS() }]
      })
      
      if (result.data?.delete_chat) {
        // console.log('🗑️ Chat deleted successfully:', chatUuid)
      } else {
        throw new Error('Delete operation returned false')
      }
    } catch (error) {
      // console.error('❌ Error deleting chat:', error)
      throw error
    }
  }

  const loadChat = (chatUuid: string) => {
    // Use lazy query to load chat
    loadChatQuery({
      variables: { chatUuid }
    })
  }

  return useMemo(() => ({
    // Queries
    chats: chatsData?.chats || [],
    chatsLoading,
    chatsError,
    
    // Current chat
    currentChat: currentChatData?.chat || null,
    currentChatMessages: currentChatData?.chat?.chat_messages || [],
    currentChatLoading,
    currentChatError,
    
    // Actions
    createChat,
    addMessage,
    addContext,
    deleteChat,
    loadChat,
    refetchChats
  }), [
    chatsData?.chats,
    chatsLoading,
    chatsError,
    currentChatData?.chat,
    currentChatLoading,
    currentChatError,
    createChat,
    addMessage,
    addContext,
    deleteChat,
    loadChat,
    refetchChats
  ])
}