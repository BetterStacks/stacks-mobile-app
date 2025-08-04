import React, { useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, ColorSchemeName, ToastAndroid, Platform } from 'react-native'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import { CustomAlert, AlertButton } from '@/components/CustomAlert'
import { CustomToast } from '@/components/CustomToast'
import { useChats } from '@/hooks/useChats'
import { Chat } from '@/lib/api/graphql/chats'
import { styles } from './styles'

interface ChatHistoryDrawerProps {
  onChatSelect: (chat: Chat) => void
  colorScheme?: ColorSchemeName
}

const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  onChatSelect,
  colorScheme
}) => {
  const isDark = colorScheme === 'dark'
  const { chats, chatsLoading, chatsError, refetchChats, deleteChat } = useChats()
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: AlertButton[];
  } | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const handleRefresh = useCallback(() => {
    refetchChats()
  }, [refetchChats])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }

  const handleDeleteChat = useCallback(async (chat: Chat) => {
    const performDelete = async () => {
      try {
        setDeletingChatId(chat.chat_uuid)
        await deleteChat(chat.chat_uuid)
        showToast('Chat deleted successfully')
        console.log('🗑️ Chat deleted successfully:', chat.title)
      } catch (error) {
        console.error('❌ Failed to delete chat:', error)
        showToast('Failed to delete chat', 'error')
        // Show error alert
        setAlertConfig({
          title: 'Error',
          message: 'Failed to delete chat. Please try again.',
          buttons: [
            {
              text: 'OK',
              style: 'default'
            }
          ]
        })
        setAlertVisible(true)
      } finally {
        setDeletingChatId(null)
      }
    }

    setAlertConfig({
      title: 'Delete Chat',
      message: `Are you sure you want to delete "${chat.title}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performDelete
        }
      ]
    })
    setAlertVisible(true)
  }, [deleteChat])

  const renderChatItem = useCallback(({ item: chat }: { item: Chat }) => {
    const isDeleting = deletingChatId === chat.chat_uuid
    
    return (
      <TouchableOpacity
        style={[
          styles.linkItem,
          isDark ? styles.linkItem__dark : null,
          { opacity: isDeleting ? 0.5 : 1, flexDirection: 'row', alignItems: 'center' }
        ]}
        onPress={() => onChatSelect(chat)}
        disabled={isDeleting}
      >
        <View style={[styles.linkItemContent, { flex: 1 }]}>
          <View style={styles.linkItemHeader}>
            <Text 
              style={[
                styles.linkTitle,
                isDark ? styles.linkTitle__dark : null
              ]}
              numberOfLines={1}
            >
              {chat.title}
            </Text>
            <Text 
              style={[
                styles.linkDescription,
                isDark ? styles.linkDescription__dark : null,
                { fontSize: 12, marginTop: 0 }
              ]}
            >
              {formatDate(chat.updated_at)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <View 
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: isDark ? '#0a7ea4' : '#0a7ea4',
                marginRight: 8
              }}
            />
            <Text 
              style={[
                styles.linkDescription,
                isDark ? styles.linkDescription__dark : null,
                { fontSize: 12 }
              ]}
            >
              {isDeleting ? 'Deleting...' : 'Tap to continue this conversation'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            padding: 8,
            marginLeft: 8
          }}
          onPress={(e) => {
            e.stopPropagation()
            handleDeleteChat(chat)
          }}
          disabled={isDeleting}
        >
          <Ionicons 
            name="trash-outline" 
            size={16} 
            color={isDeleting ? (isDark ? '#555' : '#ccc') : (isDark ? '#A0B3BC' : '#6B7280')} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }, [isDark, onChatSelect, formatDate, handleDeleteChat, deletingChatId])

  return (
    <View style={isDark ? styles.drawerContainer__dark : styles.drawerContainer}>
      <View style={styles.drawerContent}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 }}>
          <Text style={isDark ? styles.drawerTitle__dark : styles.drawerTitle}>
            Chat History
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={{ padding: 4 }}>
            <Ionicons 
              name="refresh" 
              size={20} 
              color={isDark ? '#A0B3BC' : '#6B7280'} 
            />
          </TouchableOpacity>
        </View>

        {chatsLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={isDark ? styles.emptyText__dark : styles.emptyText}>
              Loading chats...
            </Text>
          </View>
        ) : chatsError ? (
          <View style={styles.emptyContainer}>
            <Text style={[isDark ? styles.emptyText__dark : styles.emptyText, { color: '#ff4444', marginBottom: 12 }]}>
              Error loading chats
            </Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Text style={[isDark ? styles.drawerTitle__dark : styles.drawerTitle, { color: isDark ? '#0a7ea4' : '#0a7ea4' }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="chatbubbles-outline" 
              size={48} 
              color={isDark ? '#A0B3BC' : '#6B7280'} 
              style={{ marginBottom: 16 }}
            />
            <Text style={[isDark ? styles.drawerTitle__dark : styles.drawerTitle, { marginBottom: 8 }]}>
              No chats yet
            </Text>
            <Text style={isDark ? styles.emptyText__dark : styles.emptyText}>
              Start a conversation to see your chat history here
            </Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={item => item.chat_uuid}
            renderItem={renderChatItem}
            style={styles.linksList}
            contentContainerStyle={styles.linksListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() => {
            setAlertVisible(false)
            setAlertConfig(null)
          }}
          colorScheme={colorScheme}
        />
      )}
      
      {/* Custom Toast */}
      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
        colorScheme={colorScheme}
      />
    </View>
  )
}

export default ChatHistoryDrawer