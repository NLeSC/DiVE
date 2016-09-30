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
   description = 'This script pre-processes a similarity file with logarithmization')

parser.add_argument(
   '-i',
   dest = 'inputFile',
   help = 'Input file containing a similarity graph in edge list format')

parser.add_argument(
   '-o',
   dest = 'outputFile',
   help = 'Output file containing a similarity graph in edge list format')


args = parser.parse_args()
#endregion
           


#region Reading and writing data


def ReadEdgesProcessAndWriteEdgesToFile(inputFile, outputFile):
    """File format: [id1] [id2] [similarity_score]"""      
    print("Reading...")   
    edgesList = []
    i=0   
    for line in fileinput.input([inputFile]):            
        if line != "\n":  
            items = line.split()
            id1 = items[0]    
            id2 = items[1] 
            sim = float(items[2])                             
            edgesList.append([id1, id2, sim])        
    maxim = 0
    print("Processing...") 
    for i in range(0, len(edgesList)):
        sim = edgesList[i][2]
        edgesList[i][2] = max(-math.log(sim, 2), 0) #turning similarities into distances with log. They should be non-negative, max(x,0) is there just in case
        maxim = max(maxim, edgesList[i][2])
    for i in range(0, len(edgesList)):
        edgesList[i][2] = edgesList[i][2]/maxim #normalizing distances to be from 0 to 1
    
    f = open(outputFile,'w')  
    print('Writing...')
    for i in range(0, len(edgesList)):
        distance = edgesList[i][2]
        similarity = 1-distance # back to similarities
        if (similarity >= 0):
            f.write(str(edgesList[i][0]) + " " +  str(edgesList[i][1]) +  " " + str(similarity)  + '\n')
    f.close() 
    print('Finished writing.')
#endregion 
    
 

#region Workflow

                       
def Workflow(inputFile, outputFile):   
    ReadEdgesProcessAndWriteEdgesToFile(inputFile, outputFile)   
    
#endregion
         
#region Main

Workflow(args.inputFile, args.outputFile)

#endregion
