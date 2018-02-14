import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const addChatMutation = gql`
  mutation AddChat($recipientId: ID!) {
    addChat(recipientId: $recipientId) {
      __typename,
      id,
      name,
      picture,
      allTimeMembers {
        __typename,
        id,
      },
      unreadMessages,
      messages {
        __typename,
        id,
        content,
      },
      isGroup,
    }
  }
`;
