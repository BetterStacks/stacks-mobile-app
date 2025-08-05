import { useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { useMemo, useCallback } from 'react'
import uuid from 'react-native-uuid'
import { 
  QUERY_CHATS, 
  QUERY_CHAT, 
  MUTATION_CREATE_CHAT, 
  MUTATION_ADD_CHAT_MESSAGE,
  MUTATION_ADD_AI_CONTEXT,
  MUTATION_DELETE_CHAT,
  MUTATION_ADD_FILE,
  MUTATION_UPDATE_CHAT_MESSAGE,
  Chat, 
  ChatMessage
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
  addFile: (file: any) => Promise<{ title: string; target_url: string }>
  updateChatMessage: (chatMessageUuid: string, metadata: any) => Promise<void>
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
  const [addFileMutation] = useMutation(MUTATION_ADD_FILE)
  const [updateChatMessageMutation] = useMutation(MUTATION_UPDATE_CHAT_MESSAGE)

  const createChat = useCallback(async (title: string, firstMessage: string): Promise<string> => {
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
      
      return result.data?.create_chat?.chat_uuid || chatId
    } catch (error) {
      console.error('❌ Error creating chat:', error)
      throw error
    }
  }, [createChatMutation])

  const addMessage = useCallback(async (
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
      
    } catch (error) {
      throw error
    }
  }, [addChatMessageMutation, currentChatData])

  const addContext = useCallback(async (
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
      
    } catch (error) {
      throw error
    }
  }, [addAiContextMutation, currentChatData])

  const deleteChat = useCallback(async (chatUuid: string): Promise<void> => {
    try {
      const result = await deleteChatMutation({
        variables: {
          chat_uuid: chatUuid
        },
        // Optimistically update the cache by refetching chats
        refetchQueries: [{ query: QUERY_CHATS() }]
      })
      
      if (result.data?.delete_chat) {
      } else {
        throw new Error('Delete operation returned false')
      }
    } catch (error) {
      throw error
    }
  }, [deleteChatMutation])

  const loadChat = useCallback((chatUuid: string) => {
    // Use lazy query to load chat
    loadChatQuery({
      variables: { chatUuid }
    })
  }, [loadChatQuery])

  const addFile = useCallback(async (file: any): Promise<{ title: string; target_url: string }> => {
    try {
      const result = await addFileMutation({
        variables: { file },
        context: {
          hasUpload: true // Enable custom upload handling for single file
        }
      })
      
      return {
        title: result.data?.add_file?.title || '',
        target_url: result.data?.add_file?.target_url || ''
      }
    } catch (error) {
      console.error('❌ addFile mutation error:', error);
      throw error
    }
  }, [addFileMutation])

  const updateChatMessage = useCallback(async (chatMessageUuid: string, metadata: any): Promise<void> => {
    try {
      await updateChatMessageMutation({
        variables: {
          chat_message_uuid: chatMessageUuid,
          metadata
        }
      })
    } catch (error) {
      console.error('❌ updateChatMessage mutation error:', error);
      throw error
    }
  }, [updateChatMessageMutation])

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
    refetchChats,
    addFile,
    updateChatMessage
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
    refetchChats,
    addFile,
    updateChatMessage
  ])
}