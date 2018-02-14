import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const getChatQuery = gql`
  query GetChat($chatId: ID!) {
    chat(chatId: $chatId) {
      __typename,
      id,
      name,
      picture,
      isGroup,
      messages {
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
    }
  }
`;
