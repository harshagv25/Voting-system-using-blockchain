import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { VoiceProvider } from "@/context/VoiceContext";
import { Layout } from "@/components/Layout";

// Pages
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import VerifyAadhaar from "@/pages/VerifyAadhaar";
import Vote from "@/pages/Vote";
import Results from "@/pages/Results";
import Blockchain from "@/pages/Blockchain";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/verify-aadhaar" component={VerifyAadhaar} />
        <Route path="/vote" component={Vote} />
        <Route path="/results" component={Results} />
        <Route path="/blockchain" component={Blockchain} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VoiceProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </VoiceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
