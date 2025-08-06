import React from 'react';
import Head from 'next/head';
import Chatbot from '../components/Chatbot';

export default function Home() {
  return (
    <>
      <Head>
        <title>FueliX Bot - Tab Interface</title>
        <meta name="description" content="FueliX Bot chatbot interface for tabs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="h-screen bg-white">
        <Chatbot />
      </div>
    </>
  );
}
