
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
            
        }

        

        /** Loads data from file and makes initializations necessary to render data points
             @param {file} file - The file selected by the user
        */
        function LoadDataFromFile(file) {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onloadend = function (e) {
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
        function InitDrawing(data) {           
            LoadDataInGraph(data);
            if (loadFirstTime) {
                DefineRenderFrame();
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
        function InitializeGraph() {
            return G.graph({
                sizeAttenuation: size_attenuation,//whether to change the size of the nodes for a 3D effect or not
                nodeImage: "imgs/disc.png",
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
                for (var i = 0; i < categories.length; i++) { text += "<br>" + categories[i]; }
                myPop.attachHTML(text);
                myPop.show(cursorX, cursorY, 0, 0); //params are: x, y, width, height. 3 and 5 are number of pixels relative to the node where the message should appear(you can play with these numbers)
            }
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
            var level = 0;
            for (var key in data) {
                if (key != "NamesOfProperties") {
                    AddNode(data, key);
                }

            }
            var nodes = graph.getNodes();
            for (var i = 0 ; i < nodes.length; i++)
            {
                allNodes.push(nodes[i]);
            }
        }

        /**Adds a node from data into the graph
         * @param {dictionary} data - the data as loaded from the json file
         * @param {string} key - the ID of the node
         */
        function AddNode(data, key) {
            var point = data[key];
            var coords = point.Coordinates;
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

        function ColorizeCategory(indexOfProperty){
            var colorsDict = [];
            for (var i = 0; i < graph._nodes.length; i++) {
                var node = graph._nodes[i];
                var key = node._propertiesValues[indexOfProperty];
                if (key in colorsDict) {
                    var colorPoint = colorsDict[key];
                    ChangeColor(node, colorPoint);
                }
                else{
                    var red = Math.floor(Math.random() * 255)
                    var green = Math.floor(Math.random() * 255)
                    var blue = Math.floor(Math.random() * 255)
                    var colorPoint =  "rgb(" + red + "," + green + "," + blue + ")";
                    ChangeColor(node, colorPoint)
                    colorsDict[key] = colorPoint;    
                }
            }                                   
            redrawSameScene();
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
