import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';
import './App.css';
import DeepseekChat from './components/DeepseekChat';
import DeepseekChatStream from './components/DeepseekChatStream';

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <header className="App-header">
          <h1>DeepSeek API Demo</h1>
        </header>
        <main>
          <div className="container">
            <h2>标准聊天</h2>
            <DeepseekChat />
            
            <h2>流式聊天</h2>
            <DeepseekChatStream />
          </div>
        </main>
      </div>
    </ApolloProvider>
  );
}

export default App;