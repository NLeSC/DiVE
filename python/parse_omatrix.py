"""
Usage:
  parse_omatrix.py [-hv]
  parse_omatrix.py (-s|-d) DIR...

Arguments:
  DIR...            Input directory of data files (default: OMA.1.0.5/Cache/AllAll).

Options:
  -h --help
  -v --version
  -s --similarity   Output pairwise sequence similarities (Smith-Waterman).
  -d --distance     Output pairwise sequence distances (PAM).
"""

__author__  = 'Arnold Kuzniar'
__version__ = 0.1
__status__  = 'Prototype'
__license__ = 'Apache License, Version 2.0'

import os
import re
import gzip
from docopt import docopt


def read_matrix_file(fname):
    """Read sequence similarity/distance matrix file.

       :param fname: File name (e.g., SOLLC/SOLTU.gz).
       :type fname: str.
       :returns: list

       [20771, 4428, 141.9462445, 160, 174..324, 35..170, 388.887322]

       Metadata:
        1) sequential number of protein (as internal ID) in the first FASTA file (SOLLC.fa)
        2) sequential number of protein (as internal ID) in the second FASTA file (SOLTU.fa)
        3) Smith-Waterman (SW) score of the pairwise optimal alignment
        4) evolutionary distance in PAM
        5) alignment range in the first protein
        6) alignment range in the second protein
        7) estimate of variance of evolutionary distance
    """
    with gzip.open(fname, 'r') as f:
        for line in f:
            if line.startswith('[') is True:
                line = re.sub('[\[\]\s):]+', '', line).rstrip(',')
                vec = line.split(',')
                yield vec


def write_graph_file(filepath, mode):
    """Write graph in edge list form.

       :param filepath: Absolute path to file.
       :type filepath: str.
       :param mode: Graph output mode (True=similarites|False=distances)
       :type mode: bool.
    """
    dirname, fname = os.path.split(filepath)
    species_1, species_2 = os.path.basename(dirname), os.path.splitext(fname)[0]
    outfile = '%s-%s.graph' % (species_1, species_2)
    print i, outfile
    if os.path.isfile(outfile) is True:
        return

    with open(outfile, 'a') as fout:
        for vec in read_matrix(filepath):
            try:
                pid_1, pid_2, sw_score, pam_dist = vec[0:4]
                pid_1 = int(pid_1)
                pid_2 = int(pid_2)
                sw_score = float(sw_score)
                pam_dist = float(pam_dist)
                line = ''
                if mode is True: # similarities
                   line = '%s%05d\t%s%05d\t%.2f\n' % (species_1, pid_1, species_2, pid_2, sw_score)
                else: # distances
                   line = '%s%05d\t%s%05d\t%.2f\n' % (species_1, pid_1, species_2, pid_2, pam_dist)
                fout.write(line)
            except ValueError:
                pass

if __name__ == '__main__':
    args = docopt(__doc__, version=__version__)
    #print(args)
    matrix_file_pattern = '[A-Z]{5}.gz' # five-letters species acronym

    for dir in args['DIR']:
        for root, dirs, files in os.walk(dir):
            for fname in files:
                if re.search(matrix_file_pattern, fname):
                    filepath = os.path.join(root, fname)
                    write_graph_file(filepath, args['--similarity'])

