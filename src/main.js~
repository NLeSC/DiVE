 function InitGlobalDataVariables() {           
            previousColor = [];
            pointsSet = undefined;
            previoslyhoveredNode = undefined;
            smallData = undefined;                                 
            selectedPropertyIndex = undefined;//holds the index of the most recently selected numerical property (by the user)
            previousColor = [];//used in resume colors
            //var expandable = new Object();//expandable[5987][3] is true if and only if node with id 5987 is expandable at level 3            
            searchExprWellDefined = undefined;
            allNodes = [];
            foundNodes = [];
            
        }

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

        function LoadDataFromFile(file) {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onloadend = function (e) {
                var contents = e.target.result;                
                InitGlobalDataVariables();
                smallData = JSON.parse(contents);
                defineCombo();
                InitDrawing();
                loadFirstTime = false;
            }           
        }

        function InitDrawing() {           
            LoadData();
            if (loadFirstTime) {
                renderFrame = graph.renderIn("frame");
            }
            redrawInitialScene();
        }

        function InitEventHandlers() {
            sizeAtShow.checked = true;
            show_popup.checked = true;
            show_found_nodes.checked = false;           
            sizeAtShow.onchange = function () {
                HandleSizeAttenuationChange();
            }
            show_found_nodes.onchange = function () {
                HandleShowFoundNodesChange();                
            }
        }
        
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

        function LoadOnlyFoundNodes() {
            RemoveAllNodes();
            for (var i = 0; i < foundNodes.length; i++) {
                graph.addNode(foundNodes[i]);
            }
            var n = graph.getNodes().length;
            //cause it does not work well for a small amount of nodes
            if (n < 15)
            {
                for (var i = 0; i < 15 - n; i++)
                {
                    graph.addNode(allNodes[i]);
                }
            }
        }

        function LoadAllNodes() {
            for (var i = 0; i < allNodes.length; i++) {
                graph.addNode(allNodes[i]);
            }
        }

        function InitializeGraph() {
            return G.graph({
                sizeAttenuation: size_attenuation,//whether to change the size of the nodes for a 3D effect or not
                nodeImage: "imgs/disc.png",
                nodeImageTransparent: true,
                antialias: true,
                bgColor: 'lightgrey',//'lightskyblue',
                nodeSize: node_size,//10,//0.016,//change to 10 if sizeAttenuation = false, otherwise the nodes are too small and not visible
                edgeWidth: 0.005,//change to 1 if sizeAttenuation = false
                hover: function (node) {//what should happen when a user hovers over a node with the mouse
                    HandleNodeHovering(node);
                }/*,
                mousedown: function (node) {//what should happen when a user clicks on a node
                    HandleNodeClicking(node);
                }*/
            });
        }
      

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

        function PrepareColorZero(coords) {
            var red = Math.floor((coords[0] * coords[0] * 1643 % 256) + 1);
            var green = Math.floor((coords[1] * coords[1] * 328 % 256) + 1);
            var blue = Math.floor((coords[2] * coords[2] * 487 % 256) + 1);
            return "rgb(" + red + "," + green + "," + blue + ")";
        }

       
        function PrepareColor(level, parentId)// a unique color per parent and level
        {
            var y = parentId;
            return "rgb(" + 111 * (level + 1) * (y + 1) % 256 + "," + 20 * (level + 1) * (y + 1) % 256 + "," + 50 * (level + 1) * (y + 1) % 256 + ")";
        }

        function PrepareNodeAndAddIt(data, key, colorPoint) {
            var point = data[key];
            var pointid = key;
            var coords = point.Coordinates;
            var nodecategories = point.Categories;
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


        function LoadData() {
            if (smallData == undefined) {
                var fileName = dataFolder + "/" + smallDataFile;
                fetchJSONFile(fileName, function (data) {
                    smallData = data;
                    LoadDataInGraph(smallData);
                });
            }
            else {
                LoadDataInGraph(smallData);
            }
        }

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


        function AddNode(data, key) {
            var point = data[key];
            var coords = point.Coordinates;
            var colorNode = PrepareColorZero(coords);
            PrepareNodeAndAddIt(data, key, colorNode);
        }


        function RemoveAllNodes() {
            var numberOfNodes = graph.getNodes().length;
            for (var i = 0; i < numberOfNodes; i++) {
                graph.removeLastNode();
            }
        }

        function RemoveLastNodes() {//when the user has asked to close an open node
            var numberOfNodes = graph.getNodes().length;
            for (var i = 0; i < numberOfNodes - previousNumberOfNodes[clicked]; i++) {
                graph.removeLastNode();
            }
        }

       
        function Colorize(col, indexOfProperty)//colorizes the nodes that are already loaded in the graph. Means if you color while still loading data, the new data will not be colored
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

            //colorize the nodes with different shades of the color, according to the selecgted property intensity
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

       
        
        function redrawSameScene() {          
            if (size_attenuation) {
                renderFrame.reDrawMeInSameScene();
            }
            else { renderFrame.reDrawMeInSameSceneWithoutSizeAttenuation();}
        }

            function redrawInitialScene() {                
                if (size_attenuation) {
                    renderFrame.reDrawMe();
                }
                else { renderFrame.reDrawMeWithoutSizeAttenuation(); }
            }

            function ChangeColor(node, color) {
                var id = node.getId();
                previousColor[id] = node.getColor();
                node.setColor(color);
            }

            function ReturnPreviousColor(node) {
                var id = node.getId();
                var color = previousColor[id];
                if (color != undefined) {
                    node.setColorHex("#" + color);
                }
            }

            function ReturnAllColors() {
                var nodes = graph.getNodes();
                for (var i = 0; i < nodes.length; i++) {
                    ReturnPreviousColor(nodes[i]);
                }
                redrawSameScene();
            } 
