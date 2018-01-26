import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const chatAddedSubscription = gql`
  subscription chatAdded {
    chatAdded {
      id,
      __typename,
      name,
      picture,
      userIds,
      unreadMessages,
      lastMessage {
        id,
        __typename,
        senderId,
        sender {
          id,
          __typename,
          name,
        },
        content,
        createdAt,
        type,
        recipients {
          id,
          __typename,
          receivedAt,
          readAt,
        },
        ownership,
      },
      isGroup,
    }
  }
`;
