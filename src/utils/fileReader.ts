import {promises as fs} from 'fs';


export class MediaOrganizer {
  private directoryPath: string;

  constructor(directoryPath: string) {
    this.directoryPath = directoryPath;
  }

   async readDirectory(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.directoryPath);
      return files;
    } catch (error ) {
      throw new Error(`Erro ao ler diretório: ${error}`);
    }
  }
}