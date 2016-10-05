[![DOI](https://zenodo.org/badge/24090/sonjageorgievska/CClusTera.svg)](https://zenodo.org/badge/latestdoi/24090/sonjageorgievska/CClusTera)



# DiVE   -  Interactive Visualization of Embedded Data

 
DiVE is an interactive 3D web viewer of up to million points on one screen that represent data. It is meant to provide interaction for viewing high-dimensional data that has been previously embedded in 3D. For embedding (non-linear dimensionality reduction, or manifold learning) we recommend LargeVis (a new algorithm by Microsoft Research, http://github.com/sonjageorgievska/LargeVis/) or tSNE (https://github.com/lvdmaaten/bhtsne) .       

For an online demo go to  [http://sonjageorgievska.github.io/DiVE/](http://sonjageorgievska.github.io/DiVE/ "online demo"). Or open index.html in Mozzila Firefox to run a demo on your local computer.   


##Installation##

The simplest way is to have the Mozilla Firefox browser installed and to open *index.html* with it.   

If you would like to use Google Chrome or any other browser, you would have to

1. Install *node* server from [http://nodejs.org](http://nodejs.org) 
2. Go to the main folder of *DiVE* with your command line interpreter (where *index.htm*l is)
3. type `node server.js` 
4. open your browser and type `http://localhost:8082/index.html` 

## Data description and functionality ##

- Every point has 3 coordinates and a unique ID.
 
- A point can optionally have “Categories” and “Properties”:
 
 - “Categories” is a list of names associated with the point. This list is displayed when a user hovers over a point with the mouse or equivalent.
  
 - “Properties” is a list of real numbers. Each number represents the intensity of a respective property. These numbers are used in the Coloring section of the UI of the web-page. When the user selects a property, and a color, every point is colored with a shade of the selected color. The intensity of the color corresponds to the intensity of the selected property for the particular point. 

A user can search for all points that contain a certain substring in their ids, names or categories, by using the Search section. Then all points that are a match become red, and the rest become grey. 
  
The “Resume colors” buttons return the colors of the points to the previous coloring scheme. 

## Data format ##

- The data is in a JSON (JavaScript Object Notation)  format. (See data/smalldata.json for an example.)
To obtain *data.js*, first a data structure

		Dictionary<string, Point>

is created in any programming language, where the keys are the id’s of the points and `Point` is an object of the class 
  
		public class Point
		    {
		        public List<double> Coordinates;
		        public List<object> Categories;
		        public List<double> Properties;
		    }

`Coordinates, Categories` and `Properties` are as discussed in the previous section.

Next, the dictionary is serialized using JavaScriptSerializer and written in *data.json* (name is flexible). 
Here is an example of an entry of the serialized dictionary in a *data.json* file:

		"3951":{"Coordinates":[0.99860800383893167,0.61276015046241838,0.450976426942296],
			"Categories":["Prototheca cutis","Prototheca cutis","Prototheca","",""],
			"Properties":[9,4,4]}


The output of LargeVis can be processed into an input of the viewer by using the scripts in "the folder "prepareData"... (TBC)...

