import {MediaOrganizer} from './utils/fileReader';

const directoryPath = 'C:/Users/adson_disparopro/Documents/programacao/estudo/midias-teste'


async function  main() {

  const organizar = new MediaOrganizer(directoryPath);
  console.log(organizar.readDirectory())
}
