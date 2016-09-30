import fileinput #for reading large files
import json
import random
import numpy as np
import os
import shutil
import csv 
import math
from datetime import datetime
import argparse as argp


#region parse command-line args
parser = argp.ArgumentParser(
   description = 'This script creates input files for CCluster hierarchical cluster visualization tool.')

parser.add_argument(
   '-i',
   dest = 'graphFile',
   help = 'Input file containing a similarity graph in edge list format')

parser.add_argument(
   '-c',
   dest = 'clustFile',
   help = 'Input file containing hierarchical clusters')

parser.add_argument(
   '-m',
   dest = 'metaFile',
   help = 'Input file containing cluster meta data')

parser.add_argument(
   '-d',
   dest = 'baseDir',
   help = 'Base directory to store output files')

parser.add_argument(
   '-p',
   dest = 'precision',
   help = 'precision of embedding (between 1 and 30)')

args = parser.parse_args()
#endregion
           
#class Embedding:

#region Reading data

#def ReadTestFile():
#    with open('smalldata.json') as data_file:    
#        data = json.load(data_file)
#        return data

def ReadMetaDataFile(metaDataFile):
    """File format: [id] [metadata] 
    metadata format: "first_line" "second_line" "third_line" """
    metaDataDict = dict()
    for line in fileinput.input([metaDataFile]):
        if line != "\n":   
            for items in csv.reader([line], delimiter='\t', quotechar='"'): # tabs are delimiters, but qouted text counts as single word
                id = items[0]     
                items.pop(0) # remove the first item                            
                metaDataDict[id] = items
    return metaDataDict

def ReadPropertiesIntensitiesFile(propertiesIntensitiesFile):
    """File format: [id] [intensityOfProperty1] [intensityOfProperty2]... [intensityOfPropertyN]"""      
    intensitiesDict = dict()
    for line in fileinput.input([propertiesIntensitiesFile]):
        if line != "\n":   
            items = line.split()
            id = items[0]     
            items.pop(0)                             
            intensitiesDict[id] = items
    return intensitiesDict

def ReadSimilarityGraph(simGraphFile): # used in hierarchical embedding mode
    """Reads from simGraphFile, that has a format ' id1 id2 similarityScore '.
    Returns a dictionary with key = (id1, id2) and value = similarityScore."""
    similarityDict = dict()
    for line in fileinput.input([simGraphFile]):
        if line != "\n":   
            items = line.split()
            similarityDict[items[0], items[1]] = float(items[2])                
    return similarityDict
    
def ReadSimilarityGraph(simGraphFile, indexedKeys):# used in flat embedding mode, indexed keys are used for fast random retrieval of a dictionary item
    """Reads from simGraphFile, that has a format ' id1 id2 similarityScore '.
    Returns a dictionary with key = (id1, id2) and value = similarityScore."""
    similarityDict = dict()
    i=0
    for line in fileinput.input([simGraphFile]):
        if line != "\n":   
            items = line.split()
            similarityDict[items[0], items[1]] = float(items[2])
            indexedKeys.append([items[0], items[1]]) 
            i+=1
    return similarityDict

def CombinePrefixesInPath(stringWithDots):# used only for the OMA data, because of its specific format
    listje = stringWithDots.split('.')
    path = []
    i = 0
    for item in listje:                        
        if i==0:
            prefix = item
        else:
            prefix = str(prefix + '.' + item)
        path.append(prefix)
        i+=1
    return path

def AddInterPaths(inter_paths, paths): # used only for the OMA data, because of its specific format
    for item in inter_paths:
        list_ofPrefixes = CombinePrefixesInPath(item)
        for prefix in list_ofPrefixes:
            paths[prefix] = CombinePrefixesInPath(prefix)


