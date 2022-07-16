import {ensureDirSync, ensureFile, existsSync, lstat, lstatSync} from 'fs-extra';
import {readFile, writeFile} from 'fs/promises';
import {pack, unpack} from 'jsonpack';

/**
 * Check that a directory exists. If it does not, create the directory. Double check before
 * finishing that the directory was indeed created and is a directory. Will throw an error if the
 * given directory path is actually a file or if the directory wasn't successfully created.
 */
export function checkDir(dirPath: string): void {
    ensureDirSync(dirPath);
    if (!existsSync(dirPath) || !lstatSync(dirPath).isDirectory()) {
        throw new Error(`Failed to create directory at ${dirPath}`);
    }
}

/**
 * Check that a file exists. If it does not, create the file. Double check before finishing that the
 * file was indeed created and is a file (not a directory). Will throw an error if the given file
 * path is actually a directory or if the file wasn't successfully created.
 */
export async function checkFile(filePath: string) {
    await ensureFile(filePath);
    if (!existsSync(filePath) || !(await lstat(filePath)).isFile()) {
        throw new Error(`Failed to create file at ${filePath}`);
    }
}

export async function readPackedJson(filePath: string): Promise<unknown> {
    if (!existsSync(filePath)) {
        throw new Error(`Tried to read file that does not exist: ${filePath}`);
    }

    const fileContents = (await readFile(filePath)).toString();
    if (!fileContents.trim()) {
        return undefined;
    }
    try {
        const unpackedContents = unpack(fileContents) as unknown;
        return unpackedContents;
    } catch (error) {
        // fallback to normal JSON parsing
        return JSON.parse(fileContents);
    }
}

export async function writePackedJson(filePath: string, data: any): Promise<void> {
    const packedContents = pack(data);
    await writeFile(filePath, packedContents);
}
