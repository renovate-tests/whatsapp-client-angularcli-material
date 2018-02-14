import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const chatAddedSubscription = gql`
  subscription chatAdded {
    chatAdded {
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
