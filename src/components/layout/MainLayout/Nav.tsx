import React from "react";
import { AppBar, Box, Link, Toolbar, Typography } from "@mui/material";
import Logo from "./Logo";

const Nav: React.FC = () => {
  return (
    <AppBar
      position="static"
      sx={{
        paddingY: 1,
        fontSize: 19,
        backgroundColor: "var(--header-bg)",
        color: "var(--header-text)",
        borderBottom: "3px solid var(--primary)",
      }}
      elevation={0}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            gap: "24px",
            justifyContent: "flex-start",
          }}
        >
          <Logo size={150} alt="Site Logo" className="logo" />
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "var(--primary)",
              fontSize: "2.5rem",
              mb: 0.5,
              textAlign: "center",
            }}
          >
            Atlas Trading Intelligence
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            gap: "148px",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingRight: "24px",
          }}
        >
          <Link href="#" underline="none" sx={{ color: "var(--primary)" }}>
            About ATI
          </Link>
          <Link href="#" underline="none" sx={{ color: "var(--primary)" }}>
            Log In
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Nav;
