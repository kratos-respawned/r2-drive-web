import { Link } from "@tanstack/react-router";

export const NotFound = () => {
  return (
    <div className="grid place-items-center w-full h-screen">
      <div className="flex flex-col items-center gap-4">
        <img src="/404.png" alt="404" className="w-48 h-48" />
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-lg">The page you are looking for does not exist.</p>
        <Link to="/" className="text-primary">
          Go to home
        </Link>
      </div>
    </div>
  );
};
