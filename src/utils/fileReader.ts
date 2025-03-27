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
    try {
      const stats = await fs.stat(this.directoryPath);

      if (!stats.isDirectory()) {
        throw new Error('O caminho informado não é um diretório');
      }

      const files = await fs.readdir(this.directoryPath);
      return files;
    } catch (error) {
      throw new Error(`Erro ao ler diretório: ${error}`);
    }
  }

  async getFileExtensions(): Promise<string[]> {
    try {
      const files = await this.readDirectory();
      const extensions = files.map(file => path.extname(file))
      return extensions;
    } catch (error) {
      throw new Error(`Erro ao obter extensões dos arquivos: ${error}`);
    }
  }

  async createFolders(): Promise<void> {
    const folders = this.getFolderMapping(); 

    try {
      const files = await this.readDirectory();
      const extensions = files.map(file => path.extname(file));

      for (const [folderName, exts] of Object.entries(folders)) {
        const hasFiles = extensions.some(ext => exts.includes(ext))

        if (hasFiles) {
          const folderPath = path.join(this.directoryPath, folderName.charAt(0).toUpperCase() + folderName.slice(1));
          try {
            await fs.access(folderPath);
          } catch {
            await fs.mkdir(folderPath);
            console.log(`Pasta ${folderPath} criada com sucesso`);
          }
        }
      }

    } catch (error) {
      throw new Error(`Erro ao criar pastas: ${error}`);
    }

  }

  async moveFiles(): Promise<void> {
    const folders = this.getFolderMapping();

    try {
      const files = await this.readDirectory();

      for (const file of files) {
        const sanitizedFile = path.basename(file)
        const fileExtension = path.extname(file);

        const folderName = Object.keys(folders).find(key => folders[key as keyof typeof folders].includes(fileExtension))

        if (folderName) {
          const folderPath = path.join(this.directoryPath, folderName.charAt(0).toUpperCase() + folderName.slice(1));
          let destinationPath = path.join(folderPath, sanitizedFile);

          if (!destinationPath.startsWith(this.directoryPath)) {
            throw new Error('Tentativa de acesso fora do diretório');
          }

          destinationPath = await this.getUniqueFilePath(destinationPath)

          await fs.rename(path.join(this.directoryPath, sanitizedFile), destinationPath);
          console.log(`Arquivo ${sanitizedFile} movido para ${destinationPath}`);
        }

      }
    } catch (error) {
      throw new Error(`Erro ao mover arquivos: ${error}`);
    }
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
}
