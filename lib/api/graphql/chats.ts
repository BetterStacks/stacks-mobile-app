import { gql } from '@apollo/client'

export type Chat = {
  chat_uuid: string
  created_at: string
  id: string
  title: string
  updated_at: string
  chat_messages?: ChatMessage[]
  ai_contexts?: AIContext[]
}

export type ChatMessage = {
  chat_message_uuid: string
  content: string
  created_at: string
  id: string
  metadata?: any
  role: 'user' | 'assistant'
  updated_at: string
}

export type AIContext = {
  context_type: string | null
  contextable_id: string | null
  contextable_type: string | null
  created_at: string
  id: string
  updated_at: string
  // We keep contextable as any because it is a union of many fragments
  contextable: any
}

// --------------------
// Queries
// --------------------

export const QUERY_CHATS = () => gql`
  query Chats {
    chats (page: 1, perPage: 800) {
      chat_uuid
      created_at
      id
      title
      updated_at
    }
  }
`

export const QUERY_CHAT = (chatUuid: string) => gql`
  query Chat {
    chat(chatUuid: "${chatUuid}") {
      chat_uuid
      created_at
      id
      title
      updated_at
      chat_messages {
        chat_message_uuid
        content
        created_at
        id
        metadata
        role
        updated_at
      }
      ai_contexts {
        context_type
        contextable_id
        contextable_type
        created_at
        id
        updated_at
        contextable {
          ... on Link {
            favicon_url
            link_content
            link_type
            summary
            target_url
            title
            link_description: description
          }
          ... on Collection {
            collection_description: description
            cover_image_url
            created_at
            emoji
            id
            links_count
            parent_id
            pinned
            public_profile_collection_link
            public_visible
            share_preference
            shared_link
            show_map
            slug
            title
            updated_at
            visual_order
          }
          ... on UserPage {
            page_content: content
            id
          }
          ... on QuickNote {
            color
            note_content: content
            created_at
            id
            updated_at
          }
          ... on MediaFile {
            blurhash
            category
            file_url
            filename
            id
            metadata
            preview_url
            thumbnail_url
          }
        }
      }
    }
  }
`

export const QUERY_CHAT_MESSAGES = (chatUuid: string) => gql`
  query Chat_messages {
    chat_messages(chatUuid: "${chatUuid}", page: 1, perPage: 2000) {
      chat_message_uuid
      content
      created_at
      id
      metadata
      role
      updated_at
    }
  }
`

export const QUERY_AI_CONTEXTS = (chatUuid: string) => gql`
  query Ai_contexts {
    ai_contexts(chatUuid: "${chatUuid}") {
      context_type
      contextable_id
      contextable_type
      created_at
      id
      updated_at
      contextable {
        ... on Link {
          favicon_url
          link_content
          link_type
          summary
          target_url
          title
          link_description: description
        }
        ... on Collection {
          collection_description: description
          cover_image_url
          created_at
          emoji
          id
          links_count
          parent_id
          pinned
          public_profile_collection_link
          public_visible
          share_preference
          shared_link
          show_map
          slug
          title
          updated_at
          visual_order
        }
        ... on UserPage {
          page_content: content
          id
        }
        ... on QuickNote {
          color
          note_content: content
          created_at
          id
          updated_at
        }
        ... on MediaFile {
          blurhash
          category
          file_url
          filename
          id
          metadata
          preview_url
          thumbnail_url
        }
      }
    }
  }
`

// --------------------
// Mutations
// --------------------

export const MUTATION_CREATE_CHAT = () => gql`
  mutation Create_chat($title: String!, $first_message_content: String!, $first_message_role: String!, $chat_id: String!) {
    create_chat(input: {title: $title, first_message_content: $first_message_content, first_message_role: $first_message_role, chat_id: $chat_id}) {
      chat_uuid
      created_at
      id
      title
      updated_at
    }
  }
`

export const MUTATION_ADD_CHAT_MESSAGE = () => gql`
  mutation Add_chat_message($chat_uuid: String!, $content: String!, $role: String!, $metadata: JSON) {
    add_chat_message(input: {content: $content, chat_uuid: $chat_uuid, role: $role, metadata: $metadata}) {
      chat_message_uuid
      content
      created_at
      id
      metadata
      role
      updated_at
    }
  }
`

export const MUTATION_ADD_AI_CONTEXT = () => gql`
  mutation Add_ai_context($chat_uuid: String!, $context_type: String!, $contextable_type: String!, $contextable_id: ID!) {
    add_ai_context(input: {chat_uuid: $chat_uuid, context_type: $context_type, contextable_type: $contextable_type, contextable_id: $contextable_id}) {
      context_type
      contextable_id
      contextable_type
      created_at
      id
      updated_at
      contextable {
        ... on Link {
          favicon_url
          link_content
          link_type
          summary
          target_url
          title
          link_description: description
          id
        }
        ... on Collection {
          collection_description: description
          cover_image_url
          created_at
          emoji
          id
          links_count
          parent_id
          pinned
          public_profile_collection_link
          public_visible
          share_preference
          shared_link
          show_map
          slug
          title
          updated_at
          visual_order
        }
        ... on UserPage {
          page_content: content
          id
        }
        ... on QuickNote {
          color
          note_content: content
          created_at
          id
          updated_at
        }
        ... on MediaFile {
          blurhash
          category
          file_url
          filename
          id
          metadata
          preview_url
          thumbnail_url
        }
      }
    }
  }
`

export const MUTATION_DELETE_CHAT = () => gql`
  mutation Delete_chat($chat_uuid: String!) {
    delete_chat(input: {chat_uuid: $chat_uuid})
  }
`