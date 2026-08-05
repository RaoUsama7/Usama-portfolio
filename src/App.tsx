import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <>
      <LoadingProvider>
        <Suspense>
          <MainContainer>
            <Suspense>
              <CharacterModel />
            </Suspense>
          </MainContainer>
        </Suspense>
      </LoadingProvider>
      {/* Tier 4: @vercel/analytics was already a dependency but was never
          mounted, so nothing was being measured. SpeedInsights reports field
          Core Web Vitals (LCP/INP/CLS) from real visits. */}
      <Analytics />
      <SpeedInsights />
    </>
  );
};

export default App;
