import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const addGroupMutation = gql`
  mutation AddGroup($recipientIds: [ID!]!, $groupName: String!) {
    addGroup(recipientIds: $recipientIds, groupName: $groupName) {
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
