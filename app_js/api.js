async function fetchJS(url, params) {
  const fetch = require("node-fetch");
  const finalURL = params ? `${url}?${params.join("&")}` : url;
  return await (await fetch(finalURL)).json();
}

async function getBackImage(isRandom) {
  if (isRandom) {
    const dynamicImageRes = await fetchJS(URLS.DYNAMIC_IMAGE);
    return dynamicImageRes.url;
  }
  return URLS.STATIC_IMAGE;
}

async function getCatImages(limit) {
  const catImagesRes = await fetchJS(URLS.CATS_IMAGE, [
    `limit=${limit}`,
    `api_key=${process.env.apiKey}`,
  ]);
  return catImagesRes.map((cat) => cat.url);
}

async function getDescriptions(amount) {
  return await fetchJS(`${URLS.DESCRIPTION}/${amount}`);
}

async function getPosts(amount) {
  const cat_images = await getCatImages(amount);
  const cat_descriptions = await getDescriptions(amount);
  return cat_descriptions.map((_, ind) => ({
    pic: cat_images[ind],
    content: cat_descriptions[ind],
  }));
}

const URLS = {
  RADIO: "http://91.219.74.220:8000/Vanya.ogg",
  DYNAMIC_IMAGE: "https://api.waifu.pics/sfw/bully",
  STATIC_IMAGE: "https://i.waifu.pics/PGj1tg7.gif",
  CATS_IMAGE: "https://api.thecatapi.com/v1/images/search",
  DESCRIPTION: "https://binaryjazz.us/wp-json/genrenator/v1/story",
};

module.exports = {
  URLS,
  getBackImage,
  getPosts,
};
