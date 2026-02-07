import "./MainLayout.css";
import { Box, CssBaseline } from "@mui/material";
import Nav from "./Nav";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <CssBaseline />
      <Nav />
      <Outlet />
    </Box>
  );
}
