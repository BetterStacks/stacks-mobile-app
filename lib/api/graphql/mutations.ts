import { gql } from "@apollo/client";

export const MUTATION_SIGNIN = gql`
  mutation (
    $email: String
    $app_id: String
    $password: String
    $provider: String!
  ) {
    sign_in_user(
      input: {
        provider: $provider
        password: $password
        email: $email
        app_id: $app_id
      }
    ) {
      token
      user {
        name
        id
        email
        profile_image_url
        provider
        phone
        identities {
          provider
          uid
          valid_token
        }
      }
    }
  }
`;

export const MUTATION_SIGNUP = gql`
  mutation (
    $provider: String!
    $app_id: String
    $name: String
    $email: String
    $password: String
  ) {
    sign_up_user(
      input: {
        provider: $provider
        app_id: $app_id
        name: $name
        email: $email
        password: $password
      }
    ) {
      token
      user {
        name
        __typename
      }
      __typename
    }
  }
`;

export const MUTATION_RECOVERY_PASSWORD = gql`
  mutation ($email: String!) {
    user_forgot_passoword(input: { email: $email })
  }
`;

export const MUTATION_DELETE_LINK = gql`
  mutation ($link_id: ID!) {
    delete_link(input: { link_id: $link_id })
  }
`;

export const MUTATION_BOOKMARK_UPLOAD_FILE = gql`
  mutation ($file: Upload!, $source: String) {
    upload_bookmark_file(input: { file: $file, source: $source }) {
      file_id
      bookmarks {
        url
        title
        date
        tags
        image_url
        icon
        isChecked
      }
    }
  }
`;

export const MUTATION_PROCESS_BOOKMARK_FILE = gql`
  mutation ($bookmark_file_id: ID!, $bookmarks: String!) {
    process_bookmark_file(
      input: { bookmark_file_id: $bookmark_file_id, bookmarks: $bookmarks }
    )
  }
`;

export const MUTATION_FETCH_BOOKMARKS_IMAGES_FILE = gql`
  mutation ($bookmarks: String!) {
    fetch_bookmarks_images_file(input: { bookmarks: $bookmarks }) {
      bookmarks {
        url
        title
        date
        tags
        image_url
        isChecked
      }
    }
  }
`;

export const MUTATION_ADD_SHARING_PREFERENCE = gql`
  mutation ($sharing_preference: String!, $link_id: String!) {
    add_share_preference(
      input: { sharing_preference: $sharing_preference, link_id: $link_id }
    )
  }
`;

export const MUTATION_ADD_NOTES = gql`
  mutation ($notes: String!, $linkId: String!) {
    add_notes(input: { notes: $notes, linkId: $linkId }) {
      notes
    }
  }
`;

export const MUTATION_ADD_LINK = gql`
  mutation ($target_url: String!, $collection_ids: [ID!]) {
    add_link(
      input: { target_url: $target_url, collection_ids: $collection_ids }
    ) {
      id
      target_url
      description
      title
      image_url
      latitude
      longitude
      created_at
      favicon_url
      notes
      collections {
        id
        name: title
        emoji
      }
    }
  }
`;

export const MUTATION_ADD_NEW_COLLECTION = gql`
  mutation ($collection: String!, $linkId: String) {
    add_new_collection(input: { collection: $collection, linkId: $linkId })
  }
`;

export const MUTATION_UPDATE_COLLECTION = gql`
  mutation ($collection: CollectionInput!) {
    update_collection(input: { collection: $collection }) {
      name: title
      slug
      links_count
      share_preference
    }
  }
`;

export const MUTATION_UPDATE_REPOSITORY = gql`
  mutation ($repository: RepositoryInput!) {
    update_repository(input: { repository: $repository }) {
      id
      name
    }
  }
`;

export const MUTATION_ADD_LINK_TO_COLLECTION = gql`
  mutation ($collection: String!, $linkId: String!) {
    add_link_to_collection(input: { collection: $collection, linkId: $linkId })
  }
`;
export const MUTATION_REMOVE_LINK_FROM_COLLECTION = gql`
  mutation ($collection: String!, $linkId: String!) {
    remove_link_from_collection(
      input: { collection: $collection, linkId: $linkId }
    )
  }
`;

export const MUTATION_REMOVE_LINKS_WITH_COLLECTION = gql`
  mutation ($collectionId: String!) {
    remove_links_with_collection(input: { collectionId: $collectionId })
  }
`;

export const MUTATION_REMOVE_COLLECTION = gql`
  mutation ($collectionId: String!) {
    remove_collection(input: { collectionId: $collectionId })
  }
`;

export const MUTATION_ADD_LINK_TO_REPOSITORIES = gql`
  mutation ($repository_ids: [String!]!, $link_id: String!) {
    add_repositories_link(
      input: { repository_ids: $repository_ids, link_id: $link_id }
    )
  }
`;

export const MUTATION_UPLOAD_PROFILE_IMAGE = gql`
  mutation ($file: Upload!) {
    upload_profile_image(input: { file: $file })
  }
`;
export const MUTATION_UPLOAD_COLLECTION_COVER_IMAGE = gql`
  mutation ($file: Upload!, $collection: String!) {
    upload_collection_cover_image(
      input: { file: $file, collection: $collection }
    )
  }
`;

