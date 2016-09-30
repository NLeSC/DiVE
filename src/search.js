function SearchAndColorizeByExpression(expression)//searches the nodes that are already loaded in the graph. Means if you color while still loading data, the new data will not be colored
{
    $("#labelsearch").text("")
            foundNodes = [];
            searchExprWellDefined = true;
            var count = 0;
            var nodes = graph.getNodes();
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var sat = Evaluate(node, expression); //evaluate whether node satisfies expression
                if (sat) {
                    ChangeColor(node, "darkred");
                    count++;
                    foundNodes.push(node);
                }
                else { ChangeColor(node, "grey"); }               
            }
            if (show_found_nodes.checked) {
                LoadOnlyFoundNodes();
            }
            redrawSameScene();
            if (searchExprWellDefined) {
                //alert("Number of selected data points: " + count); //AK 02/06/2016
               // $("#labelsearch").text("Number of points found: " + count);
                $("#label_search2").text("Number of points found: " + count);
            } else { $("#label_search2").text("Search expression is not well defined!"); }

        }

        function Contains(node, word)
        {
            var found = false;
            var nodeId = node.getId();
            nodeId = nodeId.toLowerCase();
            word = word.toLowerCase();
            if (nodeId.search(word) > -1) {
                found = true;
            }
            else {
                var categories = node._categoriesValues;
                for (var j = 0; j < categories.length; j++) {
                    var prop = categories[j].toLowerCase();
                    if (prop.search(word) > -1) { found = true; }
                }
            }
            return found;
        }

        function Evaluate(node, expression) {//implements the shunting yard algorithm            
            var words = expression.split(" ");
            var operandsStack = [];
            var operatorsStack = [];
            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                if (Is_operator(word) == false) {//if the word is an operand
                    operandsStack.push(Contains(node, word));
                }
                else {//if the word is operator
                    var operator = word;                                                           
                    while (HasHigherPriority(operatorsStack, operator))//watchout: operatorsStack could be empty
                    {
                        ApplyOperation(operatorsStack, operandsStack);//watchout: could be also unary
                    }
                    operatorsStack.push(operator); 
                }
            }
            var finalValue = EmptyStacks(operatorsStack, operandsStack);
            return finalValue;
        }
        
        function Is_operator(word) {
            if (["AND", "NOT", "OR"].indexOf(word) > -1) {
                return true;
            }
            else return false; 
        }
       
        function HasHigherPriority(operatorsStack, operator) {
            len = operatorsStack.length;
            if (len == 0) { return false; }
            else {
                var top = operatorsStack[len - 1];
                if (priority[top] > priority[operator]) { return true; }
                else return false; 
            }
        }

        function ApplyOperation(operatorsStack, operandsStack) {
            var operator = operatorsStack.pop();
            switch (operator)
            {
                case "NOT": {
                    if (operandsStack.length == 0)
                    {   searchExprWellDefined = false;
                        break;
                    }
                    var operand = operandsStack.pop();
                    operandsStack.push(!operand);
                    break;
                }                    
                case "AND": {
                    if (operandsStack.length < 2) {
                        searchExprWellDefined = false;
                        break;
                    }
                    var operand1 = operandsStack.pop();
                    var operand2 = operandsStack.pop();
                    operandsStack.push(operand1 && operand2);
                    break;
                }
                case "OR": {
                    if (operandsStack.length < 2) {
                        searchExprWellDefined = false;
                        break;
                    }
                    var operand1 = operandsStack.pop();
                    var operand2 = operandsStack.pop();
                    operandsStack.push(operand1 || operand2);
                    break;
                }                
            }            
        }

        function DefinePrioritiesOfOperators() {
            priority = {};
            priority["NOT"] = 3;
            priority["AND"] = 2;
            priority["OR"] = 1;
            return priority;
        }
        

        function EmptyStacks(operatorsStack, operandsStack) {

            while (operatorsStack.length > 0) {
                ApplyOperation(operatorsStack, operandsStack);
            }            
            if (operandsStack.length == 1) {
                return operandsStack[0];
            }
            else {
                searchExprWellDefined = false;
                return false;
            }            
        }

        function empty_notification() { $("#label_search2").text(" "); }