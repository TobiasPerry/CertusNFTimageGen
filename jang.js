import fs from 'fs';
import canvas from 'canvas';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';

// Basic Parameters
const projectName = 'Nike Lauchtronics';
const projectDescription = 'More than just a shoe, an instrument to power up your muscles - Tomas Camilo Gay Bare, Professional Bodybuilder';
const supply = 25; // Number of NFT's to generate
const imageURL = `ipfs://nikeimagenes/$nftID.png`; // IPFS URL - $nftID autoinjects 1-10000
const projectURL = 'https://nike.com'
const imageSize = {
  width: 512,
  height: 512,
};

const dir = {
  input : `./layers`,
  output: `./output`,
}

const drawImage= async (nftID) => {
  const blankCanvas = canvas.createCanvas(imageSize.width, imageSize.height);
  const ctx = blankCanvas.getContext("2d");
  ctx.attributes = [];

  /* Add layers using addLayer(dir,file,ctx) function below */

    const layers = []

  // Backgrounds
  const bkgs = ['Bricks','Canada','Green', 'Purple','Wood'];
  const bkg = bkgs[Math.floor((nftID-1)/5)];
  layers.push(addLayer('Background', bkg, ctx));
  // Flair
  const flrs = ['Fire','Plants','Stars', 'Swirl','Water'];
  const flr = flrs[(nftID-1)%5];
  layers.push(addLayer('Flair', flr, ctx));
  // Eyes
  const Brand = 'Nike';
  // let eyes = eyeArray[Math.floor(Math.random()*eyeArray.length)];
  // if (character === 'James') eyes = 'Blue';
  layers.push(addLayer('Brand', Brand, ctx));
  // Mouth
  // const mouthArray = ['Happy','Sad'];
  // let mouth = mouthArray[Math.floor(Math.random()*mouthArray.length)];
  // if (nftID.toString().includes(420)) mouth = 'Smoking'; 
  // layers.push(addLayer('Mouths', mouth, ctx));
  // await Promise.all(layers)
  // Add Some Text
  ctx.fillStyle = "#ffffff"; 
  ctx.font = "20px Nunito, sans-serif"; // Nunito is the font, change this or download it from Google Fonts
  ctx.fillText(`${projectName} #${nftID}`, 120, 460);
  // Add Numeric Attributes With No Image Layers
  const model = 'Nike Dithur Force 1';
  ctx.attributes.push({ 'trait_type': 'Model', 'value': model });
  // Finish By Adding A Vignette Overlay, Don't Need An Attribute For This
  const img = await canvas.loadImage(`${dir.input}/vignette.png`);
  ctx.drawImage(img,0,0,imageSize.width,imageSize.height);

  /* End of layers code */

  // save metadata
  fs.writeFileSync(`${dir.output}/metadata/${nftID}.json`,
    JSON.stringify({
      name: `${projectName} #${nftID}`,
      description: projectDescription,
      image: imageURL.split('$nftID').join(nftID),
      external_url: projectURL,
      attributes: ctx.attributes,
    }, null, 2), (err) =>  { if (err) throw err });

  // save image 
  fs.writeFileSync(`${dir.output}/hdimages/${nftID}.png`, blankCanvas.toBuffer('image/png'));
  const files = await imagemin([`${dir.output}/hdimages/${nftID}.png`], {
    destination: `${dir.output}/images/`,
    plugins: [imageminPngquant({quality: [0.5, 0.6]})]
  });
}

const addLayer = async (traitType,val,ctx) => {
  const img = await canvas.loadImage(`${dir.input}/${traitType}/${val}.png`);
  ctx.drawImage(img,0,0,imageSize.width,imageSize.height);
  ctx.attributes.push({ 'trait_type': traitType, 'value': val });
}

const recreateOutputsDir = () => {
  if (fs.existsSync(dir.output))  fs.rmdirSync(dir.output, { recursive: true });
  fs.mkdirSync(dir.output);
  fs.mkdirSync(`${dir.output}/metadata`);
  fs.mkdirSync(`${dir.output}/hdimages`);
};

async function* batch(total, size = 100) {
  const arr = new Array(total).fill(0)
  let i = 0
  while(arr.length) {
    await Promise.all(arr.slice(0,size).map((_,idx) => {
      drawImage(i*size+idx+1)
    }))
    arr.splice(0,size)
    i++
    yield [total - arr.length, total]
  }
}

const main = async () => {
  recreateOutputsDir();
  for await (let [progress, total] of batch(supply)) {
    console.log(`Progress: ${progress}/${total}`)
  }
};

(() => main())();
