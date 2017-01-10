 /** Initiates the global variables
  */
function InitGlobalDataVariables() {           
            pointsSet = undefined;       
            previousColor = [];
            previoslyhoveredNode = undefined;                                
            selectedPropertyIndex = undefined;//holds the index of the most recently selected numerical property (by the user)
            previousColor = [];//used in resume colors            
            searchExprWellDefined = undefined;
            allNodes = [];
            foundNodes = [];
            labelsForColorsDict = undefined;
            colorsChildrenIds = undefined;
            entriesColor = undefined;            
        }

        

 /** Loads data from file and makes initializations necessary to render data points
      @param {file} file - The file selected by the user
 */
 function LoadDataFromFile(file) {
        var reader = new FileReader();
        reader.readAsText(file);
         dataFileName = file.name;
         dataset = dataFileName.split("_");
         dataset = dataset[0];
         reader.onloadend = function (e) {
             RemoveColorMap();
             var contents = e.target.result;
             InitGlobalDataVariables();
             var data = JSON.parse(contents);
             defineCombo(data);
             InitDrawing(data);
             loadFirstTime = false;
     }
 }
        /** Initializes rendering frame and draws the graph in an initial scene
         * @param {dictionary} data - The dictionary of points as loaded from the json file
         */
 function  InitDrawing(data) {
           
            LoadDataInGraph(data);
            if (loadFirstTime) {
                DefineRenderFrame(frameStartsAt);
            }
            redrawInitialScene(false);
        }
       
       

        /** Loads only the points that result from a search in the graph. At least 15 nodes are loaded, however. */
        function LoadOnlyFoundNodes() {
            RemoveAllNodes();
            for (var i = 0; i < foundNodes.length; i++) {
                graph.addNode(foundNodes[i]);
            }
            var n = graph.getNodes().length;
            //cause it does not work well for a small amount of nodes (problem with the graphics)
            if (n < 15)
            {
                for (var i = 0; i < 15 - n; i++)
                {
                    graph.addNode(allNodes[i]);
                }
            }
        }

        /** Loads all points from the data file in the graph */
        function LoadAllNodes() {
            for (var i = 0; i < allNodes.length; i++) {
                graph.addNode(allNodes[i]);
            }
        }

        /**Initializes the graph */
        function InitializeGraph(size_attenuation, node_size) {
            return G.graph({
                sizeAttenuation: size_attenuation,//whether to change the size of the nodes for a 3D effect or not
                //nodeImage: "imgs/disc.png",
                nodeImageTransparent: true,
                antialias: true,
                bgColor: 'lightgrey',//'lightskyblue',
                nodeSize: node_size,//10,//0.016,//change to 10 if sizeAttenuation = false, otherwise the nodes are too small and not visible
                edgeWidth: 0.005,//change to 1 if sizeAttenuation = false. Update 11/10/2016: This should be programmed. 
                hover: function (node) {//what should happen when a user hovers over a node with the mouse
                    HandleNodeHovering(node);
                }/*,
                mousedown: function (node) {//what should happen when a user clicks on a node. Disabled at the moment
                    HandleNodeClicking(node);
                }*/
            });
        }
      
        /** Defines what happens when a user hovers over a node (point)
         * @param {Graph.node} node - a node from the graph that was hovered over
        */
        function HandleNodeHovering(node) {
            if (previoslyhoveredNode != undefined)//if some node was hovered before, return its color
            { previoslyhoveredNode.setColorHex("#" + previosHoveredcolor); }
            previosHoveredcolor = node.getColor();
            previoslyhoveredNode = node;
            node.setColor("white");//make hovered node white
            redrawSameScene();
            var categories = node._categoriesValues;
            var text = node.getId(); //+ "<br>" + props[0] + "<br>" + props[2] + "<br>" + props[4]            
            //if (node._expandable) { text = "Click to open! <br> " + text; }
            if (show_popup.checked) {
               
                
                    $("#label").text("");
                    //for (var i = 0; i < categories.length; i++) { text += "<br>" + categories[i]; }
                    //$("#label").text("");
                    var id = text;
                    var baseID = id;
                    baseID = baseID.substr(0, baseID.lastIndexOf('.'));
                    var imagesFolder = "data/images_" + dataset;
                    var fingerprintsFolder = "data/fingerprints_" + dataset;
                    image_text = "<img src=\"" + imagesFolder + "/" + baseID + ".jpg" + "\" alt=\"Image cannot be loaded\" style=\"width:304px;height:228px;\">";
                    fingerprint_text = "<img src=\"" + fingerprintsFolder + "/" + baseID + ".png" + "\" alt=\"Fingerprint cannot be loaded\" style=\"width:304px;height:228px;\">";
                    text = text + "<br>" + image_text + "<br>" + fingerprint_text;
                    myPop.attachHTML(text);
                    myPop.show(cursorX, cursorY, 0, 0); //params are: x, y, width, height. 3 and 5 are number of pixels relative to the node where the message should appear(you can play with these numbers)
                }
                //else {
                //    $("#label").text("");
                //    for (var i = 0; i < categories.length; i++) { text += "<br>" + categories[i]; }
                //    myPop.attachHTML(text);
                //    myPop.show(cursorX, cursorY, 0, 0); //params are: x, y, width, height. 3 and 5 are number of pixels relative to the node where the message should appear(you can play with these numbers)
                //}
            //}
            else {
                for (var i = 0; i < categories.length; i++) { text += " ; " + categories[i]; }
                $("#label").text("Point info:  " + text);
            }
            
        }

        /** Prepares the initial colors of the points based on their coordinates. Optional. 
        * @param {list} coords - The three coordinates of the point 
        */
        function PrepareColorZero(coords) {
            var red = Math.floor((coords[0] * coords[0] * 1643 % 256) + 1);
            var green = Math.floor((coords[1] * coords[1] * 328 % 256) + 1);
            var blue = Math.floor((coords[2] * coords[2] * 487 % 256) + 1);
            return "rgb(" + red + "," + green + "," + blue + ")";
        }
              
        /** Takes a point from data and makes a node of the graph out of it 
         * @param {list} data - a list of points
         * @param {string} key - the id of the point
         * @param {string} colorpoint - the desired color of the point
        */
        function PrepareNodeAndAddIt(data, key, colorPoint) {
            var point = data[key];
            var pointid = key;
            var coords = point.Coordinates;
            var nodecategories = point.Categories;
            if (point.Categories != undefined && point.Categories != [])
                { nodecategories = point.Categories; }
            else
                { nodecategories = point.Properties; }
            var nodeProperties = point.Properties;
            var node = G.node(coords, {
                id: pointid,
                categoriesValues: nodecategories,
                propertiesValues: nodeProperties,
                color: colorPoint,
            });
            node.addTo(graph);
            var node = graph.getNode(key);
            node.setColor(colorPoint);
        }

        
        /**Loads all data in the graph 
         * @param {dictionary} data - the data as loaded from the json file
        */
        function LoadDataInGraph(data) {
            RemoveAllNodes();
            var maxCoordinate = FindMaxCoordinate(data);

            var level = 0;
            for (var key in data) {
                if (key != "NamesOfProperties") {
                    AddNode(data, key,  maxCoordinate);
                }

            }
            var nodes = graph.getNodes();
            for (var i = 0 ; i < nodes.length; i++)
            {
                allNodes.push(nodes[i]);
            }
        }
        
        function FindMaxCoordinate(data) {
            var maxCoordinate = 0;
            for (var key in data) {
                if (key != "NamesOfProperties") {
                    var point = data[key];
                    var coords = point.Coordinates;
                    for (var i = 0; i < coords.length; i++) {
                        if (Math.abs(coords[i]) > maxCoordinate) {
                            maxCoordinate = Math.abs(coords[i]);
                        }
                    }
                }
            }
            return maxCoordinate;
        }


        /**Adds a node from data into the graph
         * @param {dictionary} data - the data as loaded from the json file
         * @param {string} key - the ID of the node
         */
        function AddNode(data, key, maxCoordinate) {
            var point = data[key];
            var coords = point.Coordinates;
            for (var i = 0; i < coords.length; i++)
            {
                coords[i] /= maxCoordinate;
            }
            var colorNode = PrepareColorZero(coords);
            PrepareNodeAndAddIt(data, key, colorNode);
        }


        /**
         * Removes all nodes from the graph. The graph is empty afterwards
         */
        function RemoveAllNodes() {
            var numberOfNodes = graph.getNodes().length;
            for (var i = 0; i < numberOfNodes; i++) {
                graph.removeLastNode();
            }
        }

        function ColorizeCategoricalOrNumerical(col, indexOfProperty)
        {
            isPropertyCategorical = CheckIfPropertyIsCategorical(indexOfProperty);
            if (isPropertyCategorical){
                ColorizeCategory(indexOfProperty);
            }
            else{
                Colorize(col, indexOfProperty);
            }

        }

        function CheckIfPropertyIsCategorical(indexOfProperty){
            var isCategorical = false;
            for (var i = 0; i < graph._nodes.length; i++) {
                var value = graph._nodes[i]._propertiesValues[indexOfProperty];
                var isNotANumber = isNaN(value);
                if (isNotANumber){
                    isCategorical = true;
                    break;
                }
            }
            return isCategorical;
        }

        function ColorizeCategory(indexOfProperty) {
            colorsDict = [];
            entriesColor = [];                        
            for (var i = 0; i < graph._nodes.length; i++) {
                var node = graph._nodes[i];
                var key = node._propertiesValues[indexOfProperty];
                if (key == "") { key = "No entry" }
                if (key in entriesColor) {
                    entriesColor[key] += 1;
                }
                else {                  
                    entriesColor[key] = 1;                    
                }
            }
            var numberOfColors = Object.keys(entriesColor).length;
            var colors = getColors(numberOfColors);
            var count = 0;
            for (var i = 0; i < graph._nodes.length; i++) {
                var node = graph._nodes[i];
                var key = node._propertiesValues[indexOfProperty];
                if (key == "") { key = "No entry" }
                if (key in colorsDict) {
                    var colorPoint = colorsDict[key];
                    ChangeColor(node, colorPoint);
                    //entriesColor[key] += 1;
                }
                else {
                    var colorPoint;
                    if (key == "No entry")
                    { colorPoint = "grey" }
                    else
                    {
                         colorPoint = colors[count];
                    }
                    count++; 
                    ChangeColor(node, colorPoint)
                    colorsDict[key] = colorPoint;
                    //entriesColor[key] = 1;
                    //labelsForColorsDict[node.getColor()] = key;
                }
            }

            CreateColorMap();
            redrawSameScene();
        }
        
        var generateRandomColors = function (number) {
            /*
            This generates colors using the following algorithm:
            Each time you create a color:
                Create a random, but attractive, color{
                    Red, Green, and Blue are set to random luminosity.
                    One random value is reduced significantly to prevent grayscale.
                    Another is increased by a random amount up to 100%.
                    They are mapped to a random total luminosity in a medium-high range (bright but not white).
                }
                Check for similarity to other colors{
                    Check if the colors are very close together in value.
                    Check if the colors are of similar hue and saturation.
                    Check if the colors are of similar luminosity.
                    If the random color is too similar to another,
                    and there is still a good opportunity to change it:
                        Change the hue of the random color and try again.
                }
                Output array of all colors generated
            */
            //if we've passed preloaded colors and they're in hex format
            if (typeof (arguments[1]) != 'undefined' && arguments[1].constructor == Array && arguments[1][0] && arguments[1][0].constructor != Array) {
                for (var i = 0; i < arguments[1].length; i++) { //for all the passed colors
                    var vals = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(arguments[1][i]); //get RGB values
                    arguments[1][i] = [parseInt(vals[1], 16), parseInt(vals[2], 16), parseInt(vals[3], 16)]; //and convert them to base 10
                }
            }
            var loadedColors = typeof (arguments[1]) == 'undefined' ? [] : arguments[1],//predefine colors in the set
                number = number + loadedColors.length,//reset number to include the colors already passed
                lastLoadedReduction = Math.floor(Math.random() * 3),//set a random value to be the first to decrease
                rgbToHSL = function (rgb) {//converts [r,g,b] into [h,s,l]
                    var r = rgb[0], g = rgb[1], b = rgb[2], cMax = Math.max(r, g, b), cMin = Math.min(r, g, b), delta = cMax - cMin, l = (cMax + cMin) / 2, h = 0, s = 0; if (delta == 0) h = 0; else if (cMax == r) h = 60 * ((g - b) / delta % 6); else if (cMax == g) h = 60 * ((b - r) / delta + 2); else h = 60 * ((r - g) / delta + 4); if (delta == 0) s = 0; else s = delta / (1 - Math.abs(2 * l - 1)); return [h, s, l]
                }, hslToRGB = function (hsl) {//converts [h,s,l] into [r,g,b]
                    var h = hsl[0], s = hsl[1], l = hsl[2], c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(h / 60 % 2 - 1)), m = l - c / 2, r, g, b; if (h < 60) { r = c; g = x; b = 0 } else if (h < 120) { r = x; g = c; b = 0 } else if (h < 180) { r = 0; g = c; b = x } else if (h < 240) { r = 0; g = x; b = c } else if (h < 300) { r = x; g = 0; b = c } else { r = c; g = 0; b = x } return [r, g, b]
                }, shiftHue = function (rgb, degree) {//shifts [r,g,b] by a number of degrees
                    var hsl = rgbToHSL(rgb); //convert to hue/saturation/luminosity to modify hue
                    hsl[0] += degree; //increment the hue
                    if (hsl[0] > 360) { //if it's too high
                        hsl[0] -= 360 //decrease it mod 360
                    } else if (hsl[0] < 0) { //if it's too low
                        hsl[0] += 360 //increase it mod 360
                    }
                    return hslToRGB(hsl); //convert back to rgb
                }, differenceRecursions = {//stores recursion data, so if all else fails we can use one of the hues already generated
                    differences: [],//used to calculate the most distant hue
                    values: []//used to store the actual colors
                }, fixDifference = function (color) {//recursively asserts that the current color is distinctive
                    if (differenceRecursions.values.length > 23) {//first, check if this is the 25th recursion or higher. (can we try any more unique hues?)
                        //if so, get the biggest value in differences that we have and its corresponding value
                        var ret = differenceRecursions.values[differenceRecursions.differences.indexOf(Math.max.apply(null, differenceRecursions.differences))];
                        differenceRecursions = { differences: [], values: [] }; //then reset the recursions array, because we're done now
                        return ret; //and then return up the recursion chain
                    } //okay, so we still have some hues to try.
                    var differences = []; //an array of the "difference" numbers we're going to generate.
                    for (var i = 0; i < loadedColors.length; i++) { //for all the colors we've generated so far
                        var difference = loadedColors[i].map(function (value, index) { //for each value (red,green,blue)
                            return Math.abs(value - color[index]) //replace it with the difference in that value between the two colors
                        }), sumFunction = function (sum, value) { //function for adding up arrays
                            return sum + value
                        }, sumDifference = difference.reduce(sumFunction), //add up the difference array
                        loadedColorLuminosity = loadedColors[i].reduce(sumFunction), //get the total luminosity of the already generated color
                        currentColorLuminosity = color.reduce(sumFunction), //get the total luminosity of the current color
                        lumDifference = Math.abs(loadedColorLuminosity - currentColorLuminosity), //get the difference in luminosity between the two
                        //how close are these two colors to being the same luminosity and saturation?
                        differenceRange = Math.max.apply(null, difference) - Math.min.apply(null, difference),
                        luminosityFactor = 50, //how much difference in luminosity the human eye should be able to detect easily
                        rangeFactor = 75; //how much difference in luminosity and saturation the human eye should be able to dect easily
                        if (luminosityFactor / (lumDifference + 1) * rangeFactor / (differenceRange + 1) > 1) { //if there's a problem with range or luminosity
                            //set the biggest difference for these colors to be whatever is most significant
                            differences.push(Math.min(differenceRange + lumDifference, sumDifference));
                        }
                        differences.push(sumDifference); //otherwise output the raw difference in RGB values
                    }
                    var breakdownAt = 64, //if you're generating this many colors or more, don't try so hard to make unique hues, because you might fail.
                    breakdownFactor = 25, //how much should additional colors decrease the acceptable difference
                    shiftByDegrees = 15, //how many degrees of hue should we iterate through if this fails
                    acceptableDifference = 250, //how much difference is unacceptable between colors
                    breakVal = loadedColors.length / number * (number - breakdownAt), //break down progressively (if it's the second color, you can still make it a unique hue)
                    totalDifference = Math.min.apply(null, differences); //get the color closest to the current color
                    if (totalDifference > acceptableDifference - (breakVal < 0 ? 0 : breakVal) * breakdownFactor) { //if the current color is acceptable
                        differenceRecursions = { differences: [], values: [] } //reset the recursions object, because we're done
                        return color; //and return that color
                    } //otherwise the current color is too much like another
                    //start by adding this recursion's data into the recursions object
                    differenceRecursions.differences.push(totalDifference);
                    differenceRecursions.values.push(color);
                    color = shiftHue(color, shiftByDegrees); //then increment the color's hue
                    return fixDifference(color); //and try again
                }, color = function () { //generate a random color
                    var scale = function (x) { //maps [0,1] to [300,510]
                        return x * 210 + 300 //(no brighter than #ff0 or #0ff or #f0f, but still pretty bright)
                    }, randVal = function () { //random value between 300 and 510
                        return Math.floor(scale(Math.random()))
                    }, luminosity = randVal(), //random luminosity
                        red = randVal(), //random color values
                        green = randVal(), //these could be any random integer but we'll use the same function as for luminosity
                        blue = randVal(),
                        rescale, //we'll define this later
                        thisColor = [red, green, blue], //an array of the random values
                        /*
                        #ff0 and #9e0 are not the same colors, but they are on the same range of the spectrum, namely without blue.
                        Try to choose colors such that consecutive colors are on different ranges of the spectrum.
                        This shouldn't always happen, but it should happen more often then not.
                        Using a factor of 2.3, we'll only get the same range of spectrum 15% of the time.
                        */
                        valueToReduce = Math.floor(lastLoadedReduction + 1 + Math.random() * 2.3) % 3, //which value to reduce
                        /*
                        Because 300 and 510 are fairly close in reference to zero,
                        increase one of the remaining values by some arbitrary percent betweeen 0% and 100%,
                        so that our remaining two values can be somewhat different.
                        */
                        valueToIncrease = Math.floor(valueToIncrease + 1 + Math.random() * 2) % 3, //which value to increase (not the one we reduced)
                        increaseBy = Math.random() + 1; //how much to increase it by
                    lastLoadedReduction = valueToReduce; //next time we make a color, try not to reduce the same one
                    thisColor[valueToReduce] = Math.floor(thisColor[valueToReduce] / 16); //reduce one of the values
                    thisColor[valueToIncrease] = Math.ceil(thisColor[valueToIncrease] * increaseBy) //increase one of the values
                    rescale = function (x) { //now, rescale the random numbers so that our output color has the luminosity we want
                        return x * luminosity / thisColor.reduce(function (a, b) { return a + b }) //sum red, green, and blue to get the total luminosity
                    };
                    thisColor = fixDifference(thisColor.map(function (a) { return rescale(a) })); //fix the hue so that our color is recognizable
                    if (Math.max.apply(null, thisColor) > 255) { //if any values are too large
                        rescale = function (x) { //rescale the numbers to legitimate hex values
                            return x * 255 / Math.max.apply(null, thisColor)
                        }
                        thisColor = thisColor.map(function (a) { return rescale(a) });
                    }
                    return thisColor;
                };
            for (var i = loadedColors.length; i < number; i++) { //Start with our predefined colors or 0, and generate the correct number of colors.
                loadedColors.push(color().map(function (value) { //for each new color
                    return Math.round(value) //round RGB values to integers
                }));
            }
            //then, after you've made all your colors, convert them to hex codes and return them.
            return loadedColors.map(function (color) {
                var hx = function (c) { //for each value
                    var h = c.toString(16);//then convert it to a hex code
                    return h.length < 2 ? '0' + h : h//and assert that it's two digits
                }
                return "#" + hx(color[0]) + hx(color[1]) + hx(color[2]); //then return the hex code
            });
        }

        function getColors(noOfColors) {
            var colors = [];
            //var frequency = 5 / noOfColors;
            var frequency = 1;
            for (var i = 0; i < noOfColors; ++i) {
                var red = Math.sin(frequency * i + 0) * (127) + 128;
                var green = Math.sin(frequency * i + 1) * (127) + 128;
                var blue = Math.sin(frequency * i + 3) * (127) + 128;
                var color = "rgb(" + Math.floor(red) + "," + Math.floor(green) + "," + Math.floor(blue) + ")";
                colors.push(color);
            }
            return colors;
        }

        /** Colorizes the nodes in different shades of a certain color based on intensity of a property
         * @param {Three.color} col - the color in which to colorize
         * @param {indexOfProperty} - the index of the property based on which to colorize
         */
        function Colorize(col, indexOfProperty)//colorizes the nodes that are already loaded in the graph. 
        {
            // init max and min value of property accross nodes
            var max = graph._nodes[0]._propertiesValues[indexOfProperty];
            var min = max;

            for (var i = 0; i < graph._nodes.length; i++) {
                var value = graph._nodes[i]._propertiesValues[indexOfProperty];
                if (value > max) { max = value; }
                if (value < min) { min = value; }
            }

            var range = max - min;

            //find the max intensity for red or blue or green
            var maxColor = col[1][0];
            if (col[1][1] > maxColor) { maxColor = col[1][1]; }
            if (col[1][2] > maxColor) { maxColor = col[1][2]; }

            //adjust the RGB components
            var redNew = col[1][0];
            var greenNew = col[1][1];

            if (maxColor > 0) {
                var factor = 255 / maxColor;
                redNew = factor * col[1][0];
                greenNew = factor * col[1][1];
                blueNew = factor * col[1][2];
            }

            //colorize the nodes with different shades of the color, according to the selected property intensity
            for (var i = 0; i < graph._nodes.length; i++) {
                var node = graph._nodes[i];
                var value = node._propertiesValues[indexOfProperty];
                var red = col[1][0];
                var green = col[1][1];
                var blue = col[1][2];
                if (range > 0) {
                    red = Math.floor(redNew * (value - min) / range);
                    green = Math.floor(greenNew * (value - min) / range);
                    blue = Math.floor(blueNew * (value - min) / range);
                }
                var color = "rgb(" + red + "," + green + "," + blue + ")";
                ChangeColor(node, color);
            }
            redrawSameScene();
        }

       
       
           /** Changes the color of a node
            * @param {Graph.node} node - the node that changes color
            * @param  {Three.color} color - the new color of the node*/ 
            function ChangeColor(node, color) {
                var id = node.getId();
                previousColor[id] = node.getColor();
                node.setColor(color);
            }

            /** Returns the color of a node to its previous color
             * * @param {Graph.node} node - the node that changes color
             */
            function ReturnPreviousColor(node) {
                var id = node.getId();
                var color = previousColor[id];
                if (color != undefined) {
                    node.setColorHex("#" + color);
                }
            }
             /** Returns the color of all nodes to their previous colors             
             */
            function ReturnAllColors() {
                var nodes = graph.getNodes();
                for (var i = 0; i < nodes.length; i++) {
                    ReturnPreviousColor(nodes[i]);
                }
                redrawSameScene();
            }

            function RemoveColorMap() {
                if (colorsChildrenIds != undefined) {
                    for (var key in colorsChildrenIds) {
                        var idd = colorsChildrenIds[key];
                        var ch = document.getElementById(idd);
                        document.body.removeChild(ch);
                    }
                    colorsChildrenIds = undefined;
                }
            }

            function CreateColorMap() {
                if (show_color_map.checked) {
                    RemoveColorMap();
                    if (entriesColor !== undefined) {
                        var dict = entriesColor;
                        // Create items array
                        var items = Object.keys(dict).map(function (key) {
                            return [key, dict[key]];
                        });

                        // Sort the array based on the second element
                        items.sort(function (first, second) {
                            return second[1] - first[1];
                        });
                        //items.reverse();
                        items = items.slice(0, 41);
                        //if (Object.keys(colorsDict).length < 40) {
                        var count = 70;
                        colorsChildrenIds = [];
                        //for (var propertyValue in colorsDict) {
                        for (var i = 0; i < items.length; i++) {
                            var propertyValue = items[i][0];
                            var text2 = document.createElement('div');
                            text2.id = colorsDict[propertyValue];
                            text2.style.position = 'absolute';
                            //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
                            //text2.style.width = 100;
                            text2.style.height = 100;
                            text2.innerHTML = propertyValue + ":" + items[i][1];
                            text2.style.color = colorsDict[propertyValue];
                            text2.style.top = count + 'px';
                            text2.style.left = 305 + 'px';
                            document.body.appendChild(text2);
                            colorsChildrenIds.push(text2.id);
                            count += 20;
                        }
                    }
                }
            }
