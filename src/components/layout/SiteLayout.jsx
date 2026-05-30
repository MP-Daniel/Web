import { Outlet } from "react-router-dom";
import { SiteFooter } from "./SiteFooter";
import { TopBar } from "./TopBar";

export function SiteLayout() {
  return (
    <>
      <TopBar />
      <Outlet />
      <SiteFooter />
    </>
  );
}
