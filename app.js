const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
    console.log('Your watermarked file has been saved');
    startApp();
  }
  catch(error) {
    console.log('Something went wrong...Try again!');
    startApp();
  }
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);

    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
    console.log('Your watermarked file has been saved');
    startApp();
  }
  catch(error) {
    console.log('Something went wrong...Try again!');
    startApp();
  }
};

const prepareOutputFilename = function(fileName) {
  const newName = fileName.split('.');
  const fileFormat = newName.pop();
  return newName.join('-') + '-with-watermark.' + fileFormat;
} 

const startApp = async () => {

  // Ask if user is ready
  const answer = await inquirer.prompt([{
      name: 'start',
      message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm'
    }]);

  // if answer is no, just quit the app
  if(!answer.start) process.exit();

  // image exists validation
  const checkIfImageExists = async (options) => {
    // console.log(fs.existsSync('./img/' + options))
    while (!fs.existsSync('./img/' + options)) {
      return 'The file doesn\'t exist. Please correct the name of the file';
    }
    return true;
  };

  // ask about input file and watermark type
  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpg',
    validate: checkIfImageExists,    
  }, {
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark'],
  }]);

  if(options.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text:',
    }]);
    options.watermarkText = text.value;
    addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), options.watermarkText);
  }
  else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark file name:',
      default: 'logo.png',
      validate: checkIfImageExists,
    }]);
    options.watermarkImage = image.filename;
    addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + options.watermarkImage);
  }
}

startApp();