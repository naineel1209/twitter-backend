# twitter-backend

- basic twitter backend implementation using graphql and typescript. 
- includes - custom graphql error responder, custom http error responder
- all with a combined power of authentication using google-oauth developed in bare manner - without using any 3rd party libraries
- supports all the kind of authentication processes like login, logout, register (if not exist)
- postgresql database used for data persistence
- prisma was used an an ORM to ease-up the querying the database
- extensive usage of prisma modelling, migrating to keep up with the changes made in the database
- not super secure for bare username and password users (i forgot to hash the passwords lol... (┬┬﹏┬┬))
