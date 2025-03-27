import { promises as fs } from 'fs';
import * as path from 'path';

export class MediaOrganizer {
  private directoryPath: string;

  constructor(directoryPath: string) {
    if (!path.isAbsolute(directoryPath)) {
      throw new Error('O caminho do diretório deve ser absoluto');
    }

    this.directoryPath = path.resolve(directoryPath);
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
    const folders = {
      audio: ['.mp3', '.wav', '.flac'],
      image: ['.jpg', '.jpeg', '.png', '.gif'],
      video: ['.mp4', '.avi', '.mov', '.mkv']
    };

    try {

      for (const [folderName, exts] of Object.entries(folders)) {
        const hasFiles = (await this.getFileExtensions()).some(ext => exts.includes(ext))

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
    const folders = {
      audio: ['.mp3', '.wav', '.flac'],
      image: ['.jpg', '.jpeg', '.png', '.gif'],
      video: ['.mp4', '.avi', '.mov', '.mkv']
    }

    try {
      const files = await this.readDirectory();

      for (const file of files) {
        const fileExtension = path.extname(file);
        const fileName = path.basename(file);

        for (const [folderName, exts] of Object.entries(folders)) {
          if (exts.includes(fileExtension)) {
            const folderPath = path.join(this.directoryPath, folderName.charAt(0).toUpperCase() + folderName.slice(1));
            let destinationPath = path.join(folderPath, fileName);

            let copyIndex = 1;
            while (await this.fileExists(destinationPath)) {
              const baseName = path.basename(file, fileExtension);
              destinationPath = path.join(folderPath, `${baseName}(${copyIndex})${fileExtension}`);
              const [name, extension] = fileName.split('.');
              destinationPath = path.join(folderPath, `${name}_copy(${copyIndex}).${extension}`);
              copyIndex++;
            }

            await fs.rename(path.join(this.directoryPath, fileName), destinationPath);
            console.log(`Arquivo ${fileName} movido para ${destinationPath}`);
            break
          }
        }
      }
    } catch (error) {
      throw new Error(`Erro ao mover arquivos: ${error}`);
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false
    }
  }
}
