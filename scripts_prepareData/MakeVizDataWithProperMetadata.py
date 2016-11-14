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
   description = 'This script creates the input data folder for the visualization tool.')

parser.add_argument(
   '-coord',
   dest = 'coordinatesFile',
   help = 'Input file containing the direct output from LargeVis')

parser.add_argument(
   '-metadata',
   dest = 'metaDataFile',
   help = 'Input file containing the text accompanying the data. Format: [id] [metadata] . Metadata format: "first_line" "second_line" "third_line" ..."n_line"')

parser.add_argument(
   '-dir',
   dest = 'baseDir',
   help = 'Base directory to store output files')

parser.add_argument(
   '-np',
   dest = 'namesOfPropertiesFile',
   help = 'A json file containing list of numerical properties names. Ex: ["Pressure", "Height", "Weight"]')

parser.add_argument(
   '-pif',
   dest = 'propertiesIntensitiesFile',
   help = 'A file containing intensities of properties. File format: [id] [intensityOfProperty1] [intensityOfProperty2]... [intensityOfPropertyN]')

args = parser.parse_args()
#endregion
           


#region Reading data

def ReadMetaDataFile(metaDataFile):
        """File format: [id] [metadata] 
        metadata format: "first_line" "second_line" "third_line" ... "n_line" """
        metaDataDict = dict()
        for line in fileinput.input([metaDataFile]):
            if line != "\n":   
                for items in csv.reader([line], delimiter=' ', quotechar='"'): 
                    id = items[0]     
                    items.pop(0)                             
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

def ReadCoordinates(file):     
    fixed = dict()
    maxabs = 0
    for line in fileinput.input([file]):
        if line != "\n":   
            items = line.split()
            if len(items)==4:# to skip the first line 
                maxabs = max(abs(float(items[1])), max(abs(float(items[2])), abs(float(items[3]))), maxabs)
                fixed[items[0]] = [float(items[1]), float(items[2]), float(items[3])]
    for key in fixed.keys():
        lis = fixed[key]
        fixed[key] = [lis[0]/maxabs, lis[1]/maxabs, lis[2]/maxabs]
    return fixed

#endregion 

          



#region Write output


def CreateSmallDataJSONFile(allPoints, startingFolder):
    string = json.dumps(allPoints)
    file = open(os.path.join(startingFolder, "smalldata.json"), "w")
    file.write(string)
    file.close()
   


def CreatePointsDictionary(fixedCoordinates,  metaDataDict, intensitiesOfPropertiesDict, namesOfPropertiesFile):
    pointsDict = dict()
    if namesOfPropertiesFile != "No":
        with open(namesOfPropertiesFile) as json_data:
            list = json.load(json_data)
        pointsDict["NamesOfProperties"] = list
    for key in fixedCoordinates.keys():
        point = dict()

        point["Coordinates"] = fixedCoordinates[key]
        if (metaDataDict != "no" ):
            if key in metaDataDict:
                point["Categories"] = metaDataDict[key]
            else:
                point["Categories"] = []
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

            
#endregion 

#region Workflow

def ConvertCoordinatesToList(fixedCoordinate):
    for key in fixedCoordinate:
        fixedCoordinate[key] = list(fixedCoordinate[key])
                       
def Workflow(coordinatesFile, metaDataFile, namesOfPropertiesFile, propertiesIntensitiesFile, baseDir):      
    print(str(datetime.now()) + ": Removing old data...")
    dirname1 =  os.path.join(baseDir, "data")
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
    fixedCoordinate = ReadCoordinates(coordinatesFile)
    ConvertCoordinatesToList(fixedCoordinate)   
    pointsDict = CreatePointsDictionary(fixedCoordinate, metaDataDict, intensitiesDict, namesOfPropertiesFile)        
    print(str(datetime.now()) + ": Start writing output...")         
    CreateDirIfDoesNotExist(dirname1)
    CreateSmallDataJSONFile(pointsDict, dirname1)
    print(str(datetime.now()) + ": Finished writing output.")
#endregion
         
#region Main

Workflow(args.coordinatesFile, args.metaDataFile, args.namesOfPropertiesFile, args.propertiesIntensitiesFile, args.baseDir)

#endregion
