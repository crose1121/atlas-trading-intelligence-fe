import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import useCsvUploader from "../../hooks/useCsvUploader";

type Props = {
  onLoad?: (text: string, file?: File) => void;
};

export default function UploadWindow({ onLoad }: Props) {
  type Metrics = {
    error?: string;
    row_count?: number;
    columns?: Record<string, string>;
    numeric_summary?: Record<string, Record<string, number>>;
  };

  const [metrics, setMetrics] = useState<Metrics | null>(null);

  // post to backend when file is loaded
  async function handleOnLoad(text: string, file?: File) {
    try {
      if (!file) throw new Error("No file provided");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("http://localhost:8000/metrics", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Server responded ${res.status}`);
      }

      const data = await res.json();
      setMetrics(data as Metrics);
    } catch (e: unknown) {
      console.error("Upload failed", e);
      const message = e instanceof Error ? e.message : String(e);
      setMetrics({ error: message });
    }

    onLoad?.(text, file);
  }

  const { fileName, isLoading, handleFileUpload } =
    useCsvUploader(handleOnLoad);

  // Helpers to render metrics
  const renderColumns = (cols: Record<string, string>) => (
    <TableContainer component={Paper} sx={{ mt: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Column</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(cols).map(([name, dtype]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell>{dtype}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderNumericSummary = (
    num: Record<string, Record<string, number>>,
  ) => {
    const cols = Object.keys(num || {});
    if (cols.length === 0) return null;
    const stats = Object.keys(num[cols[0]] || {});

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Stat</TableCell>
              {cols.map((c) => (
                <TableCell key={c}>{c}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((s) => (
              <TableRow key={s}>
                <TableCell>{s}</TableCell>
                {cols.map((c) => (
                  <TableCell key={c + s}>
                    {typeof num[c][s] === "number"
                      ? Number(num[c][s]).toLocaleString()
                      : String(num[c][s])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Button variant="contained" component="label">
        Upload CSV
        <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
      </Button>
      {fileName && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {isLoading ? "Reading..." : `Loaded: ${fileName}`}
        </Typography>
      )}

      {metrics && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Metrics</Typography>
          {metrics.error ? (
            <Typography color="error" sx={{ mt: 1 }}>
              {metrics.error}
            </Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  mt: 1,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 2fr",
                  },
                }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2">Rows</Typography>
                    <Typography variant="h6">{metrics.row_count}</Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="subtitle2">Columns</Typography>
                    <Typography variant="body2">
                      {Object.keys(metrics.columns || {}).length} columns
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {metrics.columns && renderColumns(metrics.columns)}

              {metrics.numeric_summary &&
                renderNumericSummary(metrics.numeric_summary)}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
