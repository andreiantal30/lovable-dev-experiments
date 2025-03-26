
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CampaignManager from "./pages/CampaignManager";
import CampaignLibrary from "./pages/CampaignLibrary";
import CampaignDetail from "./pages/CampaignDetail";
import { CampaignSidebarProvider } from "./components/CampaignSidebarProvider";
import { useEffect } from "react";

function App() {
  // Add more detailed logging
  console.log("App component rendering");
  console.log("Index component:", Index);
  
  useEffect(() => {
    console.log("App component mounted");
    console.log("Environment:", {
      NODE_ENV: import.meta.env.MODE,
      BASE_URL: import.meta.env.BASE_URL,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    });
    
    return () => {
      console.log("App component unmounted");
    };
  }, []);
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <CampaignSidebarProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/manager" element={<CampaignManager />} />
            <Route path="/library" element={<CampaignLibrary />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-center" richColors closeButton />
      </CampaignSidebarProvider>
    </ThemeProvider>
  );
}

export default App;
