import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Project Swap</title>
        <meta
          name="description"
          content="Solana"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
