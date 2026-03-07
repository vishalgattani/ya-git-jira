#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="gitj"
WRAPPER_NAME="gitj"

# --- Find a writable bin directory on PATH under $HOME ---

find_bin_dir() {
    # Prefer ~/.local/bin if it exists and is on PATH
    if [ -d "$HOME/.local/bin" ]; then
        case ":$PATH:" in
            *":$HOME/.local/bin:"*) echo "$HOME/.local/bin"; return 0 ;;
        esac
    fi

    # Search PATH for any directory under $HOME
    IFS=: read -ra path_dirs <<< "$PATH"
    for dir in "${path_dirs[@]}"; do
        case "$dir" in
            "$HOME"/*)
                if [ -d "$dir" ] && [ -w "$dir" ]; then
                    echo "$dir"
                    return 0
                fi
                ;;
        esac
    done

    # Fall back to creating ~/.local/bin
    echo ""
    return 1
}

# --- Main ---

echo "Building Docker image '$IMAGE_NAME'..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
docker build -t "$IMAGE_NAME" "$SCRIPT_DIR"
echo ""

BIN_DIR=$(find_bin_dir) || true

if [ -z "$BIN_DIR" ]; then
    BIN_DIR="$HOME/.local/bin"
    echo "No bin directory found under \$HOME on your PATH."
    echo "Creating $BIN_DIR ..."
    mkdir -p "$BIN_DIR"
    echo ""
    echo "WARNING: $BIN_DIR is not on your PATH."
    echo "Add this to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
    echo ""
    echo "    export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
fi

WRAPPER="$BIN_DIR/$WRAPPER_NAME"

cat > "$WRAPPER" << 'SCRIPT'
#!/usr/bin/env bash
exec docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e HOME="$HOME" \
  -v "$HOME:$HOME" \
  -v "$(pwd):$(pwd)" -w "$(pwd)" \
  gitj "$@"
SCRIPT

chmod +x "$WRAPPER"

echo "Installed $WRAPPER"
echo ""
echo "Usage:"
echo "  gitj --version"
echo "  gitj jira start BUG-42"
echo "  gitj lab merge active"
echo "  gitj --help-all"
