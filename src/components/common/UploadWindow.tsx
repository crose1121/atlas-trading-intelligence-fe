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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import useCsvUploader from "../../hooks/useCsvUploader";

import Papa from "papaparse";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
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

  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"histogram" | "line">("histogram");
  // compute basic CSV metrics client-side when file is loaded (PapaParse)
  async function handleOnLoad(text: string, file?: File) {
    try {
      if (!file) throw new Error("No file provided");

      const parsed = Papa.parse<Record<string, any>>(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      const data = (parsed.data || []) as Record<string, any>[];
      const headers = parsed.meta.fields || [];
      const row_count = data.length;

      const columns: Record<string, string> = {};
      const numeric_summary: Record<string, Record<string, number>> = {};

      headers.forEach((h) => {
        const vals = data.map((r) => r[h]);
        const nonEmpty = vals.filter(
          (v) => v !== null && v !== undefined && v !== "",
        );
        const numVals = nonEmpty.filter(
          (v) => typeof v === "number",
        ) as number[];
        const isNumeric =
          nonEmpty.length > 0 && numVals.length === nonEmpty.length;

        columns[h] = isNumeric ? "number" : "string";

        if (isNumeric) {
          const count = numVals.length;
          const sum = numVals.reduce((a, b) => a + b, 0);
          const mean = count ? sum / count : 0;
          const min = Math.min(...numVals);
          const max = Math.max(...numVals);
          numeric_summary[h] = { count, sum, mean, min, max };
        }
      });

      setParsedData(data);
      setSelectedColumn(headers[0] ?? null);
      setMetrics({
        row_count,
        columns,
        numeric_summary: Object.keys(numeric_summary).length
          ? numeric_summary
          : undefined,
      });
    } catch (e: unknown) {
      console.error("Processing failed", e);
      const message = e instanceof Error ? e.message : String(e);
      setMetrics({ error: message });
      setParsedData([]);
      setSelectedColumn(null);
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

  const renderPreview = () => {
    if (!parsedData || parsedData.length === 0) return null;
    const cols = Object.keys(parsedData[0] || {});
    const rows = parsedData.slice(0, 5);
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {cols.map((c) => (
                <TableCell key={c}>{c}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                {cols.map((c) => (
                  <TableCell key={c + i}>{String(r[c] ?? "")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const buildChartData = () => {
    if (!selectedColumn || parsedData.length === 0) return [];
    const vals = parsedData
      .map((r) => r[selectedColumn])
      .filter((v) => v !== null && v !== undefined);

    const numericVals = vals.filter((v) => typeof v === "number") as number[];
    if (chartType === "histogram") {
      if (numericVals.length > 0) {
        const min = Math.min(...numericVals);
        const max = Math.max(...numericVals);
        const binCount = 10;
        const binSize = (max - min) / binCount || 1;
        const bins = Array.from({ length: binCount }, (_, i) => ({
          name: `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`,
          count: 0,
        }));
        numericVals.forEach((v) => {
          const idx = Math.min(binCount - 1, Math.floor((v - min) / binSize));
          bins[idx].count++;
        });
        return bins;
      }

      const counts: Record<string, number> = {};
      vals.forEach((v) => {
        const k = String(v);
        counts[k] = (counts[k] || 0) + 1;
      });
      return Object.entries(counts).map(([k, v]) => ({ name: k, count: v }));
    }

    if (numericVals.length > 0) {
      return parsedData
        .map((r, i) => ({
          index: i,
          value:
            typeof r[selectedColumn] === "number" ? r[selectedColumn] : null,
        }))
        .filter((d) => d.value !== null);
    }
    return [];
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

              {renderPreview()}

              {parsedData.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Charts</Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel id="col-select-label">Column</InputLabel>
                      <Select
                        labelId="col-select-label"
                        value={selectedColumn ?? ""}
                        label="Column"
                        onChange={(e) =>
                          setSelectedColumn(e.target.value || null)
                        }
                      >
                        {Object.keys(metrics.columns || {}).map((c) => (
                          <MenuItem value={c} key={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel id="chart-type-label">Chart</InputLabel>
                      <Select
                        labelId="chart-type-label"
                        value={chartType}
                        label="Chart"
                        onChange={(e) => setChartType(e.target.value as any)}
                      >
                        <MenuItem value="histogram">Histogram</MenuItem>
                        <MenuItem value="line">Line</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "histogram" ? (
                        <BarChart data={buildChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={"name"} />
                          <YAxis />
                          <ReTooltip />
                          <Bar dataKey={"count"} fill="#1976d2" />
                        </BarChart>
                      ) : (
                        <LineChart data={buildChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={"index"} />
                          <YAxis />
                          <ReTooltip />
                          <Line
                            type="monotone"
                            dataKey={"value"}
                            stroke="#1976d2"
                            dot={false}
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
