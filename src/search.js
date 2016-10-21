/**Searches the nodes that are already loaded in the graph and colorizes in red those whose metadata or id satisfies the expression
 * @param {string} expression - a boolean expression of regular expression. Ex: xx AND Y OR NOT zz. xx, yy, and zz are regular expressions. 
 * The presedence of the boolean operators is defined in DefinePrioritiesOfOperators().
 */
function SearchAndColorizeByExpression(expression)//searches the nodes that are already loaded in the graph. 
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

        /** Evaluates if a the metadata of a node (id + categories) contains the regular expression word
         * @param {Graph.node} node - the node that is being evaluated
         * @param {string} word - a regular expression  
         */
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

        /** Evaluates  if the metadata (id + categories) of a node satisfies the expression. Not case sensitive. Implements the 'shunting yard' algorithm 
         * @param {Graph.node} node - the node that is evaluated
         * @param {string} expression - the expression under which the node is evaluated. A boolean expression of regular expression. Ex: xx AND Y OR NOT zz. xx, yy, and zz are regular expressions. 
 * The presedence of the boolean operators is defined in DefinePrioritiesOfOperators().
        */        
        function Evaluate(node, expression) {          
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
        
        /** Evaluates if the string word is in the list [AND, OR, NOT] */
        function Is_operator(word) {
            if (["AND", "NOT", "OR"].indexOf(word) > -1) {
                return true;
            }
            else return false; 
        }
       
        /** Evaluates if an operator has a higher priority than the top of the operatorsStack
         * @param {list} operatorsStack - the stack of operators as defined in the shunting yard algorithm by Dijkstra
         * @param {string} operator - one of NOT, AND, and OR.
          */
        function HasHigherPriority(operatorsStack, operator) {
            len = operatorsStack.length;
            if (len == 0) { return false; }
            else {
                var top = operatorsStack[len - 1];
                if (priority[top] > priority[operator]) { return true; }
                else return false; 
            }
        }

        /** The core of the shunting yard algorithm. Better not to modify.          
        */
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

        /** Defines the priorities of the operators NOT, AND, OR. The higher the number, the higher the priority. */
        function DefinePrioritiesOfOperators() {
            priority = {};
            priority["NOT"] = 3;
            priority["AND"] = 2;
            priority["OR"] = 1;
            return priority;
        }
        
        /** Finishes the shunting yard algorithm. Better not to modify. */
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