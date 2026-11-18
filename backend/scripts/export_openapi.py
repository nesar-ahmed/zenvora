import json
from pathlib import Path

from app.main import app


def main() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    output = backend_dir / "openapi.json"
    output.write_text(
        json.dumps(app.openapi(), indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
