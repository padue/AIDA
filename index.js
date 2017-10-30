'use strict';

class AIDA {

  constructor (srcImage) {

    // init class variables
    this._canvas = document.createElement('canvas');
    this._src = '';
    this._image = new Image();
    this._context = canvas.getContext('2d');

    // check srcImage is a string set src path
    if (typeof srcImage === 'string') {
      this._src = srcImage;
      this._image.src = this._src;
      this._image.onload = () => {
        this._context.drawImage(this._image, 0, 0, this._image.width, this._image.height);
      }
    }

    // check srcImage is an image
    else if (typeof srcImage.src === 'string') {
      this._image = srcImage;
      this._src = srcImage.src;
      this._context.drawImage(this._image, 0, 0, this._image.width, this._image.height);
    }

    // check srcImage is canvas
    else if (typeof srcImage.getContext === 'function') {
      this._canvas = srcImage;
      this._context = this._canvas.getContext('2d');
      this._src = this._canvas.toDataURL();
      this._image.src = this._src;
    }

    // srcImage cannot be parsed
    else {
      console.error('srcImage must be a string, image or canvas');
    }

  }

  // return image data object from canvas and calculate alpha blending with a
  // white background if necessairy
  getImageData (useAlphaBlending) {
    let imgData = this._canvas.getImageData();

    // if alpha blending is disabled, return image data as is
    if (!useAlphaBlending) {
      return imgData
    }

    // otherwise calculate alpha blending for the image with a white background
    for (let i = 0; i < imgData.data.length; i = i + 4) {
      let alpha = imgData.data[i + 3];
      imgData.data[i] = ((1 - alpha) + (alpha * imgData.data[i])) * 255;
      imgData.data[i + 1] = ((1 - alpha) + (alpha * imgData.data[i + 1])) * 255;
      imgData.data[i + 2] = ((1 - alpha) + (alpha * imgData.data[i + 2])) * 255;
      imgData.data[i + 3] = 255;
    }

    return imgData;
  }

  convertToHSV () {
    let imgData = this.getImageData(true);

    // initialize hsv array
    let hsv = new Uint8ClampedArray(imgData.data.length / 4 * 3);

    // loop over the result array
    for (let i = 0; i < hsv.length / 3; i++) {
      let r = imgData.data[i * 3 + i] / 255;
      let g = imgData.data[i * 3 + i + 1] / 255;
      let b = imgData.data[i * 3 + i + 2] / 255;
      let max = Math.max(r, g, b);
      let min = Math.min(r, g, b);

      // calculate H
      let h = 0;
      if (max == min) {
        h = 0;
      }
      else if (max == r) {
        h = 60 * (g - b) / (max - min);
      }
      else if (max == g) {
        h = 60 * (2 + (b - r) / (max - min));
      }
      else if (max == b) {
        h = 60 * (4 + (r - g) / (max - min));
      }
      if (h < 0) {
        h = h + 360;
      }

      // calculate S
      let s = 0;
      if (max == 0) {
        s = 0;
      }
      else {
        s = (max - min) / max;
      }

      let v = max;

      hsv[i * 3] = h / 360 * 255;
      hsv[i * 3 + 1] = s * 255;
      hsv[i * 3 + 2] = v * 255;
    }

    return hsv;
  }

  convertToYCbCr() {
    let imgData = this.getImageData(true);

    // initialize hsv array
    let ybr = new Uint8ClampedArray(imgData.data.length / 4 * 3);

    // loop over the result array
    for (let i = 0; i < ybr.length / 3; i++) {
      let r = imgData.data[i * 3 + i];
      let g = imgData.data[i * 3 + i + 1];
      let b = imgData.data[i * 3 + i + 2];

      ybr[i * 3] = 0 + 0.299 * r + 0.587 * g + 0.114 * b;
      ybr[i * 3 + 1] = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      ybr[i * 3 + 2] = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    }

    return ybr;
  }

}