def readClusteringHierarchy(clusteringHierarchyFile, isEmbeddingHierarchical):#specific to OMA data
    #"""Reads file of format 'path id'. 
    #Path has a format id1.id2.id3.id4 if there are 4 levels in clustering hierarchy.
    #If idx is singleton after e.g. second level, path has a format id1.id2.idx.idx # to be updated        
    #Returns a dictionary with key= id and value = [id1, id2, idr, id4] """
    paths = dict()
    if isEmbeddingHierarchical:
        inter_paths = []
        for line in fileinput.input([clusteringHierarchyFile]):
            if line != "\n":   
                items = line.split()
                paths[items[1]] = CombinePrefixesInPath(items[0])
                inter_paths.append(items[0])
        AddInterPaths(inter_paths, paths)
    else: 
        for line in fileinput.input([clusteringHierarchyFile]):
            if line != "\n":   
                items = line.split()
                paths[items[1]] = ["0"]
    return paths
    
#endregion 
    
#region Analytics
        

def MakeChildrenListPerParentPerLevel(pathsDict):
    """Creates a Dictionary where key is parent id and value is a list. The entries of the list are lists of children at level=index of entry"""
    dictionary = dict()
    for key in pathsDict:
        level = 0
        for parent in pathsDict[key]:  
            if (parent == key):
                continue              
            nivo = len(pathsDict[key]) 
            toPut = 0
            if nivo > level + 1 and pathsDict[key][level] == parent and pathsDict[key][level + 1] == key:
                toPut = 1
            else:
                if nivo == level + 1 and pathsDict[key][level] == parent:
                    toPut = 1
            if toPut == 1:
                if parent not in dictionary:
                    dictionary[parent] = []
                while len(dictionary[parent]) <= level:
                    dictionary[parent].append([])
                dictionary[parent][level].append(key)
            level +=1
    return dictionary     

def ConvertSimilarityGraphToDistance(similarityDict): 
    """Converts non-negative real-valued similary scores to distances between 0 and 1.
        First the similarities are linearly scaled from [0, maxscore] to [0,1) and then distances are computed by dist = 1 - sim  """
    maxScore = max(similarityDict.values()) * 1.01 # the factor 1.01 is to avoid having distance of 0 between items that are not equal
    if maxScore > 0:
        for key in similarityDict:
            similarityDict[key] = 1 - similarityDict[key] / maxScore # the distance is between 0 and 1
    else:
        for key in similarityDict:
            similarityDict[key] = 1   

def FindChildren(parent, level, childrenDict): #runs in constant time
    """Returns a list of all direct children of parent at the given level. """     
    if parent in childrenDict and len(childrenDict[parent]) > level:
        return  childrenDict[parent][level]   
    else:
        return []
       
def InitializePointsRandomlyForHierarchical(keys,  parent,  fixedCoordinate, coordinates, level):
    """All objects in keys whose coordinates are not fixed yet are assigned random coordinates with values in (0,1)"""
    for key in keys:
        if key not in fixedCoordinate:               
            factor = math.pow(3, level+1)
            coordinates[key] = np.array([random.random()/factor, random.random()/factor, random.random()/factor]) - np.array([0.5/factor, 0.5/factor, 0.5/factor] )  
            if parent !=-1:
                coordinates[key] += fixedCoordinate[parent]
    
def InitializePointsRandomly(keys, parent, fixedCoordinate, coordinates):
    """All objects in keys are assigned random coordinates with values in (0,1)"""
    for key in keys:
        if True:
            coordinates[key] = np.array([random.random()/50, random.random()/50, random.random()/50])   # 50 is just a random factor, could be also 1
            if parent !=-1:
                coordinates[key] += fixedCoordinate[parent]

