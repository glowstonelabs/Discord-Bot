import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Recursively gets all files or folders from a directory.
 * @param {string} directory - The directory to read from.
 * @param {boolean} [foldersOnly=false] - Whether to return only folders.
 * @returns {string[]} An array of file or folder paths.
 */
const getAllFiles = (directory: string, foldersOnly: boolean = false): string[] => {
  const fileNames: string[] = [];

  try {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(directory, file.name);

      if (foldersOnly) {
        if (file.isDirectory()) {
          fileNames.push(filePath);
        }
      } else {
        if (file.isFile()) {
          fileNames.push(filePath);
        } else if (file.isDirectory()) {
          fileNames.push(...getAllFiles(filePath, foldersOnly));
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
  }

  return fileNames;
};

export default getAllFiles;
