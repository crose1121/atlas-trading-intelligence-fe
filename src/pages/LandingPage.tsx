import { Box, Typography } from "@mui/material";
import UploadWindow from "../components/common/UploadWindow";

export default function LandingPage() {
  return (
    <Box
      sx={{
        // p: 4,
        textAlign: "center",
        minWidth: "100%",
        minHeight: "100vh",
        backgroundColor: "var(--header-bg)",
        boxSizing: "border-box",
        paddingTop: "1rem",
        color: "var(--header-text)",
      }}
    >
      <Typography variant="h3" gutterBottom>
        Welcome to the CSV Analyzer
      </Typography>
      <UploadWindow
        onLoad={(text, file) => {
          console.log("File loaded:", file?.name);
          console.log("Content preview:", text.slice(0, 100));
        }}
      />
    </Box>
  );
}
