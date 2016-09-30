#!/usr/bin/env python
#
# This script reads OMA Hierarchical Orthologous Groups (HOGS) in OrthoXML format and
# outputs tab-delimited files with OMA gene/protein IDs and HOGS using a hierarchical
# numbering scheme.
#
# Example input:
#   ...
#   <gene id="1" protId="hsa1" />
#   ...
#   <gene id="2" protId="ptr1" />
#   ...
#   <gene id="3" protId="mmu1" />
#   ...
#   <gene id="4" protId="mmu2" />
#   ...
#   <orthologGroup>
#     <orthologGroup>
#       <property name="TaxRange" value="Primates" />
#       <geneRef id="1" />
#       <geneRef id="2" />
#     </orthologGroup>
#     <paralogGroup>
#       <geneRef id="3" />
#       <geneRef id="4" />
#     </paralogGroup>
#   </orthologGroup>
#   ...
#
# Output: [hiercls_id] [metadata] [cls_mem_1] [cls_mem_2] ...
#
#   1.1	orthologGroup:Primates	hsa1	ptr1
#   1.2 paralogGroup	mmu1	mmu2		
#
# Author:  Arnold Kuzniar
# Version: 0.1
#

from lxml import etree
import sys


infile = sys.argv[1]
outfile_ids = 'oma-protids.txt'
outfile_grps = 'oma-hogs.txt'
max_depth = 0
cur_depth = 0
ORTHO_NS = 'http://orthoXML.org/2011/'
id2pid = dict()
cls_mem = dict()
cls_meta = dict()
cls_ids = [0]

# write output files
fout_ids = open(outfile_ids, 'w')
fout_grps = open(outfile_grps, 'w')

print 'InFile = %s' % infile

# parse XML file for specific tags/attributes:
# <gene>, <orthologGroup>, <paralogGroup>, <property>, <geneRef>
for evt, elem in etree.iterparse(infile, events=['start','end']):
   if elem.tag == '{%s}gene' % ORTHO_NS and evt == 'start':
      id, pid = elem.get('id'), elem.get('protId')
      #gid = elem.get('geneId')
      id2pid[id] = pid
 
      # write gene/protein list into file
      fout_ids.write('%s\t%s\n' % (id, id2pid[id]))

   if elem.tag == '{%s}orthologGroup' % ORTHO_NS or elem.tag == '{%s}paralogGroup' % ORTHO_NS:
      if evt == 'start':
         cls_ids[cur_depth] += 1
         cur_depth += 1

         if cur_depth > max_depth:
            max_depth = cur_depth

         cls_ids.append(0)
         cls_id = '.'.join([ str(id) for id in cls_ids[0:cur_depth]])

         if cls_id not in cls_mem:
            cls_mem[cls_id] = []

         if cls_id not in cls_meta:
            cls_meta[cls_id] = elem.tag.replace('{%s}' % ORTHO_NS, '')

      if evt == 'end':
         cur_depth -= 1
         cls_ids.pop()
         cls_id = '.'.join([ str(id) for id in cls_ids[0:cur_depth]])

   if elem.tag == '{%s}property' % ORTHO_NS:
      if elem.get('name') == 'TaxRange':
         meta = cls_meta[cls_id]
         if ':' not in meta:
            cls_meta[cls_id] = "%s:%s" % (meta, elem.get('value')) # [group_type]:[taxon]

   if elem.tag == '{%s}geneRef' % ORTHO_NS:
      if evt == 'start':
         if cls_id in cls_mem:
           cls_mem[cls_id].append(elem.get('id'))


# write HOGs members into file
for cls_id, mems in cls_mem.iteritems():
   cls_sz = len(mems)

   if cls_sz > 0:
      arr = [cls_id, cls_sz, cls_meta[cls_id]] + [ id2pid[id] for id in mems ]
      fout_grps.write('%s\n' % '\t'.join([ str(e) for e in arr ]))
#   else: # empty groups
#      fout_grps.write('%s\n' % cls_id)

fout_ids.close()
fout_grps.close()

print 'MaxTreeDepth = %d' % max_depth