export const MUTATION_UPLOAD_USER_FILES = gql`
  mutation ($files: [Upload!]) {
    add_files(input: { files: $files })
  }
`;

export const MUTATION_SUBSCRIBE_NOTIFICATION = gql`
  mutation ($token: String!, $device_type: String!) {
    subscribe_notification_token(
      input: { token: $token, device_type: $device_type }
    )
  }
`;

// export const addLink = /* GraphQL */ `
// mutation($target_url: String!){
//   add_link(input: {target_url: $target_url}){
//     target_url
//       id
//       title
//       description
//       image_url
//       latitude
//       longitude
//   }
// }
// `

export const MUTATION_ADD_SUBSCRIPTION = gql`
  mutation ($plan_name: String!, $stripe_session_id: String!) {
    add_plan(
      input: { plan_name: $plan_name, stripe_session_id: $stripe_session_id }
    ) {
      id
      status
      plan {
        id
        name
        limits
      }
    }
  }
`;

export const MUTATION_UPDATE_USER = gql`
  mutation ($name: String!, $phone: String!) {
    update_user(input: { name: $name, phone: $phone }) {
      name
      phone
    }
  }
`;

export const MUTATION_ADD_MEMBER_TO_REPOSITORY = gql`
  mutation ($email: String!, $repository_id: ID!, $name: String) {
    add_repository_member(
      input: { email: $email, repository_id: $repository_id, name: $name }
    ) {
      id
      name
      members {
        id
        name
        email
        is_invite_pending
      }
    }
  }
`;

export const MUTATION_REMOVE_MEMBERS_FROM_REPOSITORY = gql`
  mutation ($member_ids: [ID!]!, $repository_id: ID!) {
    remove_members_from_repository(
      input: { member_ids: $member_ids, repository_id: $repository_id }
    ) {
      id
      name
      repository_type
    }
  }
`;
export const MUTATION_ADD_LINK_TO_REPOSITORY = gql`
  mutation ($link_id: String!, $repository_id: String!) {
    add_repository_link(
      input: { link_id: $link_id, repository_id: $repository_id }
    )
  }
`;

export const MUTATION_ADD_COMPANION = gql`
  mutation ($companion_code: String!) {
    add_companion(input: { companion_code: $companion_code })
  }
`;

export const MUTATION_CHANGE_PASSWORD = gql`
  mutation ($password: String!, $password_confirmation: String!) {
    change_user_password(
      input: {
        password: $password
        password_confirmation: $password_confirmation
      }
    )
  }
`;

export const MUTATION_CHANGE_USER_EMAIL = gql`
  mutation ($email: String!) {
    change_user_email(input: { email: $email })
  }
`;

export const MUTATION_CONFIRM_EMAIL_CHANGE = gql`
  mutation ($confirmation_token: String!) {
    confirm_user_email_change(
      input: { confirmation_token: $confirmation_token }
    )
  }
`;

export const MUTATION_ENABLE_NOTIFICATIONS = gql`
  mutation (
    $name: String!
    $phone: String!
    $is_notification_enabled: Boolean
  ) {
    update_user(
      input: {
        name: $name
        phone: $phone
        is_notification_enabled: $is_notification_enabled
      }
    ) {
      name
      phone
      is_notification_enabled
    }
  }
`;

export const MUTATION_DELETE_ACCOUNT = gql`
  mutation ($confirm_text: String!) {
    delete_account(input: { confirm_text: $confirm_text })
  }
`;

export const MUTATION_ADD_REMINDER = gql`
  mutation ($viewing_preference: String!, $link_id: String!) {
    add_view_later_preference(
      input: { viewing_preference: $viewing_preference, link_id: $link_id }
    ) {
      id
    }
  }
`;

export const MUTATION_CONNECT_SOCIAL = gql`
  mutation ($provider: String!, $app_id: String, $oauth_token: String!) {
    oauth_connect(
      input: { provider: $provider, app_id: $app_id, oauth_token: $oauth_token }
    ) {
      id
      identities {
        provider
        uid
        user {
          id
          name
        }
        valid_token
      }
    }
  }
`;

export const MUTATION_DISCONNECT_SOCIAL = gql`
  mutation ($provider: String!, $identity_id: ID!, $app_id: String) {
    oauth_disconnect(
      input: { provider: $provider, identity_id: $identity_id, app_id: $app_id }
    ) {
      id
    }
  }
`;

export const MUTATION_UPDATE_LINK = gql`
  mutation Update_link(
    $link_id: String!
    $title: String
    $description: String
    $notes: String
    $target_url: String
    $tags: [String!]
    $collection_ids: [ID!]
  ) {
    update_link(
      input: {
        link_id: $link_id
        title: $title
        description: $description
        notes: $notes
        target_url: $target_url
        tags: $tags
        collection_ids: $collection_ids
      }
    ) {
      id
      tags
      title
      notes
      collections {
        id
        name: title
        emoji
      }
    }
  }
`;
