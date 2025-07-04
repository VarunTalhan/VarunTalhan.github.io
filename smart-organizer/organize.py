import os
import argparse
from pathlib import Path
import shutil

parser = argparse.ArgumentParser(description="Smart File Organizer")
parser.add_argument("--src", required=True, help="Source folder to organize")
parser.add_argument("--dest",required=False, help ="The destination of files" )
args = parser.parse_args()

src_path = Path(args.src).expanduser().resolve()
  #path(aegs.src) creates a path object pointing to whatever the user type with --src

  #expanduser() if the path begins with ~ it replaces it with your actual home directory

  #resolve() turns path into absolute path

if args.dest:
  dest_path= Path(args.dest).expanduser().resolve()
else:
  dest_path = src_path

if not src_path.exists():
  print("Source folder does not exist")
  exit(1)

if not dest_path.exists():
    print(f"Destination folder does not exist: {dest_path}")
    exit(1)


for file in src_path.iterdir():
  if file.is_file():
    print(file.name)

#Define extension

EXTENSIONS = {
    "Images": [".jpg", ".jpeg", ".png", ".gif"],
    "Documents": [".pdf", ".docx", ".txt"],
    "Code": [".py", ".js", ".html", ".css"],
    "Archives": [".zip", ".rar", ".tar"],
    "Media": [".mp4", ".mp3", ".mov"]
}

def get_category(file_path):
    ext = file_path.suffix.lower()
    for category, exts in EXTENSIONS.items():
        if ext in exts:
            return category
    return "Others"  # Outside the loop — only if no match found.

  
for file in src_path.iterdir():
  if file.is_file():
    category = get_category(file)
    print(f"{file.name} -> {category}")

for file in src_path.iterdir():
    if file.is_file():
        category = get_category(file)
        target_dir = dest_path / category
        target_dir.mkdir(exist_ok=True)

        destination = target_dir / file.name
        counter=1

        file_stem = file.stem
        file_suffix= file.suffix

        while destination.exists():
          new_name = f"{file_stem}_{counter}{file_suffix}"
          destination = target_dir / new_name 
          counter +=1

    

try:
    shutil.move(str(file), str(destination))
    print(f"Moved {file.name} → {category}/")
except PermissionError:
    print(f"Skipped locked file: {file.name}")
