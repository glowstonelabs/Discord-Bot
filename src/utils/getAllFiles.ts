// src/utils/getAllFiles.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively get all files in a directory
 * @param directory - The directory to search
 * @param foldersOnly - Whether to return only folders
 * @returns Array of file or folder paths
 */
export default function getAllFiles(directory: string, foldersOnly = false): string[] {
  // Ensure directory exists
  if (!fs.existsSync(directory)) {
    console.warn(`Directory not found: ${directory}`);
    return [];
  }

  // Read directory contents
  const fileStats = fs.readdirSync(directory, { withFileTypes: true });

  // Map directory entries to full paths
  let files = fileStats.map((file) => path.join(directory, file.name));

  if (foldersOnly) {
    return files.filter((file) => fs.statSync(file).isDirectory());
  }

  return files.filter((file) => {
    const stats = fs.statSync(file);
    return stats.isFile() && path.extname(file) === '.ts';
  });
}
