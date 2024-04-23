const typeDefs = `#graphql

type User {
  id: ID!
  email: String!
  password: String! # You might not expose this publicly for security reasons
  name: String
  username: String!
  profilePic: String
  bio: String
  dob: String
  createdAt: String
  tweets: [Tweet] # Relationship with Tweet
}

# Define the type for Tweet with fields and relationships
type Tweet {
  id: ID!
  title: String!
  content: String
  published: Boolean
  impressions: Int
  createdAt: String
  userId: ID! # Relationship with User
  user: User! # Relationship with User
}

# Define the queries for fetching data
type Query {
  getUsers: [User] # Fetch all users
  getUser(id: ID!): User # Fetch a specific user by ID
  getTweets: [Tweet] # Fetch all tweets
  getTweet(id: ID!): Tweet # Fetch a specific tweet by ID
}

# Define mutations for creating or modifying data
type Mutation {
  createUser(email: String!, password: String!, username: String!,
  name: String,  profilePic: String, bio: String, dob: String): User # Create a new user
  updateUser(id: ID!, name: String, username: String, profilePic: String, bio: String, dob: String): User # Update a user
  createTweet(title: String!, content: String!, userId: ID!): Tweet # Create a new tweet
  updateTweet(id: ID!, title: String, content: String, published: Boolean, impressions: Int): Tweet # Update a tweet
  deleteTweet(id: ID!): Tweet # Delete a tweet
  deleteUser(id: ID!): User # Delete a user and all their tweets
}
`

export default typeDefs;