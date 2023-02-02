import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express';
import { Resolvers } from './generated/graphql';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { initializeApp } from "firebase/app";
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';

const firebaseConfig = {
    apiKey: "AIzaSyCIQUWhbCz-Gsir-kAvp9ManvI83PItFAM",
    authDomain: "apollo-exercise-2023.firebaseapp.com",
    projectId: "apollo-exercise-2023",
    storageBucket: "apollo-exercise-2023.appspot.com",
    messagingSenderId: "874427320168",
    appId: "1:874427320168:web:3d907c8b77625ec472f8dd"
};

initializeApp(firebaseConfig)

const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

const getBooks = async () => {
  const recentBooksQuery = query(collection(getFirestore(), 'books'));
  return await getDocs(recentBooksQuery).then((value)=> {
    console.log(value)
    return value.docs.map(doc => doc.data())
  })
}

const addBook = async (_, {title, author}) => {
  try {
    const bookDoc = await addDoc(collection(getFirestore(), 'books'), {
      title,
      author
    }).then(value => {
      return value
    })
    console.log(bookDoc)
  } catch (error) {
    console.error('error creating book')
  }
}

export const resolvers = {
    Query: {
      books: getBooks,
      hello: (_, { name }) => `Hello ${name}`
    },
    Mutation: {
      addBook
    }
};

const app = express()
const httpServer = http.createServer(app)

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start()

app.use(
  cors(),
  bodyParser.json(),
  expressMiddleware(server),
);

const port = 4040;

await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
console.log(`🚀 Server ready at http://localhost:${port}`);
