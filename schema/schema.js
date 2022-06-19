const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema, 
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = require("graphql");
const _ = require("lodash");

const Book = require("../models/Book");
const Author = require("../models/Author");


// the schema describes the following 

// - Every book has an author 
// - Every author has a collection of books
// - We can translate the above using TYPE RELATIONS

// the fields for object definition are wrapped in a function because
// at the time the graphql server runs each of the object types which have references to
// other types will be stored in memory with their values
// so if an object type is defined after it has been referenced by another object type
// then it will throw a reference error and crash the server
// if each object type is wrapped in a function that returns a object
// the function is only saved to memory when the server spins up
// and the function will only run when query is made for that object type which will then
// execute the function it has
// the reason why it isnt the same for the rootQuery is because the code is executed from top
// to bottom and all other types which the rootQuery embodies have already been defined 
// before they were referenced in the rootQuery, so that is a valid approach.


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
                // return _.find(authors, { id: parent.authorId });
                console.log("author id ", typeof parent.authorId)

                return Author.findById(parent.authorId);  
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
            // type: BookType, // returns a single entry,
            type: new GraphQLList(BookType), // returns a list by filtering with the query
            resolve(parent, args) {
                // console.log(parent);

                // return _.filter(books, { authorId: parent.id })

                return Book.find({ authorId: parent.id });
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
                // const res = _.find(books, { id: args.id });
                // return res

                return Book.findById(args.id);
            }
        },
        author: {
            type: AuthorType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args) {
                // return _.find(authors, { id: args.id });
                return Author.findById(args.id);
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args) { // we wont be using any of these params in this case
                // return books
                return Book.find({});
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args) {
                return Author.find({});
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: { // this will let us store the different kind of mutations we want to make
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt)  }
            },
            resolve(parent, args) {
                let { name, age } = args;

                let author = new Author({
                    name,
                    age
                });

                return author.save();
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                })

                return book.save();
            }
        }
    }
});


module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
