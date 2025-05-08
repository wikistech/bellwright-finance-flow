
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-finance-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-finance-primary mb-6">404</h1>
        <p className="text-xl text-finance-text mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-finance-muted mb-8">
          It seems you've found a broken link or entered a URL that doesn't exist on our site.
        </p>
        <Button asChild className="bg-finance-primary hover:bg-finance-secondary">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
