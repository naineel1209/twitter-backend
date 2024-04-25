const typeDefs = `#graphql

scalar Date
scalar BigInt

type User {
  id: BigInt!
  email: String!
  password: String # You might not expose this publicly for security reasons
  name: String
  username: String!
  profilePic: String
  bio: String
  dob: Date
  createdAt: Date
  tweets: [Tweet] # Relationship with Tweet
}

# Define the type for Tweet with fields and relationships
type Tweet {
  id: BigInt!
  title: String!
  content: String
  published: Boolean
  impressions: Int
  createdAt: Date
  userId: BigInt! # Relationship with User
  user: User! # Relationship with User
}

# Define the queries for fetching data
type Query {
  getUsers: [User] # Fetch all users
  getUser(id: BigInt!): User # Fetch a specific user by BigInt
  getTweets: [Tweet] # Fetch all tweets
  getTweet(id: BigInt!): Tweet # Fetch a specific tweet by BigInt
}

# Define mutations for creating or modifying data
type Mutation {
  createUser(email: String!, password: String!, username: String!,
  name: String,  profilePic: String, bio: String, dob: String): User # Create a new user
  updateUser(id: BigInt!, name: String, username: String, profilePic: String, bio: String, dob: String): User # Update a user
  createTweet(title: String!, content: String!): Tweet # Create a new tweet
  updateTweet(id: BigInt!, title: String, content: String, published: Boolean, impressions: Int): Tweet # Update a tweet
  deleteTweet(id: BigInt!): Tweet # Delete a tweet
  deleteUser(id: BigInt!): User # Delete a user and all their tweets
}
`

export default typeDefs;