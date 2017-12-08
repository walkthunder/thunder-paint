  import { _, __bind } from './helpers'

  function CanvasUtil(canvas, fullscreen) {
      this.canvas = canvas;
      this.fullscreen = fullscreen != null ? fullscreen : true;
      this.resizeToWindowAndPreserveContents = __bind(this.resizeToWindowAndPreserveContents, this);
      if (this.fullscreen) {
          this.resizeToWindow();
          $(window).resize(_.debounce(this.resizeToWindowAndPreserveContents, 300));
      } else {
          this.updateSizeOnScreen(this.canvas.width, this.canvas.height);
          this.transformAndResizeForHighDPI();
      }
  }

  CanvasUtil.prototype.updateSizeOnScreen = function(width, height) {
      this.widthOnScreen = width;
      this.halfWidthOnScreen = this.widthOnScreen / 2;
      this.heightOnScreen = height;
      return this.halfHeightOnScreen = this.heightOnScreen / 2;
  }

  CanvasUtil.prototype.transformAndResizeForHighDPI = function() {
      var backingStoreRatio, ctx, devicePixelRatio;
      if (MobileDetect()) {
          return;
      }
      ctx = this.canvas.getContext('2d');
      devicePixelRatio = window.devicePixelRatio || 1;
      backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
      this.scaleRatio = devicePixelRatio / backingStoreRatio;
      if (this.scaleRatio !== 1) {
          this.canvas.width = this.widthOnScreen * this.scaleRatio;
          this.canvas.height = this.heightOnScreen * this.scaleRatio;
          this.canvas.style.width = this.widthOnScreen + 'px';
          this.canvas.style.height = this.heightOnScreen + 'px';
          return ctx.scale(this.scaleRatio, this.scaleRatio);
      }
  }

  CanvasUtil.prototype.resizeToWindow = function() {
      return this.resizeCanvas(window.innerWidth, window.innerHeight);
  }

  CanvasUtil.prototype.resizeCanvas = function(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.updateSizeOnScreen(width, height);
      return this.transformAndResizeForHighDPI();
  }

  CanvasUtil.prototype.resizeToWindowAndPreserveContents = function() {
      var ctx, image, prevHeight, prevWidth;
      prevWidth = this.canvas.width;
      prevHeight = this.canvas.height;
      image = this.canvas.getContext('2d').getImageData(0, 0, prevWidth - 1, prevHeight - 1);
      this.resizeToWindow();
      ctx = this.canvas.getContext('2d');

      /* Silk-specific blackness hack! */
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      /* End hack */
      return ctx.putImageData(image, (this.canvas.width - prevWidth) / 2, (this.canvas.height - prevHeight) / 2);
  }

  export default CanvasUtil
