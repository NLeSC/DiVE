/** Redraws the graph in the same scene. The position of the camera will not change. */
function redrawSameScene() {
    if (size_attenuation) {
        renderFrame.reDrawMeInSameScene();
    }
    else { renderFrame.reDrawMeInSameSceneWithoutSizeAttenuation(); }
}
/** Redraws the graph in the initial scene. The camera is re-positioned to look at all points */
function redrawInitialScene(seeAllData) {
    old_d = undefined;//zooming-in speed will be reset
    if (seeAllData) { start_zoomin_factor = 2; }
    else { start_zoomin_factor = 1; }
    if (size_attenuation) {
        renderFrame.reDrawMe(seeAllData);
    }
    else { renderFrame.reDrawMeWithoutSizeAttenuation(seeAllData); }
}


/** Defines render frame with the graph */
function DefineRenderFrame() {
    renderFrame = graph.renderIn("frame");
}
