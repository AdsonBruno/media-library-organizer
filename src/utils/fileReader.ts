import {promises as fs} from 'fs';
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

      if(!stats.isDirectory()) {
        throw new Error('O caminho informado não é um diretório');
      }

      const files = await fs.readdir(this.directoryPath);
      return files;
    } catch (error ) {
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
}