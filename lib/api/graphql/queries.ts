import { gql } from "@apollo/client";

export const QUERY_LINKS = gql`
  query QUERY_LINKS(
    $page: Int
    $domain: String!
    $query: String
    $repositoryId: ID
    $withAnnotations: Boolean
    $withNotes: Boolean
  ) {
    links(
      page: $page
      domain: $domain
      query: $query
      repositoryId: $repositoryId
      withAnnotations: $withAnnotations
      withNotes: $withNotes
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
      tags
      views
      stacks
      broken
      sharing_preference
      link_content
      annotations {
        created_at
        id
        selected_text
        annotation_comments {
          comment
          id
          author {
            email
            id
            image_url
            name
          }
        }
        author {
          email
          id
          image_url
          name
        }
      }
      user {
        id
        email
        profile_image_url
        name
      }
      is_user_page
      is_quick_note
      collections {
        id
        cover_image_url
        name: title
        slug
        emoji
      }
      user_repositories {
        id
        name
        repository_type
      }
    }
  }
`;

export const QUERY_LINK = gql`
  query QUERY_LINK($id: ID!) {
    link(id: $id) {
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
      views
      stacks
      broken
      sharing_preference
      collections {
        id
        name: title
        slug
      }
      user_repositories {
        id
        name
        repository_type
      }
    }
  }
`;

export const QUERY_PAGES = gql`
  query QUERY_PAGES($className: String!, $domain: String!) {
    pages(className: $className, domain: $domain) {
      total_count
      total_pages
    }
  }
`;

export const QUERY_STACK_PAGES = gql`
  query QUERY_STACK_PAGES(
    $className: String!
    $domain: String!
    $stackName: String!
  ) {
    pages(className: $className, domain: $domain, stackName: $stackName) {
      total_count
      total_pages
    }
  }
`;

export const QUERY_DOMAIN_LINKS = gql`
  query QUERY_DOMAIN_LINKS {
    domain_links_count {
      domain
      count
    }
  }
`;
export const QUERY_DOMAIN_LINKS_BY_STACKID = gql`
  query QUERY_DOMAIN_LINKS_BY_STACKID($stackID: ID!) {
    domain_links_count(stackId: $stackID) {
      domain
      count
    }
  }
`;

export const QUERY_MAP_LOCATIONS = gql`
  query {
    places {
      id
      latitude
      longitude
      link {
        id
        target_url
        description
        title
        image_url
        latitude
        longitude
        created_at
        stacks
        views
        broken
        rating {
          ratings_count
          average_rating
        }
        favicon_url
        collections {
          id
          name: title
        }
      }
    }
  }
`;

export const QUERY_RECENT_LINKS = gql`
  query QUERY_RECENT_LINKS {
    links(recent: true) {
      id
      target_url
      description
      title
      image_url
      latitude
      longitude
      created_at
      favicon_url
      stacks
      views
      broken
      collections {
        id
        name: title
      }
    }
  }
`;

export const QUERY_STACK_LINKS = gql`
  query QUERY_STACK_LINKS(
    $page: Int
    $stackID: ID!
    $domain: String
    $repositoryId: ID
  ) {
    stack(id: $stackID) {
      id
      name
      links(page: $page, domain: $domain, repositoryId: $repositoryId) {
        id
        target_url
        description
        title
        image_url
        latitude
        longitude
        created_at
        stacks
        views
        broken
        sharing_preference
        rating {
          ratings_count
          average_rating
        }
        favicon_url
        notes
        collections {
          id
          name: title
        }
        user_repositories {
          id
          name
          repository_type
        }
      }
    }
  }
`;

export const QUERY_STACK_LINKS_RECENT = gql`
  query ($stackID: ID!, $query: String, $repositoryId: ID) {
    stack(id: $stackID) {
      id
      name
      links(recent: true, query: $query, repositoryId: $repositoryId) {
        id
        target_url
        description
        title
        image_url
        latitude
        longitude
        created_at
        stacks
        views
        broken
        sharing_preference
        rating {
          ratings_count
          average_rating
        }
        favicon_url
        notes
        collections {
          id
          name: title
        }
        user_repositories {
          id
          name
          repository_type
        }
      }
    }
  }
`;

