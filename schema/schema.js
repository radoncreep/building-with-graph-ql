const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema, 
    GraphQLID,
    GraphQLInt
} = require("graphql");
const _ = require("lodash");

// dummy data
const books = [
    { name: "Name of the Wind", genre: "Fantasy", id: '4', authorId: '1'},
    { name: "The Final Empire", genre: "Fantasy", id: '2', authorId: '2' },
    { name: "The Long Earth", genre: "Sci-Fi", id: '3', authorId: '3' },
    { name: "The Hero of Ages", genre: "Fantasy", id: '1', authorId: '1'},
    { name: "The Color of Magic", genre: "Fantasy", id: '5', authorId: '3' },
    { name: "The Light Fantastic", genre: "Sci-Fi", id: '6', authorId: '2' }
];

const authors = [
    { name: "Patrick Rothfuss", age: 44, id: '1'},
    { name: "Brandon Sanderson", age: 42, id: '2'},
    { name: "Tery Pratchett", age: 66, id: '3'}
];

// the schema describes the following 

// - Every book has an author 
// - Every author has a collection of books
// - We can translate the above using TYPE RELATIONS

// ENTITY/OBJECT TYPE DEFINITION  
const BookType = new GraphQLObjectType({
    name: "Book",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
            type: AuthorType,
            resolve(parent, args) { // this is responsible for looking at the actual data and return what is needed
                // we want to use it to tell graphql which author corresponds to this book
                // console.log(parent);
                return _.find(authors, { id: parent.authorId });
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: "Author",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        book: {
            type: BookType,
            resolve(parent, args) {
                // console.log(parent);

                return _.find(books, { authorId: parent.id })
            }
        }
    })
});

// how we initially jummp into the graph
// defining root queries or QUERY TYPE to retrieve data from the graph
// each root query has the responsibility of issuing queries to objects
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: { // emboides  options with root queries
        book: { // root query with prop name 'book' will be used on the client-side to as the query name
            type: BookType,
            args: { id: { type: GraphQLID } }, // parses the args from the client to know the exact query issued just like params
            resolve(parent, args) {
                // code to get data from db or other source
                // parent is used for data relationships
                // args contains porps like id to grab data of that object type from a resource
                const res = _.find(books, { id: args.id });
                return res
            }
        },
        author: {
            type: AuthorType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args) {
                return _.find(authors, { id: args.id });
            }
        }
    }
})


module.exports = new GraphQLSchema({
    query: RootQuery
})