import { Outlet } from "react-router-dom";

export default function BrowseRoute({ children }) {
  return children || <Outlet />;
}