def FixCoordinatesHierarchical(keys, parent, edgesDict, fixedCoordinate, coordinates, level, precision):
    """Implements the Stochastic Proximity Embedding algorithm to determine and fix the coordinates of objects with ids in keys.
    See https://www.researchgate.net/publication/10696705_Stochastic_proximity_embedding"""
    lambd = 1.0           
    epsilon = 0.00001             
    InitializePointsRandomlyForHierarchical(keys, parent, fixedCoordinate, coordinates, level)#coordinates is a dictionary per parent id, value is a list of 3
    n = int(precision)
    cycles = n
    numberOfPoints = len(keys)
    steps = n* numberOfPoints
    delta = 1.0 / cycles
    while (lambd > 0):
        for count in range(0, steps):                
            i = random.choice(keys)
            j = random.choice(keys)
            if i != j: 
                dist = np.linalg.norm(coordinates[i] - coordinates[j])
                if (i,j) in edgesDict: 
                    rd = edgesDict[i,j]/math.pow(3, level+1)
                else:
                    rd =  1/math.pow(3, level+1)
                if dist != rd:                        
                    vec = coordinates[i] - coordinates[j]
                    incr = lambd * 0.5 * (rd - dist) * vec / (dist + epsilon)
                    if i not in fixedCoordinate:
                        coordinates[i] += incr
                    if j not in fixedCoordinate:
                        coordinates[j] += (-1) * incr                                                           
        lambd -= delta      
    for key in keys:
        fixedCoordinate[key] = coordinates[key]      
 
def MovePointsAwayFromOrTowardsEachOther(coordinates, i,j, lambd, rd, dist, epsilon):
    vec = coordinates[i] - coordinates[j]
    incr = lambd * 0.5 * (rd - dist) * vec / (dist + epsilon)                                           
    coordinates[i] += incr
    coordinates[j] += (-1) * incr

def PickARandomEdge(indexedKeys):
    index = random.randint(0, len(indexedKeys)-1)               
    edge = indexedKeys[index]
    return edge
                              
def FixCoordinates(keys, parent, edgesDict, fixedCoordinate, coordinates, level, indexedKeys, precision):
    """Implements the Stochastic Proximity Embedding algorithm to determine and fix the coordinates of objects with ids in keys.
    See https://www.researchgate.net/publication/10696705_Stochastic_proximity_embedding.
    keys: the ids of the data points that should be embedded.
    parent: a dummy variable, always set to 0. should be removed eventually."""
    lambd = 1.0  # lambd is the dumping factor (internal variable), it starts always from 1 and is gradually reduced to 0  with a step delta = 1.0 / cycles       
    epsilon = 0.00001 # to avoid division by zero. Does not to be altered.             
    InitializePointsRandomly(keys, parent, fixedCoordinate, coordinates)#coordinates is a dictionary per parent id, value is a list of 3       
    cycles = int(precision) # the number of outer cycles (that reduce the dumping factor lambda)
    numberOfPoints = len(keys)
    steps = 10 * numberOfPoints # the number of inner cycles, that pick two random points (a random edge actually) and adjust their coordinates so that the 3D euclidean distance fits better the theoretical distance
    delta = 1.0 / cycles
    while (lambd > 0):
        for count in range(0, steps):  
            edge = PickARandomEdge(indexedKeys)                                                             
            i = edge[0]
            j = edge[1]                
            if i!=j and i in coordinates and j in coordinates: # a workaround, in a good dataset this should always hold
                dist = np.linalg.norm(coordinates[i] - coordinates[j]) # the current distance
                rd = edgesDict[i,j] # the theoretical distance
                if dist != rd:                        
                    MovePointsAwayFromOrTowardsEachOther(coordinates, i,j, lambd, rd, dist, epsilon)                                                                                                 
        lambd -= delta      
    for key in keys:
        fixedCoordinate[key] = coordinates[key]      


#def RecursivelyEmbedNoGrandparent(parents, level, edgesDict, fixedCoordinate, coordinates, childrenDict, precision):
#    """Embeds the hierarchicall data set in a hiearchical manner"""
#    FixCoordinates(parents, edgesDict, fixedCoordinate, coordinates, precision)
#    for parent in parents:
#        children = FindChildren(parent, level, childrenDict)
#        if len(children) > 0:
#            RecursivelyEmbed(children, level+1,  edgesDict, fixedCoordinate, coordinates, childrenDict, precision)     
    
