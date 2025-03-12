import Header from "./Header";
import Button from "./Button";
import TitleBox from "./TitleBox";
import Performance from "./Performance";
import Overview from "./Overview";
import Holdings from "./Holdings";
import { useState } from "react";
import Trade from "./Trade";
import ApiTest from "./ApiTest";
import { PortfolioProvider } from './context/PortfolioContext';
import Forum from "./Forum"; // Import the Forum component

function App() {
  const [tab, setTab] = useState("portfolio");

  return (
    <PortfolioProvider>
      <Header />
      <hr className="mt-0 mb-4 border-t border-gray-300 w-full mx-auto" />
      <div className="ml-42">
        <Button
          name="Portfolio"
          state={tab}
          width="30"
          content="Portfolio"
          onClick={() => setTab("portfolio")}
        />
        <Button
          name="Trade"
          content="Trade"
          state={tab}
          width="30"
          onClick={() => setTab("trade")}
        />
        <Button
          name="Forum"
          content="Forum"
          state={tab}
          width="30"
          onClick={() => setTab("forum")}
        />
      </div>
      <TitleBox />
      <hr className="mt-4 border-t border-gray-300 w-4/5 mx-auto " />
      {tab === "portfolio" ? (
        <div>
          <div className="flex w-full space-x-8 mt-10">
            <Performance />
            <Overview />
          </div>
          <hr className="mt-4 border-t border-gray-300 w-4/5 mx-auto " />
          <Holdings />
        </div>
      ) : tab === "trade" ? (
        <div>
          <Trade />
        </div>
      ) : (
        <div>
          <Forum />
        </div>
      )}
      <div className="mt-8">
        <ApiTest />
      </div>
    </PortfolioProvider>
  );
}

export default App;
