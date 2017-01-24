//functions for defining UI components and handling their events

function HandleShowColorMapChange() {
    if (show_color_map.checked) {
        CreateColorMap();
    }
    else {
        RemoveColorMap();
    }
}

/** Defines what happens when the user has pressed the search button */
 function searchSequence() {
     var value = document.getElementById("search").value;
     SearchAndColorizeByExpression(value);
 }


 /**Is called when the user selects a file to upload */
 function LoadLocalDataSet() {
     var x = document.getElementById("dataFile");
     var txt = "";
     if ('files' in x) {
         if (x.files.length == 0) {
             txt = "Select a file.";
         } else {
             var file = x.files[0];
             LoadDataFromFile(file);
         }
     }
 }

 /**Loads data from data.js*/
 function LoadLocalDataSetDefault() {

     InitGlobalDataVariables();
     var data = data_all;
     defineCombo(data);
     InitDrawing(data);
     loadFirstTime = false;

 }


 /** Initializes the check boxes and the event handlers for the checkboxes */
 function InitEventHandlers() {
     sizeAtShow.checked = true;
     //show_popup.checked = false;
     show_found_nodes.checked = false;
     sizeAtShow.onchange = function () {
         HandleSizeAttenuationChange();
     }
     show_found_nodes.onchange = function () {
         HandleShowFoundNodesChange();
     }
 }


     
        /** What to do when the user clicks on the scale size box */
        function HandleSizeAttenuationChange()
        {
            var sizeAtBool = sizeAtShow.checked;
            if (sizeAtBool) {
                size_attenuation = true;
                node_size = 0.016;
            }
            else {
                size_attenuation = false;
                node_size = 10;
            }
            redrawSameScene();
        }
        /** What to do when the "show found nodes" box is changed */
        function HandleShowFoundNodesChange()
        {
            if (show_found_nodes.checked) {
                LoadOnlyFoundNodes();
            }
            else {
                LoadAllNodes();
            }
            redrawSameScene();
        }


 /** Creates the combobox and populates it with properties names from the data. Defines what happens when a value is selected - the colorization 
  * @param {dictionary} data as loaded from the json file
  */
 function defineCombo(data) {
     var myCombo = document.getElementById("combo");
     //remove all options
     
     var i;
     for (i = myCombo.options.length - 1 ; i >= 0 ; i--) {
         myCombo.remove(i);
     }

     var listOfProperties;         
     listOfProperties = data["NamesOfProperties"];
     if (listOfProperties != undefined) {
         var len = listOfProperties.length;
         listOfProperties = listOfProperties.slice(0, len);
         for (var i = 0; i < listOfProperties.length; i++) {
             var option = document.createElement("option");
             option.text = listOfProperties[i];
             option.value = i;
             try {
                 myCombo.add(option, null); //Standard 
             } catch (error) {
                 myCombo.add(option); // IE only
             }
         }
     }
        
 }
 

 function HandlePropertyChange(){
     var myCombo = document.getElementById("combo");
     
     var selectedPropertyIndex = myCombo.options[myCombo.selectedIndex].value;
     isPropertyCategorical = CheckIfPropertyIsCategorical(selectedPropertyIndex);
    if (isPropertyCategorical){
        ColorizeCategory(selectedPropertyIndex);
    }
 }

 /** Creates the color picker and attaches events to it. */
 function defineColorPicker2() {
     myColorpicker = new dhtmlXColorPicker(["inputcolor"]);
     myColorpicker.setCustomColors(true);
     myColorpicker.setColor("#05ff50");
     myColorpicker.setCustomColors(true);
     myColorpicker.showMemory(true);

     myColorpicker.attachEvent("onSelect", function (color, node) {
         var col = myColorpicker.getSelectedColor();
         var myCombo = document.getElementById("combo");
         var selectedPropertyIndex = myCombo.options[myCombo.selectedIndex].value;

         ColorizeCategoricalOrNumerical(col, selectedPropertyIndex);
         //$("#label2").text(color);
     });

     myColorpicker.attachEvent("onCancel", function (node) { myColorpicker.hide() });
 }


