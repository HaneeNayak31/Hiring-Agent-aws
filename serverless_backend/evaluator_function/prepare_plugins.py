import shutil
import json
from pathlib import Path

from utils import (
    SKILLS_DIR,
    PLUGINS_DIR,
    PLUGIN_ZIPS_DIR,
    load_metadata,
)


def prepare_plugins():

    metadata = load_metadata()

    # ------------------------------------------
    # Validate metadata
    # ------------------------------------------

    for plugin_name, config in metadata.items():

        source_name = config["source"]

        skill_path = SKILLS_DIR / source_name

        if not skill_path.exists():
            raise FileNotFoundError(
                f"Skill not found: {skill_path}"
            )

    # ------------------------------------------
    # Clean old generated files
    # ------------------------------------------

    if PLUGINS_DIR.exists():
        shutil.rmtree(PLUGINS_DIR)

    if PLUGIN_ZIPS_DIR.exists():
        shutil.rmtree(PLUGIN_ZIPS_DIR)

    PLUGINS_DIR.mkdir()
    PLUGIN_ZIPS_DIR.mkdir()

    # ------------------------------------------
    # Create plugins
    # ------------------------------------------

    for plugin_name, config in metadata.items():

        source_name = config["source"]
        description = config["description"]

        print(f"\n{source_name}")
        print(f"  -> {plugin_name}")

        plugin_dir = (
            PLUGINS_DIR / plugin_name
        )

        codex_dir = (
            plugin_dir / ".codex-plugin"
        )

        codex_dir.mkdir(
            parents=True
        )

        # --------------------------------------
        # Copy skill
        # --------------------------------------

        target_skill_dir = (
            plugin_dir
            / "skills"
            / plugin_name
        )

        shutil.copytree(
            SKILLS_DIR / source_name,
            target_skill_dir
        )

        # --------------------------------------
        # Create manifest
        # --------------------------------------

        manifest = {
            "name": plugin_name,
            "version": "1.0.0",
            "description": description,
            "skills": "./skills/"
        }

        manifest_path = (
            codex_dir / "plugin.json"
        )

        with open(
            manifest_path,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                manifest,
                f,
                indent=2
            )

        # --------------------------------------
        # Create ZIP
        # --------------------------------------

        zip_base = (
            PLUGIN_ZIPS_DIR / plugin_name
        )

        archive_path = shutil.make_archive(
            str(zip_base),
            "zip",
            root_dir=PLUGINS_DIR,
            base_dir=plugin_name
        )

        print(f"  ZIP: {archive_path}")

    print("\nAll plugins prepared successfully.")


if __name__ == "__main__":
    prepare_plugins()