export const QUERY_STACKS = gql`
  query QUERY_STACKS {
    stacks {
      id
      name
      slug
      links_count
    }
  }
`;

export const QUERY_COLLECTIONS = gql`
  query Collections($query: String, $repositoryId: ID) {
    collections(query: $query, repositoryId: $repositoryId) {
      id
      title
      slug
      links_count
      cover_image_url
      share_preference
      description
      created_at
      emoji
      pinned
      public_visible
      shared_link
      public_profile_collection_link
      visual_order
      parent_id
      repositories {
        id
        name
        repository_member_limit
        repository_type
      }
    }
  }
`;

export const QUERY_COLLECTION = (id: any) => gql`
  query {
    collection(id: "${id}") {
      name: title
      slug
      links_count
      share_preference
    }
  }
`;
export const QUERY_COLLECTION_LINKS = gql`
  query QUERY_COLLECTION_LINKS($page: Int, $collectionId: ID!) {
    stack: collection(id: $collectionId) {
      id
      name: title
      slug
      links(page: $page) {
        id
        target_url
        description
        title
        image_url
        latitude
        longitude
        created_at
        stacks
        views
        broken
        sharing_preference
        rating {
          ratings_count
          average_rating
        }
        favicon_url
        notes
        collections {
          id
          name: title
        }
        user_repositories {
          id
          name
          repository_type
        }
      }
    }
  }
`;

export const QUERY_COLLECTION_PAGES = (stack_id: any) => gql`
  query($className: String!) {
    stack: collection( id: "${stack_id}"){
      pages(className: $className) {
        total_count
        total_pages
      }
    }
  }
`;

export const QUERY_SEARCH_LINKS = gql`
  query ($page: Int, $query: String, $domain: String) {
    links(query: $query, page: $page, domain: $domain) {
      id
      target_url
      description
      title
      link_content
      image_url
      latitude
      longitude
      created_at
      stacks
      views
      broken
      sharing_preference
      rating {
        ratings_count
        average_rating
      }
      favicon_url
      collections {
        id
        name: title
      }
      user_repositories {
        id
        name
        repository_type
      }
    }
  }
`;

export const QUERY_SEARCH_PAGES = (query: any) => gql`
  query($className: String!) {
    pages( query: "${query}", className: $className ) {
      total_count
      total_pages
    }
  }
`;

export const QUERY_USER = gql`
  query QUERY_USER {
    user {
      id
      email
      description
      name
      profile_image_url
      username
      job_title
      provider
      phone
      companion_share_link
      is_notification_enabled
      unconfirmed_email
      confirmation_token
      unique_identity_id
      tags
      ai_tokens {
        ai_preferred_model
        ai_provider
        id
        token
      }
      identities {
        id
        provider
        uid
        valid_token
        label
      }
      spouse {
        id
      }
    }
  }
`;

export const QUERY_USER_REPOSITORIES = gql`
  query QUERY_USER_REPOSITORIES {
    user {
      id
      name
      repositories {
        user {
          id
        }
        id
        name
        repository_type
        repository_member_limit
        members {
          id
          name
          is_invite_pending
          profile_image_url
          email
          phone
        }
      }
    }
  }
`;

export const QUERY_SUBSCRIPTIONS = gql`
  query QUERY_SUBSCRIPTIONS {
    user {
      id
      active_subscriptions {
        id
        plan {
          name
        }
        status
      }
    }
  }
`;

export const QUERY_PLACES = gql`
  query QUERY_PLACES {
    places(query: "*") {
      id
      latitude
      longitude
      link {
        broken
        created_at
        description
        domain
        favicon_url
        id
        image_url
        latitude
        longitude
        notes
        price
        read_time
        sharing_preference
        stacks
        tags
        target_url
        title
        updated_at
        viewing_preference
        views
      }
    }
  }
`;

export const QUERY_FAQ = gql`
  query QUERY_FAQ {
    faqs {
      question
      answer
    }
  }
`;

export const QUERY_QUICK_LINKS = gql`
  query Quick_links {
    quick_links {
      domain
      id
      subdomain
      target_url
      title
    }
  }
`;
