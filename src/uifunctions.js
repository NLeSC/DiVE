//functions for defining UI components and handling their events

 /** Defines what happens when the user has pressed the search button */
 function searchSequence() {
     var value = document.getElementById("search").value;
     SearchAndColorizeByExpression(value);
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


