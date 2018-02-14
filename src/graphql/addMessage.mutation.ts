import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const addMessageMutation = gql`
  mutation AddMessage($chatId: ID!, $content: String!) {
    addMessage(chatId: $chatId, content: $content) {
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
    }
  }
`;