def RecursivelyEmbed(parents, grandparent, level,  edgesDict, fixedCoordinate, coordinates, childrenDict, indexedKeys, precision):
    """Embeds the hierarchical data set in a hiearchical manner"""
    FixCoordinates(parents, grandparent, edgesDict, fixedCoordinate, coordinates, level, indexedKeys, precision)
    for parent in parents:
        children = FindChildren(parent, level, childrenDict)                   
        if len(children) > 0:
            RecursivelyEmbed(children, parent, level+1,  edgesDict, fixedCoordinate, coordinates, childrenDict, indexedKeys, precision)                         

def RecursivelyEmbedHierarchical(parents, grandparent, level,  edgesDict, fixedCoordinate, coordinates, childrenDict, precision):
    """Embeds the hierarchical data set in a hiearchical manner"""
    FixCoordinatesHierarchical(parents, grandparent, edgesDict, fixedCoordinate, coordinates, level, precision)
    for parent in parents:
        children = FindChildren(parent, level, childrenDict)                   
        if len(children) > 0:
            RecursivelyEmbedHierarchical(children, parent, level+1,  edgesDict, fixedCoordinate, coordinates, childrenDict, precision)     
    
def ComputeDistance(a,b, edgesDict, level, childrenDict): # still experimental
    if a==b:
        return 0
    if (a,b) in edgesDict:
        return edgesDict[a,b]
    if (b,a) in edgesDict:
        return edgesDict[b,a]
    else:
        children_a = FindChildren(a, level, childrenDict)
        children_b = FindChildren(b, level, childrenDict)
        if len(children_a) > 0 and len(children_b)> 0:
            return AverageDistance(children_a, children_b, level+1, edgesDict, childrenDict)
        else:
            if len(children_a) > 0:
                return AverageDistance(children_a, [b], level+1, edgesDict, childrenDict)
            else: 
                if len(children_b) > 0:
                    return AverageDistance([a], children_b, level+1, edgesDict,  childrenDict)
                else: #if both sets of children are empty
                    return 1.0222

def AverageDistance(set1, set2, level, edgesDict, childrenDict): # still experimental
    averageDist = 0
    for i in set1:
        j = random.choice(set2) # a faster variant than to double - cycle       
        if True: # just to preserve the alignment
            dist = ComputeDistance(i, j, edgesDict, level, childrenDict)            
            averageDist += dist
    averageDist /= len(set1) 
    return averageDist

##original
#def AverageDistance(set1, set2, level, edgesDict, childrenDict):
#    averageDist = 0
#    for i in set1:        
#        for j in set2: #  an exact but slow variant        
#            dist = ComputeDistance(i, j, edgesDict, level, childrenDict)            
#            averageDist += dist
#    averageDist /= len(set1) * len(set2)
#    return averageDist

def RecursivelyComputeDistances(set, level, edgesDict, childrenDict): # still experimental
    print(str(datetime.now()) + ": Entered set:" + str(set)) 
    for key in set:
        children = FindChildren(key, level, childrenDict)
        if len(children) > 0:
                RecursivelyComputeDistances(children, level+1, edgesDict, childrenDict)
    print(str(datetime.now()) + ": Starting computations for set:" + str(set)) 
    for i in range(0, len(set)):
        for j in range(0, len(set)):  
            if (set[i],set[j]) not in edgesDict:                   
                dist = ComputeDistance(set[i], set[j], edgesDict, level, childrenDict)
                edgesDict[set[i],set[j]] = dist
    print(str(datetime.now()) + ": Finished computations for set:" + str(set)) 

def ComputeDistances():# experimental, for hierarchical embedding
    print(str(datetime.now()) + ": Start computing distances...")
    RecursivelyComputeDistances(roots, 0, edgesDict, childrenDict)
    print(str(datetime.now()) + ": Start writing distances...")
    CreateDirIfDoesNotExist(dirname1)
    WriteEdgesFile(edgesDict, dirname1)

