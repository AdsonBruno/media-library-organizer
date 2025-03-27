import { promises as fs } from 'fs';
import * as path from 'path';

export class MediaOrganizer {
  private directoryPath: string;

  constructor(directoryPath: string) {
    if (!path.isAbsolute(directoryPath)) {
      throw new Error('O caminho do diretório deve ser absoluto');
    }

    this.directoryPath = path.resolve(directoryPath);

    fs.access(this.directoryPath).catch(() => {
      throw new Error(`O diretório ${this.directoryPath} não existe`);
    })
  }

  async readDirectory(): Promise<string[]> {
    
    return this.handlerAsync(
      async () => {
        const stats = await fs.stat(this.directoryPath);

        if (!stats.isDirectory()) {
          throw new Error('O caminho informado não é um diretório');
        }

        const files = await fs.readdir(this.directoryPath);
        return files;
      },
      `Erro ao ler diretório ${this.directoryPath}`
    )
  }

  async getFileExtensions(): Promise<string[]> {

    return this.handlerAsync(
      async () => {
        const files = await this.readDirectory();
        const extensions = files.map(file => path.extname(file));
        return extensions;
      }, 
      'Erro ao obter extensões dos arquivos'
    )
  }

  async createFolders(): Promise<void> {
    const folders = this.getFolderMapping(); 

    return this.handlerAsync(
      async () => {
        const files = await this.readDirectory();
        const extensions = files.map(file => path.extname(file));

        for (const [folderName, exts] of Object.entries(folders)) {
          if (this.hasFilesWithExtensions(exts, extensions)) {
            const folderPath = this.getFolderPath(folderName);

            await this.createFolderIfNotExists(folderPath);
            console.log(`Pasta ${folderPath} criada com sucesso`);
          }
        }
      },
      'Erro ao criar pastas'
    )

  }

  async moveFiles(): Promise<void> {
    const folders = this.getFolderMapping();

    await this.handlerAsync(
      async () => {
        const files = await this.readDirectory();

        for (const file of files) {
          const sanitizedFile = path.basename(file);
          const fileExtension = path.extname(file);

          const folderName = Object.keys(folders).find(key => folders[key as keyof typeof folders].includes(fileExtension));

          if (folderName) {
            const folderPath = this.getFolderPath(folderName);
            let destinationPath = path.join(folderPath, sanitizedFile);

            if (!destinationPath.startsWith(this.directoryPath)) {
              throw new Error('Tentativa de acesso fora do diretório');
            }

            destinationPath = await this.getUniqueFilePath(destinationPath);

            await fs.rename(path.join(this.directoryPath, sanitizedFile), destinationPath);
            console.log(`Arquivo ${sanitizedFile} movido para ${destinationPath}`);
          }
        }
      },
      'Erro ao mover arquivos'
    )
  }

  private async getUniqueFilePath(filePath: string): Promise<string> {
    let uniquePath = filePath;
    let copyIndex = 1;

    while (await this.fileExists(uniquePath)) {
      const dir = path.dirname(filePath);
      const ext = path.extname(filePath);
      const baseName = path.basename(filePath, ext);

      uniquePath = path.join(dir, `${baseName}_copy(${copyIndex})${ext}`);
      copyIndex++;
    }

    return uniquePath;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false
    }
  }

  private getFolderMapping(): Record<string, string[]> {
    return {
      audio: ['.mp3', '.wav', '.flac'],
      image: ['.jpg', '.jpeg', '.png', '.gif'],
      video: ['.mp4', '.avi', '.mov', '.mkv']
    }
  }

  private async handlerAsync<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw new Error(`${errorMessage}: ${error}`);
    }
  }

  private hasFilesWithExtensions(extensions: string[], fileExtensions: string[]): boolean {
    return fileExtensions.some(ext => extensions.includes(ext));
  }

  private getFolderPath(folderName: string): string {
    return path.join(this.directoryPath, folderName.charAt(0).toUpperCase() + folderName.slice(1));
  }

  private async createFolderIfNotExists(folderPath: string): Promise<void> {
    try {
      await fs.access(folderPath);
    } catch {
      await fs.mkdir(folderPath);
      console.log(`Pasta ${folderPath} criada com sucesso`);
    }
  }
}
