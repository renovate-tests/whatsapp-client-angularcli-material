import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const getChatsQuery = gql`
  query GetChats($amount: Int) {
    chats {
      __typename,
      id,
      name,
      picture,
      allTimeMembers {
        __typename,
        id,
      },
      unreadMessages,
      messages(amount: $amount) {
        __typename,
        id,
        sender {
          __typename,
          id,
          name,
        },
        content,
        createdAt,
        type,
        recipients {
          __typename,
          user {
            __typename,
            id,
          },
          message {
            __typename,
            id,
          },
          receivedAt,
          readAt,
        },
        ownership,
      },
      isGroup,
    }
  }
`;
