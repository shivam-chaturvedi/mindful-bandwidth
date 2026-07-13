import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BandwidthProvider } from "@/context/BandwidthContext";
import Onboarding from "./pages/Onboarding";
import Intro from "./pages/Intro";
import Quiz from "./pages/Quiz";
import QuizResults from "./pages/QuizResults";
import Game1Priority from "./pages/Game1Priority";
import Game2Impulse from "./pages/Game2Impulse";
import Game3Stress from "./pages/Game3Stress";
import Game4Social from "./pages/Game4Social";
import Results from "./pages/Results";
import Interventions from "./pages/Interventions";
import AICoach from "./pages/AICoach";
import DailyCheckIn from "./pages/DailyCheckIn";
import Breathing from "./pages/Breathing";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import TodaysReset from "./pages/TodaysReset";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BandwidthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Onboarding />} />
              <Route path="/intro" element={<Intro />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/quiz-results" element={<QuizResults />} />
              <Route path="/home" element={<Home />} />
              <Route path="/ai-coach" element={<AICoach />} />
              <Route path="/game/1" element={<Game1Priority />} />
              <Route path="/game/2" element={<Game2Impulse />} />
              <Route path="/game/3" element={<Game3Stress />} />
              <Route path="/game/4" element={<Game4Social />} />
              <Route path="/results" element={<Results />} />
              <Route path="/todays-reset" element={<TodaysReset />} />
              <Route path="/interventions" element={<Interventions />} />
              <Route path="/checkin" element={<DailyCheckIn />} />
              <Route path="/breathing" element={<Breathing />} />
              <Route path="/community" element={<Community />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BandwidthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
