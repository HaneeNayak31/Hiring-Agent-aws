import base64
import json
from pathlib import Path
from .paths import METADATA_FILE, PLUGIN_ZIPS_DIR


def load_plugin_metadata(metadata_file: Path = METADATA_FILE) -> dict:
    """
    Load plugin metadata from plugin_metadata.json.

    This file is the single source of truth for:
    - plugin names
    - skill source folders
    - plugin descriptions
    """
    if not metadata_file.exists():
        raise FileNotFoundError(
            f"Plugin metadata file not found:\n{metadata_file}"
        )

    with open(metadata_file, "r", encoding="utf-8") as f:
        return json.load(f)


# Alias for backward compatibility
load_metadata = load_plugin_metadata


def load_plugins(metadata_file: Path = METADATA_FILE, plugin_zips_dir: Path = PLUGIN_ZIPS_DIR) -> list:
    """
    Load all plugin ZIPs and construct the
    OpenAI-hosted inline plugin configuration.
    """
    metadata = load_plugin_metadata(metadata_file)

    plugins = []

    for plugin_name, config in metadata.items():
        zip_path = plugin_zips_dir / f"{plugin_name}.zip"

        if not zip_path.exists():
            raise FileNotFoundError(
                f"""
Plugin ZIP not found:

{zip_path}

Run:

    python prepare_plugins.py

before starting the agent.
"""
            )

        description = config["description"]

        print(f"Loading plugin: {plugin_name}", flush=True)

        # Read ZIP
        zip_data = zip_path.read_bytes()

        # Convert ZIP to base64
        encoded_zip = base64.b64encode(zip_data).decode("utf-8")

        # OpenAI hosted inline plugin
        plugin = {
            "type": "inline",
            # MUST match plugin.json
            "name": plugin_name,
            # MUST match plugin.json
            "description": description,
            "source": {
                "type": "base64",
                "media_type": "application/zip",
                "data": encoded_zip,
            },
        }

        plugins.append(plugin)

    return plugins

