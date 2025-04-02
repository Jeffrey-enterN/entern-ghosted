import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import LoadingMascot from "../components/LoadingMascot";

export default function NotFound() {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 pb-8">
          <div className="flex flex-col items-center mb-4">
            <div className="mb-4">
              <LoadingMascot size="md" message="Oops! Page not found." />
            </div>
            
            <h1 className="text-2xl font-bold text-indigo-600 mt-4">404 - Ghost Tamer Lost</h1>
            
            <p className="mt-4 text-center text-sm text-gray-600">
              Our ghost tamer seems to have wandered off the path! Let's get you back to a page that exists.
            </p>
            
            <Button 
              className="mt-6" 
              onClick={() => setLocation("/")}
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
