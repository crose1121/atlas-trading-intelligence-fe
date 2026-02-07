import { Box } from "@mui/material";

export default function LandingPage() {
  return (
    <Box
      sx={{
        textAlign: "center",
        minWidth: "100%",
        minHeight: "100vh",
        backgroundColor: "var(--header-bg)",
        boxSizing: "border-box",
        paddingTop: "1rem",
      }}
    >
      <h1>Welcome to Atlas Trading Intelligence</h1>
    </Box>
  );
}
