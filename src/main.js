//################# global variables definitions start here


        var loadFirstTime = true; //keeps track of whether the frame was loaded for the first time
        var frameStartsAt = 285;//pixels 
        var sizeAtShow = document.getElementById("sizeattenuation");
        var myColorpicker;//UI
        var cursorX;//used in Popup message for UI
        var cursorY;//used in Popup message for UI
        var myPop = new dhtmlXPopup();//UI, the popup message that is displayed when hovering over a node          
        var previoslyhoveredNode;//hovering changes temporarily the color of a node to white, therefore we need to remember this
        var previosHoveredcolor;//the color of previoslyhoveredNode
        var node_size = 0.016;
        var size_attenuation = true; //whether nodes closer to camera appear bigger (3d effect)
        var graph = InitializeGraph();//the graph is what is rendered, points are nodes of the graph. Optionally the graph can contain edges    
        var selectedPropertyIndex;//holds the index of the most recently selected numerical property (by the user)
        var previousColor = [];//a list of previous colors of nodes in graph, used in `resume colors`. Could be made a property of the node       
        var priority = DefinePrioritiesOfOperators();//for each boolean operator AND, OR and NOT used in the search
        var searchExprWellDefined;//holds whether the search expression entered by the user is well defined
        var allNodes = [];//keeps all nodes, to be able to switch easily between "show only found nodes" and "show all nodes"
        var foundNodes=[]; //keeps the nodes that were found in the last search
        var pointsSet;
        var old_d = undefined;// used in determining the mouse zoom speed 
        var start_zoomin_factor = 1;
        //################# global variables definitions end here

        //################# global code starts here

        InitEventHandlers();
        InitGlobalDataVariables();
        defineColorPicker2();
        LoadLocalDataSet();

        //Updates the cursorX and cursorY every time the mouse is moved                 
        document.onmousemove =         
        function (e) {//we have to track where the mouse is for the pop-up message
            cursorX = e.clientX;
            cursorY = e.clientY;
        }

        //Hides the pop up message resulting from hovering when a user clicks on the document
        document.onclick =        
        function (e) {
            myPop.hide();
        }

        //################## global code ends here
