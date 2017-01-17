/** Redraws the graph in the same scene. The position of the camera will not change. */
function redrawSameScene() {
    var sameScene = true;
    renderFrame.reDrawMe(sameScene, size_attenuation, node_size);    
}
/** Redraws the graph in the initial scene. The camera is re-positioned to look at all points */
function redrawInitialScene(zoom_in) {
    var sameScene = false;
    renderFrame.reDrawMe(sameScene, size_attenuation, node_size, zoom_in);
}

/** Defines render frame with the graph */
function DefineRenderFrame(frameStartsAt) {
    renderFrame = graph.renderIn("frame", frameStartsAt);
}
