//################# global variables definitions start here

        
        var loadFirstTime = true;
        var frameStartsAt = 285;
        var sizeAtShow = document.getElementById("sizeattenuation");
        var myColorpicker;//UI
        var cursorX;//used in Popup for UI
        var cursorY;//used in Popup for UI
        var myPop = new dhtmlXPopup();//UI
        var pointsSet;        
        var nodesColor = "yellow";       
        var previoslyhoveredNode;//hovering changes temporarily the color of a node to white, therefore we need to remember this
        var previosHoveredcolor;//the color of previoslyhoveredNode
        var smallData; // would hold all data in case bigdata == false
        var node_size = 0.016;
        var size_attenuation = true;
        var graph = InitializeGraph();       
        var selectedPropertyIndex;//holds the index of the most recently selected numerical property (by the user)
        var previousColor = [];//used in resume colors      
        var priority = DefinePrioritiesOfOperators();
        var searchExprWellDefined;
        var allNodes = [];
        var foundNodes=[];

        //################# global variables definitions end here

        //################# global code starts here

        InitEventHandlers();
        InitGlobalDataVariables();
        defineColorPicker2();
        LoadLocalDataSet();

        document.onmousemove = function (e) {//we have to track where the mouse is for the pop-up message
            cursorX = e.clientX;
            cursorY = e.clientY;
        }
        document.onclick = function (e) {
            myPop.hide();
        }

        //################## global code ends here
