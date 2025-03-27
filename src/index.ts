import {MediaOrganizer} from './utils/fileReader';

const directoryPath = 'C:/Users/adson_disparopro/Documents/programacao/estudo/midias-teste'
const organizer = new MediaOrganizer(directoryPath);

async function  main() {

  try {
    const extensions = await organizer.getFileExtensions();
  console.log(extensions)
} catch(error) {
  console.error(error)
}
}
main()