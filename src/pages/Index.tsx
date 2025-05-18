
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to dashboard from the root path
  return <Navigate to="/" replace />;
};

export default Index;
