<template>
	<div ref="container">
		<div class="greeting">Hello Master</div>
		<canvas ref="silk1" id="silk-1" class="silk-canvas active"></canvas>
		<canvas ref="silk2" id="silk-2" class="silk-canvas buffer"></canvas>
		<canvas ref="sparks" id="sparks"></canvas>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Silk from "../utils/Silk";
import CanvasUtil from "../utils/CanvasUtil";

export default Vue.extend({
  props: [],
  data() {
    return {
      silkCanvas: this.$refs.silk1,
      bufferCanvas: this.$refs.silk2,
      sparksCanvas: this.$refs.sparks,
      container: this.$refs.container,
      all: {},
      backgroundColor: "#000",
      snapshotState: {
        justCleared: true,
        canUndo: false
      },
      previewSilks: {},
      inputPreviewSilk: null,
      inputPreviewSilkId: null,
      nextUndoIsRedo: false,
      undoSnapshot: null,
      clearUndoSnapshot: null,
      silkSettingsState: { ...Silk.initialState },
      drawInputPreview: true,
      frameTime: 0
    }
  },
  methods: {
    init() {
      this.sparksCanvas._util = new CanvasUtil(this.sparksCanvas)
      this.bufferCanvas._util = new CanvasUtil(this.bufferCanvas)
      this.silkCanvas._util = new CanvasUtil(this.silkCanvas)
      this.fillSilkCanvas()
    }
  },
  computed: {
    sparks() {
      return new Sparks(this.sparksCanvas)
    },
    recorder() {
      return new Recorder(this);
    },
    silkCtx() {
      return this.silkCanvas.getContext("2d")
    },
    sparksCtx() {
      return this.sparksCanvas.getContext("2d")
    }
  }
});
</script>

<style>
.greeting {
  font-size: 20px;
  height: 38px;
  text-align: center;
  line-height: 38px;
}
</style>