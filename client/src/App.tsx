import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Reports from "@/pages/Reports";
import NewReport from "@/pages/NewReport";
import GhostGuard from "@/components/GhostGuard";

interface AppProps {
  isExtension?: boolean;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reports" component={Reports} />
      <Route path="/report" component={NewReport} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App({ isExtension = false }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {isExtension ? (
        <GhostGuard />
      ) : (
        <Router />
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