#region Write output

def CreateDataJSONFile(allPoints, parentsKeys, startingFolder):
    currentPoints= dict()
    for key in parentsKeys:
        if key in allPoints:# a workaround, in a good dataset this should always hold
            currentPoints[key] = allPoints[key]
    string = json.dumps(currentPoints)
    file = open(os.path.join(startingFolder, "data.json"), "w")
    file.write(string)
    file.close()

def RecursivelyCreateDataFileAndFolders(allPoints, parentsKeys, level, startingFolder, childrenDict):#allPoints is a dict where keys are id's and values are Point objects    
    CreateDataJSONFile(allPoints, parentsKeys, startingFolder)
    for parent in parentsKeys:
        childrenKeys = FindChildren(parent, level, childrenDict)
        if len(childrenKeys) > 0:
            CreateDirIfDoesNotExist(os.path.join(startingFolder, parent))
            RecursivelyCreateDataFileAndFolders(allPoints, childrenKeys, level+1, os.path.join(startingFolder , parent), childrenDict)       
    
def CreateSmallDataJSONFile(allPoints, startingFolder):
    string = json.dumps(allPoints)
    file = open(os.path.join(startingFolder, "smalldata.json"), "w")
    file.write(string)
    file.close()
   
def CreateMetaDataFileForBigDataMode(startingFolder, bigdatamode):
    string = "var bigData =" + bigdatamode + ";"
    file = open(os.path.join(startingFolder, "MetaData.js"), "w")
    file.write(string)
    file.close()

def CreatePointsDictionary(fixedCoordinates, pathsDict, metaDataDict, intensitiesOfPropertiesDict):
    pointsDict = dict()
    for key in pathsDict:
        point = dict()
        point["Path"] = pathsDict[key]
        point["Coordinates"] = fixedCoordinates[key]
        #point["Coordinates"].append(0)
        if (metaDataDict != "no" ):
            if key in metaDataDict:
                point["Categories"] = metaDataDict[key]
            else:
                point["Categories"] = []
        if (intensitiesOfPropertiesDict != "no"):                
            point["Properties"] = intensitiesOfPropertiesDict[key]
        else: 
            point["Properties"] = []
        pointsDict[key] = point
    return pointsDict

def CreateDirIfDoesNotExist(dirname):
    if not os.path.exists(dirname):          
        os.makedirs(dirname)

def RemoveDirTreeIfExists(dirname):        
    if os.path.exists(dirname):
        shutil.rmtree(dirname)

def remap_keys(mapping):
    return [{'key':k, 'value': v} for k, v in mapping.items()]

def WriteEdgesFile(edgesDict, startingFolder):  
    string = json.dumps(remap_keys(edgesDict)) 
    file = open(os.path.join(startingFolder + "edgesDict.json"), "w")
    file.write(string)
    file.close()
            
#endregion 

#region Workflow
def ExtractRoots(pathsDict):
    roots = []
    for path in pathsDict.values():
        roots.append(path[0])
    roots = list(set(roots))
    return roots

def ConvertCoordinatesToList(fixedCoordinate):
    for key in fixedCoordinate:
        fixedCoordinate[key] = list(fixedCoordinate[key])
                       
