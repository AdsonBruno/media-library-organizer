import { MediaOrganizer } from './utils/fileReader';

const directoryPath = 'C:/Users/adson_disparopro/Documents/programacao/estudo/midias-teste'
const organizer = new MediaOrganizer(directoryPath);

async function main() {

  try {
    await organizer.createFolders()
    console.log('Pastas criadas com sucesso')
  } catch (error) {
    console.error(error)
  }
}
main()