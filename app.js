const express = require("express");
const { graphqlHTTP } = require("express-graphql");

const schema = require('./schema/schema');

const app = express();

// request made to this supercharged endpoint 
// express hands over the request to the express graphql function
// having an empty object as response in the express graphql function will throw an error
// {errors: message: {"GraphQL middleware options must contain a schema."}}
// because it requires a schma to work

// Express Graphql needs to know the following;
// the data types on the graph
// the properties of those data types 
// the relationships between the data types 
// the schema represents how the graph looks or basically the structure of the graph
app.use("/graphql", graphqlHTTP({
    schema: schema, // defines the graph and object types of our graph
    graphiql: true
}));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`)
});