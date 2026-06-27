from fastapi import FastAPI

app = FastAPI(title="Address Book API")


@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running in Docker."}
