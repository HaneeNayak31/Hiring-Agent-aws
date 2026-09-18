from pathlib import Path

# Base directory for the backend (HR_Agents/backend)
BASE_DIR = Path(__file__).resolve().parent.parent

METADATA_FILE = BASE_DIR / "plugin_metadata.json"
PLUGIN_ZIPS_DIR = BASE_DIR / "plugin_zips"
PLUGINS_DIR = BASE_DIR / "plugins"
SKILLS_DIR = BASE_DIR / "skills"
