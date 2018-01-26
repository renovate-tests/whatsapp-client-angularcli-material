import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const messageAddedSubscription = gql`
  subscription messageAdded($chatId: ID) {
    messageAdded(chatId: $chatId) {
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
      chatId,
    }
  }
`;