def Workflow(simGraphFile, clusteringHierarchyFile, metaDataFile, namesOfPropertiesFile, propertiesIntensitiesFile, baseDir, bigDataMode = "true", isEmbeddingHierarchical= False, isOSWindows = False, precision = 10):
    """ Runs all functions to read, embed in 3D and write data.
    simGraphFile contains the sparse similarity matrix.  Format: [id1] [id2]  [similarityScore] 
    clusteringHierarchyFile contains path in tree for every id. Format: [parent1ID.parent2ID.parent3ID.....parentNID] [id]
    metaDataFile contains text that is displayed for every point. Format: [id] ["line1text"] ["line2text"] ... ["lineNtext"]
    namesOfPropertiesFile contains the names of the properties, the intensities of which are given in file propertiesIntensitiesFile. It must be a json file. Format : [ ["PropertyName1", "PropertyName2", ... "PropertyNameN"] ]. E.g. ["Age", "Size"]       
    propertiesIntensitiesFile contains the intensities of the properties per point. Format: [id] [intensityProperty1] [intensityProperty2] ... [intensityPropertyN]
    bigDataMode is "true" or "false", depending on the mode in which the application should run. If "false", then there is a slidebar for loading all points up to a level
    isOSWindows - selfexplanatory. Important in case the paths are long.
    precision: between 1 and 100. The higher, the more precise the embedding"""        
    print(str(datetime.now()) + ": Removing old data...")
    dirname1 =  os.path.join(baseDir, "data")
    if isOSWindows:
        dirname1 = "\\\\?\\" + dirname1  
    RemoveDirTreeIfExists(dirname1)
    print(str(datetime.now()) + ": Reading input files...")
    if metaDataFile != "No":
        metaDataDict = ReadMetaDataFile(metaDataFile)
    else: 
        metaDataDict = "no"
    if propertiesIntensitiesFile != "No":
        intensitiesDict = ReadPropertiesIntensitiesFile(propertiesIntensitiesFile)
    else:
        intensitiesDict = "no"
    indexedKeys = []
    if isEmbeddingHierarchical:
        edgesDict = ReadSimilarityGraph(simGraphFile)
    else: 
        edgesDict = ReadSimilarityGraph(simGraphFile,indexedKeys)
    ConvertSimilarityGraphToDistance(edgesDict)
    pathsDict = readClusteringHierarchy(clusteringHierarchyFile, isEmbeddingHierarchical)
    childrenDict = MakeChildrenListPerParentPerLevel(pathsDict)
    fixedCoordinate = dict()
    coordinates = dict()
    print(str(datetime.now()) + ": Start ..")
    roots = ExtractRoots(pathsDict)        
    if isEmbeddingHierarchical:

        print(str(datetime.now()) + ": Start embedding hierarchical...")
        RecursivelyEmbedHierarchical(roots, -1, 0, edgesDict, fixedCoordinate, coordinates, childrenDict, precision)
    else:
        RecursivelyEmbed(roots, -1, 0, edgesDict, fixedCoordinate, coordinates, childrenDict, indexedKeys, precision)
    ConvertCoordinatesToList(fixedCoordinate)
    pointsDict = CreatePointsDictionary(fixedCoordinate, pathsDict, metaDataDict, intensitiesDict)        
    print(str(datetime.now()) + ": Start writing output...") 
        
    CreateDirIfDoesNotExist(dirname1)
    RecursivelyCreateDataFileAndFolders(pointsDict, roots, 0, dirname1, childrenDict)
    if bigDataMode == "false": 
        CreateSmallDataJSONFile(pointsDict, dirname1)
    shutil.copy(namesOfPropertiesFile, dirname1)
    CreateMetaDataFileForBigDataMode(dirname1, bigDataMode)
    print(str(datetime.now()) + ": Finished writing output.")
#endregion
         
#region Main

#calling in hierarchical embedding mode
#Workflow("sim.txt", "clusters.txt", "oma-hogs_banana.meta", "NamesOfProperties.json","No", os.getcwd(), "false", True, True, 1 )
#Workflow("MUSAC-MUSAM.graph", "oma-hogs_banana.cls", "oma-hogs_banana.meta", "NamesOfProperties.json","No", os.getcwd(), "false", True, True, 1 )
#calling in flat embedding mode
#Workflow("MUSAC-MUSAM.graph", "oma-hogs_banana.cls", "oma-hogs_banana.meta", "NamesOfProperties.json","No", os.getcwd(),"false", False, True, 1)

Workflow(args.graphFile, args.clustFile, args.metaFile, "NamesOfProperties.json","No", args.baseDir, "false", False, False, args.precision)
#endregion