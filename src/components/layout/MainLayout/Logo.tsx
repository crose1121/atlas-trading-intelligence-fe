import logo from "../../../assets/logo.png";
import { Box } from "@mui/material";

type LogoProps = {
  size?: number;
  alt?: string;
  className?: string;
  showText?: boolean;
};

export default function Logo({
  size = 120,
  alt = "site logo",
  className,
}: LogoProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <img src={logo} alt={alt} className={className} style={{ width: size }} />
    </Box>
  );
}
