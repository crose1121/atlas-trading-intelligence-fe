from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import Optional

app = FastAPI()

# Allow local dev origins (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


@app.post("/metrics")
async def metrics(file: UploadFile = File(...)):
    # Enforce size limit where possible
    try:
        # Try to determine size from underlying file object
        try:
            file.file.seek(0, 2)
            size = file.file.tell()
            file.file.seek(0)
        except Exception:
            size = None

        if size is not None and size > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="Uploaded file is too large")

        # Read CSV from uploaded file and compute simple metrics
        try:
            df = pd.read_csv(file.file)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"failed to parse CSV: {e}")

        row_count = len(df)
        columns = {col: str(dtype) for col, dtype in zip(df.columns, df.dtypes)}
        numeric_summary = df.select_dtypes(include=["number"]).describe().to_dict()

        return {
            "row_count": row_count,
            "columns": columns,
            "numeric_summary": numeric_summary,
        }
    except HTTPException:
        raise
    except Exception as e:
        # Unexpected error
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)